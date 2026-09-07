import { Page } from '@playwright/test';

import { LoginPage } from '../pages/LoginPage';

export class LoginFlow {
  private readonly loginPage: LoginPage;

  constructor(page: Page) {
    this.loginPage = new LoginPage(page);
  }

  async open(): Promise<void> {

    await this.loginPage.navigateTo('ed-tech');
  }

  async enterMobileAndAcceptTerms(
    mobileNumber: string,
  ): Promise<void> {
    await this.loginPage.enterMobileNumber(mobileNumber);
    await this.loginPage.acceptTerms();
  }

  async enterMobileNumber(mobileNumber: string): Promise<void> {
    await this.loginPage.enterMobileNumber(mobileNumber);
  }

  async isSendOtpEnabled(): Promise<boolean> {
    return this.loginPage.isSendOtpEnabled();
  }
}