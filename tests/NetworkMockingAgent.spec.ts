import { test, expect } from '@playwright/test';

import {
NetworkMockingAgent,
} from '../agent/NetworkMockingAgent';

test.describe('NetworkMockingAgent', () => {


test('should decide whether network mocking is required', async () => {

    const agent =
        new NetworkMockingAgent();

    const decision =
        await agent.decide({

            id: 'TC-NETWORK-001',

            title:
                'Display error when Send OTP API returns server error',

            preconditions: [
                'Login page is loaded',
            ],

            steps: [
                'Enter a valid mobile number',
                'Accept Terms & Conditions',
                'Trigger Send OTP',
                'Simulate Send OTP API returning HTTP 500',
                'Verify the error message is displayed',
            ],

            expectedResult:
                'A suitable error message is displayed when the Send OTP API returns HTTP 500.',

            priority: 'Medium',

            type: 'negative',

            automationStatus:
                'Automatable',
        });

    console.log(
        '\n[NETWORK MOCKING DECISION]'
    );

    console.log(
        JSON.stringify(
            decision,
            null,
            2
        )
    );

    expect(
        decision.decision
    ).toBeTruthy();

    expect(
        [
            'NO_MOCK',
            'MOCK_RESPONSE',
            'MOCK_FAILURE',
            'MOCK_DELAY',
            'MOCK_NETWORK_ERROR',
        ]
    ).toContain(
        decision.decision
    );

    expect(
        decision.reason
    ).toBeTruthy();
});

test('should decide whether network mocking is required1', async () => {

    const agent =
        new NetworkMockingAgent();

    const decision =
        await agent.decide({

            id: 'TC-NETWORK-001',

            title:
                'Display error when Send OTP API returns server error',

            preconditions: [
                'Login page is loaded',
            ],

            steps: [
                'Enter a valid mobile number',
                'Accept Terms & Conditions',
                'Trigger Send OTP',
                'Simulate Send OTP API returning HTTP 500',
                'Verify the error message is displayed',
            ],

            expectedResult:
                'A suitable error message is displayed when the Send OTP API returns HTTP 500.',

            priority: 'Medium',

            type: 'negative',

            automationStatus:
                'Automatable',
        });

    console.log(
        '\n[NETWORK MOCKING DECISION]'
    );

    console.log(
        JSON.stringify(
            decision,
            null,
            2
        )
    );

    expect(
        decision.decision
    ).toBeTruthy();

    expect(
        [
            'NO_MOCK',
            'MOCK_RESPONSE',
            'MOCK_FAILURE',
            'MOCK_DELAY',
            'MOCK_NETWORK_ERROR',
        ]
    ).toContain(
        decision.decision
    );

    expect(
        decision.reason
    ).toBeTruthy();
});

});
