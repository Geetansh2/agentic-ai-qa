import { Locator, Page } from '@playwright/test';

import { BasePage } from './BasePage';
import { LanguageComponent } from '../components/LanguageComponent';

export class LoginPage extends BasePage {
  readonly language: LanguageComponent;

  private readonly mobileInput: Locator;
  private readonly termsCheckbox: Locator;
  private readonly sendOtpButton: Locator;
  private readonly countryCodePrefix: Locator;

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

    this.countryCodePrefix = page.getByText('+91', { exact: true });
  }

  async enterMobileNumber(mobileNumber: string): Promise<void> {
    await this.mobileInput.fill(mobileNumber);
  }

  async getMobileNumberValue(): Promise<string> {
    return this.mobileInput.inputValue();
  }

  async getCountryCodePrefix(): Promise<string> {
    return (await this.countryCodePrefix.textContent())?.trim() ?? '';
  }

  async isTermsChecked(): Promise<boolean> {
    return this.termsCheckbox.isChecked();
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