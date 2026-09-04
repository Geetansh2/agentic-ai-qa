import { Locator, Page } from '@playwright/test';

import { BasePage } from './BasePage';
import { LanguageComponent } from '../components/LanguageComponent';

export class LoginPage extends BasePage {
  readonly language: LanguageComponent;

  private readonly mobileInput: Locator;
  private readonly termsCheckbox: Locator;
  private readonly sendOtpButton: Locator;

  constructor(page: Page) {
    super(page);

    this.language = new LanguageComponent(page);

    this.mobileInput = page.getByRole('textbox', {
      name: /mobile|number/i,
    });

    this.termsCheckbox = page.getByRole('checkbox', {
      name: /terms.*privacy/i,
    });

    this.sendOtpButton = page.getByRole('button', {
      name: /send otp/i,
    });
  }

  async enterMobileNumber(mobileNumber: string): Promise<void> {
    await this.mobileInput.fill(mobileNumber);
  }

  async acceptTerms(): Promise<void> {
    await this.termsCheckbox.check();
  }

  async uncheckTerms(): Promise<void> {
    await this.termsCheckbox.uncheck();
  }

  async clickSendOtp(): Promise<void> {
    await this.sendOtpButton.click();
  }

  async isSendOtpEnabled(): Promise<boolean> {
    return this.sendOtpButton.isEnabled();
  }
}