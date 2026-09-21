
import fs from 'fs';
import path from 'path';

import { test, expect } from '@playwright/test';

import { HistoricalFailureKnowledgeAgent } from '../agent/HistoricalFailureKnowledgeAgent';
import {
    HistoricalFailureStore,
    HistoricalFailureRecord,
} from '../utils/HistoricalFailureStore';

test.describe(
    'Historical Failure Knowledge Agent',
    () => {

        const testHistoryPath =
            path.resolve(
                process.cwd(),
                'qa-knowledge',
                'failure-history-agent-test.json'
            );

        test.beforeEach(
            () => {

                if (fs.existsSync(testHistoryPath)) {
                    fs.unlinkSync(
                        testHistoryPath
                    );
                }
            }
        );

        test.afterEach(
            () => {

                if (fs.existsSync(testHistoryPath)) {
                    fs.unlinkSync(
                        testHistoryPath
                    );
                }
            }
        );

        test(
            'should identify relevant historical failures',
            async () => {

                const store =
                    new HistoricalFailureStore(
                        testHistoryPath
                    );

                const historicalFailures:
                    HistoricalFailureRecord[] = [
                        {
                            testCaseId: 'TC-004',
                            testName:
                                'Verify Send OTP button',
                            testFile:
                                'tests/login/TEST-1-login.spec.ts',
                            errorMessage:
                                'Timeout waiting for Send OTP button',
                            failureType:
                                'TIMEOUT',
                            failedStep:
                                'Click Send OTP',
                            page:
                                'LoginPage',
                            environment:
                                'qa',
                            browser:
                                'chromium',
                            durationMs:
                                30000,
                            rootCause:
                                'OTP service timeout',
                            resolution:
                                'Retry after OTP service recovery',
                            retryResult:
                                'PASSED',
                            timestamp:
                                '2026-09-01T10:00:00.000Z',
                        },
                        {
                            testCaseId: 'TC-004',
                            testName:
                                'Verify Send OTP button',
                            testFile:
                                'tests/login/TEST-1-login.spec.ts',
                            errorMessage:
                                'Timeout waiting for Send OTP button',
                            failureType:
                                'TIMEOUT',
                            failedStep:
                                'Click Send OTP',
                            page:
                                'LoginPage',
                            environment:
                                'qa',
                            browser:
                                'chromium',
                            durationMs:
                                30000,
                            rootCause:
                                'OTP service timeout',
                            resolution:
                                'Retry after OTP service recovery',
                            retryResult:
                                'PASSED',
                            timestamp:
                                '2026-09-02T10:00:00.000Z',
                        },
                        {
                            testCaseId: 'TC-002',
                            testName:
                                'Validate mobile number',
                            testFile:
                                'tests/login/TEST-1-login.spec.ts',
                            errorMessage:
                                'Timeout waiting for mobile input',
                            failureType:
                                'TIMEOUT',
                            failedStep:
                                'Fill mobile number',
                            page:
                                'LoginPage',
                            environment:
                                'qa',
                            browser:
                                'chromium',
                            durationMs:
                                30000,
                            rootCause:
                                'Locator issue',
                            resolution:
                                'Updated locator',
                            retryResult:
                                'PASSED',
                            timestamp:
                                '2026-09-03T10:00:00.000Z',
                        },
                    ];

                store.saveMany(
                    historicalFailures
                );

                const currentFailure = {
                    testCaseId:
                        'TC-004',
                    testName:
                        'Verify Send OTP button',
                    testFile:
                        'tests/login/TEST-1-login.spec.ts',
                    errorMessage:
                        'Timeout waiting for Send OTP button',
                    failureType:
                        'TIMEOUT',
                    failedStep:
                        'Click Send OTP',
                    page:
                        'LoginPage',
                    environment:
                        'qa',
                    browser:
                        'chromium',
                    durationMs:
                        30000,
                };

                const agent =
                    new HistoricalFailureKnowledgeAgent(
                        store
                    );

                const decision =
                    await agent.analyze(
                        currentFailure
                    );

                console.log(
                    '\nHistorical Failure Decision:',
                    JSON.stringify(
                        decision,
                        null,
                        2
                    )
                );

                expect(
                    decision.matchType
                ).toBeTruthy();

                expect(
                    Array.isArray(
                        decision.relevantFailures
                    )
                ).toBeTruthy();

                expect(
                    typeof decision.confidence
                ).toBe('number');

                expect(
                    decision.confidence
                ).toBeGreaterThanOrEqual(0);

                expect(
                    decision.confidence
                ).toBeLessThanOrEqual(1);

                expect(
                    decision.summary
                ).toBeTruthy();
            }
        );

        test(
            'should return no relevant history when store has no matching failures',
            async () => {

                const store =
                    new HistoricalFailureStore(
                        testHistoryPath
                    );

                const historicalFailure:
                    HistoricalFailureRecord = {
                        testCaseId:
                            'TC-002',
                        testName:
                            'Validate mobile number',
                        testFile:
                            'tests/login/TEST-1-login.spec.ts',
                        errorMessage:
                            'Timeout waiting for mobile input',
                        failureType:
                            'TIMEOUT',
                        failedStep:
                            'Fill mobile number',
                        page:
                            'LoginPage',
                        environment:
                            'qa',
                        browser:
                            'chromium',
                        durationMs:
                            30000,
                        rootCause:
                            'Locator issue',
                        resolution:
                            'Updated locator',
                        retryResult:
                            'PASSED',
                        timestamp:
                            '2026-09-03T10:00:00.000Z',
                    };

                store.save(
                    historicalFailure
                );

                const currentFailure = {
                    testCaseId:
                        'TC-004',
                    testName:
                        'Verify Send OTP button',
                    testFile:
                        'tests/login/TEST-1-login.spec.ts',
                    errorMessage:
                        'Timeout waiting for Send OTP button',
                    failureType:
                        'TIMEOUT',
                    failedStep:
                        'Click Send OTP',
                    page:
                        'LoginPage',
                    environment:
                        'qa',
                    browser:
                        'chromium',
                    durationMs:
                        30000,
                };

                const agent =
                    new HistoricalFailureKnowledgeAgent(
                        store
                    );

                const decision =
                    await agent.analyze(
                        currentFailure
                    );

                console.log(
                    '\nNo History Decision:',
                    JSON.stringify(
                        decision,
                        null,
                        2
                    )
                );

                expect(
                    decision.matchType
                ).toBe(
                    'NO_RELEVANT_HISTORY'
                );

                expect(
                    decision.relevantFailures
                ).toEqual([]);

                expect(
                    decision.recurringPattern
                ).toBe(false);

                expect(
                    decision.confidence
                ).toBe(0);
            }
        );
    }
);
