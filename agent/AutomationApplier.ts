
import fs from 'fs';
import path from 'path';

import {
    PlaywrightAutomationProposal,
} from './PlaywrightAutomationAgent';

export class AutomationApplier {

    private readonly projectRoot: string;

    constructor() {
        this.projectRoot = process.cwd();
    }

    apply(
        proposal: PlaywrightAutomationProposal
    ): void {

        console.log(
            `\n[AUTOMATION APPLIER] ` +
            `Applying ${proposal.testCaseId}`
        );

        const targetPath =
            this.resolveTargetPath(
                proposal.file
            );

        /*
         * Do not overwrite an existing test case.
         */
        if (fs.existsSync(targetPath)) {

            const existingContent =
                fs.readFileSync(
                    targetPath,
                    'utf-8'
                );

            if (
                existingContent.includes(
                    proposal.testCaseId
                )
            ) {

                throw new Error(
                    `[AUTOMATION APPLIER] ` +
                    `${proposal.testCaseId} already exists in ` +
                    `${proposal.file}`
                );
            }

            /*
             * Add only the generated test.
             */
            const updatedContent =
                this.addTest(
                    existingContent,
                    proposal.code
                );

            fs.writeFileSync(
                targetPath,
                updatedContent,
                'utf-8'
            );

            console.log(
                `[AUTOMATION APPLIER] ` +
                `Added ${proposal.testCaseId} to ` +
                `${proposal.file}`
            );

            return;
        }

        /*
         * Target file does not exist.
         *
         * Create a minimal Playwright file.
         */
        const newFileContent =
            this.createTestFile(
                proposal
            );

        fs.mkdirSync(
            path.dirname(targetPath),
            {
                recursive: true,
            }
        );

        fs.writeFileSync(
            targetPath,
            newFileContent,
            'utf-8'
        );

        console.log(
            `[AUTOMATION APPLIER] ` +
            `Created ${proposal.file}`
        );
    }

    private resolveTargetPath(
        targetFile: string
    ): string {

        if (
            targetFile.startsWith('/')
        ) {

            throw new Error(
                `Target file must be project-relative: ${targetFile}`
            );
        }

        const targetPath =
            path.resolve(
                this.projectRoot,
                targetFile
            );

        const relativePath =
            path.relative(
                this.projectRoot,
                targetPath
            );

        /*
         * Prevent writing outside the project.
         */
        if (
            relativePath.startsWith('..') ||
            path.isAbsolute(relativePath)
        ) {

            throw new Error(
                `Invalid target path: ${targetFile}`
            );
        }

        /*
         * Automation must live under tests/.
         */
        if (
            !relativePath.startsWith(
                `tests${path.sep}`
            )
        ) {

            throw new Error(
                `Automation must be created under tests/: ` +
                `${targetFile}`
            );
        }

        return targetPath;
    }

    private addTest(
        existingContent: string,
        generatedCode: string
    ): string {

        const existing =
            existingContent.trimEnd();

        const generated =
            generatedCode.trim();

        return (
            `${existing}\n\n` +
            `${generated}\n`
        );
    }

    private createTestFile(
        proposal: PlaywrightAutomationProposal
    ): string {

        return `import { test, expect } from '../fixtures/test.fixture';

${proposal.code}
`;
    }
}

