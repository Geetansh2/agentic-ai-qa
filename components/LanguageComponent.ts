import {expect, Page, Locator} from '@playwright/test'

import { BaseComponent } from './BaseComponent';

export class LanguageComponent extends BaseComponent{
    private readonly englishButton: Locator;

    constructor(page: Page){
        super(page);

        this.englishButton = page.getByRole('button',{
            name: 'English',
        });
    }

    async isVisible(): Promise<void> {
        await expect(this.englishButton).toBeVisible();
    }

    async clickEnglish(): Promise<void> {
        await this.englishButton.click();
    }
}

