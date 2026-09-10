import { test, expect } from '@playwright/test';
import { AutomationExecutor } from '../agent/AutomationExecutor';

test.describe('AutomationExecutor', () => {

    test('should execute a selected Playwright test case', async () => {

        const executor = new AutomationExecutor();

        const result = await executor.execute(
            'tests/TEST-1-login.spec.ts',
            'TC-003'
        );

        console.log(
            '[EXECUTION RESULT]',
            result
        );

        expect(result.status).toBe('PASSED');
        expect(result.output).toContain('passed');
    });

});