import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

export type AutomationExecutionResult = {
    status: 'PASSED' | 'FAILED';
    output: string;
};

export class AutomationExecutor {

    async execute(
        testFile: string,
        testCaseId: string
    ): Promise<AutomationExecutionResult> {

        console.log(
            `[AUTOMATION EXECUTOR] Executing ${testCaseId}`
        );

        const command =
            `npx playwright test ${testFile} ` +
            `-g "${testCaseId}" ` +
            `--project=chromium ` +
            `--workers=1`;

        console.log(
            `[AUTOMATION EXECUTOR] Command: ${command}`
        );

        try {

            const { stdout, stderr } =
                await execAsync(command);

            console.log(stdout);

            return {
                status: 'PASSED',
                output: stdout + stderr,
            };

        } catch (error: any) {

            const output =
                (error.stdout || '') +
                (error.stderr || '');

            console.log(output);

            return {
                status: 'FAILED',
                output,
            };
        }
    }
}