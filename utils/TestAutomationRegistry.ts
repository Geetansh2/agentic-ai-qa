import fs from 'fs';
import path from 'path';

export class TestAutomationRegistry {

    private readonly testsDirectory: string;

    constructor() {
        this.testsDirectory = path.resolve(
            process.cwd(),
            'tests'
        );
    }

    isAutomated(testCaseId: string): boolean {

        if (!fs.existsSync(this.testsDirectory)) {
            return false;
        }

        const testFiles = fs
            .readdirSync(this.testsDirectory)
            .filter(file =>
                file.endsWith('.spec.ts')
            );

        for (const file of testFiles) {

            const filePath = path.join(
                this.testsDirectory,
                file
            );

            const content = fs.readFileSync(
                filePath,
                'utf-8'
            );

            if (
                content.includes(testCaseId)
            ) {
                return true;
            }
        }

        return false;
    }
}