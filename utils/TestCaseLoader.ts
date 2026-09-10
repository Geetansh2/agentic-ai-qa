import fs from 'fs';
import path from 'path';

export class TestCaseLoader {

    static load(jiraIssueKey: string): string {

        const filePath = path.resolve(
            process.cwd(),
            'test-cases',
            `${jiraIssueKey}.json`
        );

        if (!fs.existsSync(filePath)) {
            throw new Error(
                `Test case file not found: ${filePath}`
            );
        }

        return fs.readFileSync(filePath, 'utf-8');
    }
}