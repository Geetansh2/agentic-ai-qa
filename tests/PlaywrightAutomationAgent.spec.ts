
import { test, expect } from '@playwright/test';

import {
    PlaywrightAutomationAgent,
} from '../agent/PlaywrightAutomationAgent';

test.describe('PlaywrightAutomationAgent', () => {

    test('should generate automation using Playwright Skill', async () => {

        const agent =
            new PlaywrightAutomationAgent();

        const proposal =
            await agent.generate({
                jiraIssueKey: 'TEST-1',

                testCaseId: 'TC-009',

                testCase: {
                    id: 'TC-009',

                    title:
                        'Terms & Conditions link points to the expected URL',

                    preconditions: [
                        'Login page is loaded',
                    ],

                    testData: {},

                    steps: [
                        "Locate the 'Terms & Conditions' link",
                        'Verify its href attribute without navigating away',
                    ],

                    expectedResult:
                        "Link href is 'https://in.zoworld.app/ed-tech/terms&condition'.",

                    priority: 'Low',

                    type: 'positive',

                    automationStatus:
                        'Automatable',
                },

                strategy: 'ui-only',

                executionType: 'ui',

                components: [
                    'Page Object',
                    'Business Flow',
                    'Playwright Test',
                ],
            });

        console.log(
            '\n[GENERATED PLAYWRIGHT PROPOSAL]'
        );

        console.log(
            JSON.stringify(
                proposal,
                null,
                2
            )
        );

        /*
         * Validate test case
         */
        expect(
            proposal.testCaseId
        ).toBe('TC-009');

        /*
         * Validate target file
         */
        expect(
            proposal.file
        ).toBe(
            'tests/TEST-1-login.spec.ts'
        );

        /*
         * Validate generated code
         */
        expect(
            proposal.code
        ).toContain('TC-009');

        expect(
            proposal.code
        ).toContain('expect');

        /*
         * Validate proposal reason
         */
        expect(
            proposal.reason
        ).toBeTruthy();

    });

});

