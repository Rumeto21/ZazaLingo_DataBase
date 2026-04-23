/**
 * CurriculumHandler
 * Orchestrates test saving via CurriculumManager.
 * Implements SOLID (DIP, SRP)
 */
class CurriculumHandler {
    constructor(curriculumManager) {
        this.manager = curriculumManager;
    }

    async save(tests, context = {}) {
        const { stations, curriculumDir, archiveDir } = context;
        if (!curriculumDir || !archiveDir) {
            return { success: false, errors: ['Missing curriculumDir or archiveDir in context'] };
        }
        return await this.manager.saveTests(curriculumDir, stations, tests, archiveDir);
    }
}

module.exports = CurriculumHandler;
