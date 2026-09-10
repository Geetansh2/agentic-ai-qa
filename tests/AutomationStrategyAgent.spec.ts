import { test, expect } from '@playwright/test';
import { AutomationStrategyAgent } from '../utils/AutomationStrategyAgent';

test.describe('AutomationStrategyAgent', () => {

    const agent = new AutomationStrategyAgent();

    test('should select UI-only strategy', () => {
        const result = agent.decide(
            'Verify that the login page displays the mobile number field and Send OTP button.'
        );

        expect(result.strategy).toBe('ui-only');
    });

    test('should select API-only strategy', () => {
        const result = agent.decide(
            'Verify the login API endpoint returns a successful response.'
        );

        expect(result.strategy).toBe('api-only');
    });

    test('should select API + UI hybrid strategy', () => {
        const result = agent.decide(
            'Use the API to send OTP and verify the result through the UI.'
        );

        expect(result.strategy).toBe('api-ui-hybrid');
    });
});