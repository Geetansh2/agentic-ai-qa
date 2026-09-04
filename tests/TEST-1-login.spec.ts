import { test, expect } from '../fixtures/test.fixture';

test('TC-005 - valid mobile + terms enables Send OTP', async ({
  loginFlow,
  testData,
}) => {
  await loginFlow.open();

  const loginData = testData.login<{
    validMobile: string;
  }>();

  await loginFlow.enterMobileAndAcceptTerms(
    loginData.validMobile,
  );

  expect(await loginFlow.isSendOtpEnabled()).toBe(true);
});