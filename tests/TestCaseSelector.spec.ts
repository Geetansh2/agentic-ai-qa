import { test, expect } from '@playwright/test';
import { TestCaseSelector } from '../utils/TestCaseSelector';
import { TestCaseLoader } from '../utils/TestCaseLoader';

test.describe('TestCaseSelector', () => {

    test('should select exactly one test case from TEST-1', async () => {

        const testCaseJson = TestCaseLoader.load('TEST-1');

        const testCaseData = JSON.parse(testCaseJson);

        const selector = new TestCaseSelector();

        const selected = await selector.select(
            testCaseData.testCases
        );

        console.log(
            'SELECTED TEST CASE:',
            selected
        );

        expect(selected.status).toBeTruthy();
        expect(selected.reason).toBeTruthy();

        expect(selected.status).toBe('SELECTED');

        if (selected.status === 'SELECTED') {

            expect(selected.testCase.id).toBeTruthy();

            expect(
                testCaseData.testCases.some(
                    (testCase: any) =>
                        testCase.id === selected.testCase.id
                )
            ).toBeTruthy();
        }
    });
});