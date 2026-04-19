const fs = require('fs');
const path = require('path');

const originalPath = path.join(process.cwd(), 'assets', 'questions', 'Pictures', '/doktore.avif');
console.log('Path with leading slash:', originalPath);
console.log('Exists:', fs.existsSync(originalPath));
if (fs.existsSync(originalPath)) {
    console.log('Is File:', fs.statSync(originalPath).isFile());
}
