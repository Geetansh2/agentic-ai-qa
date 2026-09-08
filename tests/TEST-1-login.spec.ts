import { test, expect } from '../fixtures/test.fixture';

test('TC-004 - Send OTP remains disabled without terms acceptance', async ({
  loginFlow,
  testData,
}) => {
  await loginFlow.open();

  const loginData = testData.login<{
    validMobile: string;
  }>();

  await loginFlow.enterMobileNumber(loginData.validMobile);

  expect(await loginFlow.isSendOtpEnabled()).toBe(false);
});

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

test('TC-006 - Send OTP becomes disabled again when checkbox is unchecked', async ({
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

  await loginFlow.uncheckTerms();

  expect(await loginFlow.isSendOtpEnabled()).toBe(false);
});