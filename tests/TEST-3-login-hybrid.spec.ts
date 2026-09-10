import { test, expect } from '../fixtures/test.fixture';

test('TC-005-HYBRID - API + UI login validation', async ({
    loginApi,
    loginFlow,
    testData,
}) => {


  const loginData = testData.login<{
    validMobile: string;
  }>(); 
    // API: prepare login state
    const apiResponse = await loginApi.sendOtp(
        loginData.validMobile
    );

    expect(apiResponse.ok()).toBeTruthy();

    await loginFlow.open();

    await loginFlow.enterMobileAndAcceptTerms( loginData.validMobile);

    // UI validation
      expect(await loginFlow.isSendOtpEnabled()).toBe(true);
});