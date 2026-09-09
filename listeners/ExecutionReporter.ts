import type {
    Reporter,
    TestCase,
    TestResult,
    FullResult,
} from '@playwright/test/reporter';

class ExecutionReporter implements Reporter {

    onTestBegin(test: TestCase) {
        console.log(
            `[REPORTER] STARTED: ${test.title}`
        );
    }

    onTestEnd(test: TestCase, result: TestResult) {
        console.log(
            `[REPORTER] FINISHED: ${test.title} | ` +
            `Status: ${result.status} | ` +
            `Duration: ${result.duration}ms`
        );

        if (result.status === 'failed') {
            console.log(
                `[REPORTER] FAILED: ${test.title}`
            );

            if (result.error) {
                console.log(
                    `[REPORTER] ERROR: ${result.error.message}`
                );
            }
        }
    }

    onEnd(result: FullResult) {
        console.log(
            `[REPORTER] TEST RUN FINISHED: ${result.status}`
        );
    }
}

export default ExecutionReporter;