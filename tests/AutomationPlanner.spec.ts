import { test, expect } from '@playwright/test';
import { AutomationPlanner } from '../utils/AutomationPlanner';

test.describe('AutomationPlanner', () => {

    const planner = new AutomationPlanner();

    test('should create a UI-only automation plan', async () => {
        const decision = await planner.plan(
            'Verify that the login page displays the mobile number field and Send OTP button.'
        );

        console.log('Automation Plan:', decision);

        expect(decision.strategy).toBe('ui-only');
        expect(decision.reason).toBeTruthy();
    });

    test('should create an API-only automation plan', async () => {
        const decision = await planner.plan(
            'Verify the login API endpoint returns a successful response.'
        );

        console.log('Automation Plan:', decision);

        expect(decision.strategy).toBe('api-only');
        expect(decision.reason).toBeTruthy();
    });

    test('should create an API + UI hybrid automation plan', async () => {
        const decision = await planner.plan(
            'Use the API to send OTP and verify the result through the UI.'
        );

        console.log('Automation Plan:', decision);

        expect(decision.strategy).toBe('api-ui-hybrid');
        expect(decision.reason).toBeTruthy();
    });
});