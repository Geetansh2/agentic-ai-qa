import { test, expect } from '@playwright/test';
import { TestAutomationRegistry } from '../utils/TestAutomationRegistry';

test.describe('TestAutomationRegistry', () => {

    const registry = new TestAutomationRegistry();

    test('should detect automated test cases', () => {

        expect(
            registry.isAutomated('TC-001')
        ).toBeTruthy();

        expect(
            registry.isAutomated('TC-002')
        ).toBeTruthy();

        expect(
            registry.isAutomated('TC-004')
        ).toBeTruthy();

        expect(
            registry.isAutomated('TC-005')
        ).toBeTruthy();

        expect(
            registry.isAutomated('TC-006')
        ).toBeTruthy();
    });

    test('should identify a test case that is not automated', () => {

        expect(
            registry.isAutomated('TC-999')
        ).toBeFalsy();
    });
});