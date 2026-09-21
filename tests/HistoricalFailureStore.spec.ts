import { test, expect } from '@playwright/test';
import fs from 'fs';
import path from 'path';

import {
HistoricalFailureStore,
HistoricalFailureRecord,
} from '../utils/HistoricalFailureStore';

test(
'Historical Failure Store',
async () => {


    const testStorePath =
        path.resolve(
            process.cwd(),
            'qa-knowledge',
            'failure-history-test.json'
        );

    if (fs.existsSync(testStorePath)) {
        fs.unlinkSync(testStorePath);
    }

    const store =
        new HistoricalFailureStore(
            testStorePath
        );

    const failure: HistoricalFailureRecord = {
        testCaseId: 'TC-004',
        testName:
            'Verify Send OTP button',
        testFile:
            'tests/login/TEST-1-login.spec.ts',
        errorMessage:
            'Timeout waiting for Send OTP button',
        failureType: 'TIMEOUT',
        failedStep:
            'Click Send OTP',
        page: 'LoginPage',
        environment: 'qa',
        browser: 'chromium',
        durationMs: 30000,
        rootCause:
            'OTP service timeout',
        resolution:
            'Retry after service recovery',
        retryResult: 'PASSED',
        timestamp:
            '2026-09-18T10:00:00Z',
    };

    // ----------------------------------------
    // SAVE
    // ----------------------------------------

    store.save(failure);

    expect(
        fs.existsSync(
            testStorePath
        )
    ).toBe(true);

    // ----------------------------------------
    // LOAD
    // ----------------------------------------

    const loaded =
        store.load();

    expect(
        loaded.length
    ).toBe(1);

    expect(
        loaded[0]!.testCaseId
    ).toBe('TC-004');

    expect(
        loaded[0]!.errorMessage
    ).toBe(
        'Timeout waiting for Send OTP button'
    );

    // ----------------------------------------
    // FIND BY TEST CASE
    // ----------------------------------------

    const byTestCase =
        store.findByTestCase(
            'TC-004'
        );

    expect(
        byTestCase.length
    ).toBe(1);

    expect(
        byTestCase[0]!.testCaseId
    ).toBe('TC-004');

    // ----------------------------------------
    // FIND BY ERROR MESSAGE
    // ----------------------------------------

    const byError =
        store.findByErrorMessage(
            'Timeout waiting for Send OTP button'
        );

    expect(
        byError.length
    ).toBe(1);

    expect(
        byError[0]!.testCaseId
    ).toBe('TC-004');

    // ----------------------------------------
    // FIND RELEVANT
    // ----------------------------------------

    const relevant =
        store.findRelevant(
            'TC-004',
            'Timeout waiting for Send OTP button'
        );

    expect(
        relevant.length
    ).toBe(1);

    expect(
        relevant[0]!.testCaseId
    ).toBe('TC-004');

    // ----------------------------------------
    // SAVE SECOND FAILURE
    // ----------------------------------------

    store.save({
        ...failure,
        testCaseId: 'TC-005',
        testName:
            'Verify invalid mobile number',
        errorMessage:
            'Locator timeout waiting for mobile input',
        failedStep:
            'Fill mobile number',
        page: 'LoginPage',
        timestamp:
            '2026-09-18T10:05:00Z',
    });

    const allFailures =
        store.load();

    expect(
        allFailures.length
    ).toBe(2);

    // ----------------------------------------
    // FIND RELEVANT AGAIN
    // ----------------------------------------

    const tc004Failures =
        store.findByTestCase(
            'TC-004'
        );

    expect(
        tc004Failures.length
    ).toBe(1);

    const tc005Failures =
        store.findByTestCase(
            'TC-005'
        );

    expect(
        tc005Failures.length
    ).toBe(1);

    // ----------------------------------------
    // CLEAR
    // ----------------------------------------

    // store.clear();

    // const afterClear =
    //     store.load();

    // expect(
    //     afterClear.length
    // ).toBe(0);

    // ----------------------------------------
    // CLEANUP
    // ----------------------------------------

    // if (fs.existsSync(testStorePath)) {
    //     fs.unlinkSync(testStorePath);
    // }

    // const directory =
    //     path.dirname(
    //         testStorePath
    //     );

    // const remainingFiles =
    //     fs.existsSync(directory)
    //         ? fs.readdirSync(directory)
    //         : [];

    // if (
    //     remainingFiles.length === 0 &&
    //     fs.existsSync(directory)
    // ) {
    //     fs.rmdirSync(directory);
    // }

    console.log(
        '\n[TEST] Historical Failure Store: PASSED'
    );
}


);
