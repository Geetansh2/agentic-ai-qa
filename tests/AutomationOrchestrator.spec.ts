import { test, expect } from '@playwright/test';
import { AutomationOrchestrator } from '../utils/AutomationOrchestrator';
import { TestCaseLoader } from '../utils/TestCaseLoader';

test.describe('AutomationOrchestrator', () => {

    test('should create automation plan for TEST-1', async () => {

        const testCase = TestCaseLoader.load('TEST-1');

        const orchestrator = new AutomationOrchestrator();

        const plan = await orchestrator.createPlan(testCase);

        console.log('FINAL AUTOMATION PLAN:', plan);

        expect(plan.strategy).toBeTruthy();
        expect(plan.executionType).toBeTruthy();
        expect(plan.components.length).toBeGreaterThan(0);
    });
});