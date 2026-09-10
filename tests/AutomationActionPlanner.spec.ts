import { test, expect } from '@playwright/test';
import { AutomationActionPlanner } from '../utils/AutomationActionPlanner';

test.describe('AutomationActionPlanner', () => {

    const planner = new AutomationActionPlanner();

    test('should plan UI-only automation', () => {

        const plan = planner.plan({
            strategy: 'ui-only',
            reason: 'The scenario only requires UI validation.',
        });

        console.log('UI Plan:', plan);

        expect(plan.executionType).toBe('ui');
        expect(plan.components).toContain('Page Object');
        expect(plan.components).toContain('Business Flow');
    });

    test('should plan API-only automation', () => {

        const plan = planner.plan({
            strategy: 'api-only',
            reason: 'The scenario only requires API validation.',
        });

        console.log('API Plan:', plan);

        expect(plan.executionType).toBe('api');
        expect(plan.components).toContain('ApiClient');
    });

    test('should plan API + UI hybrid automation', () => {

        const plan = planner.plan({
            strategy: 'api-ui-hybrid',
            reason: 'The scenario requires API and UI validation.',
        });

        console.log('Hybrid Plan:', plan);

        expect(plan.executionType).toBe('hybrid');
        expect(plan.components).toContain('API Service');
        expect(plan.components).toContain('Page Object');
        expect(plan.components).toContain('Business Flow');
    });
});