const fs = require('fs');
const path = require('path');
const http = require('http');

const API_VERSION = 'http://localhost:4000';
const API_KEY = 'zaza_dev_secret_2026';

const DB_DATA_DIR = path.resolve(__dirname, '../data');
const APP_DATA_DIR = path.resolve(__dirname, '../../ZazaLingo/data');

/**
 * Helper to make HTTP POST requests
 */
async function postRequest(endpoint, payload) {
    return new Promise((resolve, reject) => {
        const url = new URL(endpoint, API_VERSION);
        const options = {
            hostname: url.hostname,
            port: url.port,
            path: url.pathname,
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-API-KEY': API_KEY
            }
        };

        const req = http.request(options, (res) => {
            let data = '';
            res.on('data', chunk => data += chunk);
            res.on('end', () => {
                try {
                    resolve({
                        statusCode: res.statusCode,
                        body: data ? JSON.parse(data) : {}
                    });
                } catch (e) {
                    resolve({
                        statusCode: res.statusCode,
                        raw: data
                    });
                }
            });
        });

        req.on('error', reject);
        if (payload) {
            req.write(JSON.stringify(payload));
        }
        req.end();
    });
}

/**
 * Helper to check file contents
 */
function getFileContent(dir, relativePath) {
    const filePath = path.join(dir, relativePath);
    if (!fs.existsSync(filePath)) return null;
    return fs.readFileSync(filePath, 'utf-8');
}

async function runTests() {
    console.log('🚀 Starting DataBase Synchronization & Integrity Tests...\n');

    // --- TEST 1: Synchronization (Success Path) ---
    console.log('--- Test 1: Sync Verification (Stations) ---');
    const testStations = [
        { id: 'test_station_1', zazaName: 'Test', trName: 'Test', x: 10, y: 20, type: 'station' }
    ];

    const saveResult = await postRequest('/save', { stations: testStations });
    
    if (saveResult.statusCode === 200 && saveResult.body.success) {
        console.log('✅ Save request successful.');
        
        const dbContent = getFileContent(DB_DATA_DIR, 'map/stations.ts');
        const appContent = getFileContent(APP_DATA_DIR, 'map/stations.ts');

        // Normalize line endings for comparison as the server preserves existing endings
        const dbNorm = dbContent ? dbContent.replace(/\r/g, '') : null;
        const appNorm = appContent ? appContent.replace(/\r/g, '') : null;

        if (dbNorm && appNorm && dbNorm === appNorm) {
            console.log('✅ SUCCESS: DB and App files are in logical sync.');
            if (dbNorm.includes('test_station_1')) {
                console.log('✅ SUCCESS: Data correctly injected into TS export.');
            } else {
                console.warn('❌ FAILURE: Data not found in file content.');
            }
        } else {
            console.error('❌ FAILURE: Files are missing or out of sync!');
        }
    } else {
        console.error('❌ FAILURE: Save request failed:', saveResult.statusCode, saveResult.body);
    }

    // --- TEST 2: Schema Validation (Faulty Data) ---
    console.log('\n--- Test 2: Integrity Verification (Faulty Data) ---');
    const invalidPayload = { stations: "I should be an array, not a string!" };
    const invalidResult = await postRequest('/save', invalidPayload);

    if (invalidResult.statusCode === 400) {
        console.log('✅ SUCCESS: Server correctly blocked schema violation (400 Bad Request).');
        console.log('   Errors reported:', invalidResult.body.errors);
    } else {
        console.error('❌ FAILURE: Server should have blocked this request but returned:', invalidResult.statusCode);
    }

    // --- TEST 3: Syntax Error (Invalid JSON body - handled by http/Server) ---
    console.log('\n--- Test 3: Robustness (Malformed JSON) ---');
    // Manual raw request for malformed JSON
    const malformedPromise = new Promise((resolve) => {
        const req = http.request({
            hostname: 'localhost',
            port: 4000,
            path: '/save',
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'X-API-KEY': API_KEY }
        }, (res) => {
            resolve(res.statusCode);
        });
        req.on('error', () => resolve('error'));
        req.write('{ "broken": json '); // Missing closing brace and invalid value
        req.end();
    });
    const malformedStatus = await malformedPromise;
    if (malformedStatus === 500 || malformedStatus === 400) {
        console.log(`✅ SUCCESS: Server handled malformed JSON gracefully with status ${malformedStatus}.`);
    } else {
        console.error('❌ FAILURE: Server responded unexpectedly to malformed JSON:', malformedStatus);
    }

    // --- TEST 4: Curriculum Hierarchy Sync ---
    console.log('\n--- Test 4: Curriculum Sync Verification ---');
    const testPayload = {
        stations: [
            { id: 'UNIT_TEST', unitIndex: 99, type: 'station' },
            { id: 'TOPIC_TEST', parentUnitId: 'UNIT_TEST', zazaName: 'SyncTest', testIds: ['TEST_SYNC_A'], type: 'topic' }
        ],
        tests: {
            'TEST_SYNC_A': { id: 'TEST_SYNC_A', questions: [] }
        }
    };

    const curriculumResult = await postRequest('/save', testPayload);
    if (curriculumResult.statusCode === 200) {
        // Path should be: curriculum/Unite_99/SyncTest/test_sync_a.ts
        const relPath = 'curriculum/Unite_99/SyncTest/test_sync_a.ts';
        const dbContent = getFileContent(DB_DATA_DIR, relPath);
        const appContent = getFileContent(APP_DATA_DIR, relPath);

        if (dbContent && appContent && dbContent.replace(/\r/g, '') === appContent.replace(/\r/g, '')) {
            console.log('✅ SUCCESS: Deep curriculum file sync works perfectly (normalized).');
        } else {
            console.error('❌ FAILURE: Curriculum files missing or out of sync!');
            console.log('   DB exists:', !!dbContent, 'App exists:', !!appContent);
        }
    } else {
        console.error('❌ FAILURE: Curriculum save failed:', curriculumResult.statusCode);
    }

    // --- TEST 5: Backup Verification ---
    console.log('\n--- Test 5: Backup Verification ---');
    const backupDir = path.join(DB_DATA_DIR, 'backups');
    const backups = fs.readdirSync(backupDir);
    const hasNewBackup = backups.some(b => b.includes('stations.ts') && b.endsWith('.bak'));
    
    if (hasNewBackup) {
        console.log('✅ SUCCESS: Backup file found in backups/ directory.');
    } else {
        console.error('❌ FAILURE: No backup found for stations.ts!');
    }

    console.log('\n🏁 Tests Completed.');
}

runTests().catch(err => {
    console.error('💥 Test Suite crashed:', err);
    process.exit(1);
});
