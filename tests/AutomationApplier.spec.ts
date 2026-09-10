
import fs from 'fs';
import path from 'path';

import { test, expect } from '@playwright/test';

import { AutomationApplier } from '../agent/AutomationApplier';
import {
    PlaywrightAutomationProposal,
} from '../agent/PlaywrightAutomationAgent';

test.describe('AutomationApplier', () => {

    test('should append generated test without overwriting existing tests', async () => {

        const applier = new AutomationApplier();

        const temporaryFile = path.resolve(
            process.cwd(),
            'tests',
            '__AutomationApplierTest__.spec.ts'
        );

        const originalContent = `
import { test, expect } from '../fixtures/test.fixture';

test('TC-EXISTING - existing test', async ({ page }) => {
    await page.goto('/');
    expect(page).toBeTruthy();
});
`.trim();

        fs.writeFileSync(
            temporaryFile,
            originalContent,
            'utf-8'
        );

        const proposal: PlaywrightAutomationProposal = {
            file: 'tests/__AutomationApplierTest__.spec.ts',
            testCaseId: 'TC-009',
            code: `
test('TC-009 - Terms & Conditions link points to the expected URL', async ({ page }) => {
    const termsLink = page.getByRole('link', {
        name: /terms.*conditions/i,
    });

    await expect(termsLink).toHaveAttribute(
        'href',
        'https://in.zoworld.app/ed-tech/terms&condition'
    );
});
`.trim(),
            reason: 'Verify the Terms & Conditions link href.',
        };

        try {
            applier.apply(proposal);

            const updatedContent = fs.readFileSync(
                temporaryFile,
                'utf-8'
            );

            expect(updatedContent).toContain('TC-EXISTING');
            expect(updatedContent).toContain('TC-009');
            expect(updatedContent).toContain(
                'Terms & Conditions link points to the expected URL'
            );

            const existingIndex =
                updatedContent.indexOf('TC-EXISTING');

            const generatedIndex =
                updatedContent.indexOf('TC-009');

            expect(existingIndex).toBeGreaterThanOrEqual(0);
            expect(generatedIndex).toBeGreaterThan(existingIndex);

        } finally {
            if (fs.existsSync(temporaryFile)) {
                fs.unlinkSync(temporaryFile);
            }
        }
    });


    test('should create a new test file when target does not exist', async () => {

        const applier = new AutomationApplier();

        const temporaryFile = path.resolve(
            process.cwd(),
            'tests',
            '__AutomationApplierNewFile__.spec.ts'
        );

        const proposal: PlaywrightAutomationProposal = {
            file: 'tests/__AutomationApplierNewFile__.spec.ts',
            testCaseId: 'TC-NEW',
            code: `
test('TC-NEW - generated test', async ({ page }) => {
    await page.goto('/');
    expect(page).toBeTruthy();
});
`.trim(),
            reason: 'Verify creation of a new automation file.',
        };

        try {
            applier.apply(proposal);

            expect(
                fs.existsSync(temporaryFile)
            ).toBe(true);

            const content = fs.readFileSync(
                temporaryFile,
                'utf-8'
            );

            expect(content).toContain(
                "import { test, expect } from '../fixtures/test.fixture';"
            );

            expect(content).toContain('TC-NEW');

        } finally {
            if (fs.existsSync(temporaryFile)) {
                fs.unlinkSync(temporaryFile);
            }
        }
    });

});