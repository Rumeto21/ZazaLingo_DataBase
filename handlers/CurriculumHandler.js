class CurriculumHandler {
    constructor(curriculumManager) {
        this.manager = curriculumManager;
    }

    async save(tests, { stations, curriculumDir, archiveDir }) {
        return await this.manager.saveTests(curriculumDir, stations, tests, archiveDir);
    }
}

module.exports = CurriculumHandler;
