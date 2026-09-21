
import { test, expect } from '@playwright/test';

import {
    FlakyTestDetectionAgent,
} from '../agent/FlakyTestDetectionAgent';

test(
    'Flaky Test Detection Agent',
    async () => {

        const agent =
            new FlakyTestDetectionAgent();

        const executionHistory = [

            {
                run: 1,
                status: 'PASSED',
                durationMs: 1200,
            },

            {
                run: 2,
                status: 'FAILED',
                durationMs: 1180,
                error:
                    'Timeout waiting for Send OTP button',
            },

            {
                run: 3,
                status: 'PASSED',
                durationMs: 1210,
            },

            {
                run: 4,
                status: 'PASSED',
                durationMs: 1190,
            },

            {
                run: 5,
                status: 'FAILED',
                durationMs: 1205,
                error:
                    'Timeout waiting for Send OTP button',
            },

        ];

        const decision =
            await agent.analyze(
                'TC-NETWORK-001',
                executionHistory
            );

        console.log(
            '\n[TEST] Flaky Test Decision:'
        );

        console.log(
            JSON.stringify(
                decision,
                null,
                2
            )
        );

        expect(
            decision.classification
        ).toBeTruthy();

        expect(
            decision.reason
        ).toBeTruthy();

        expect(
            decision.confidence
        ).toBeGreaterThanOrEqual(0);

        expect(
            decision.confidence
        ).toBeLessThanOrEqual(1);

        expect(
            Array.isArray(
                decision.signals
            )
        ).toBe(true);
    }
);

