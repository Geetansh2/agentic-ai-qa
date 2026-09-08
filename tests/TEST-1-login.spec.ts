import { test, expect } from '../fixtures/test.fixture';

test('TC-001 - Login page loads with correct initial state', async ({
  loginFlow,
}) => {
  await loginFlow.open();

  expect(await loginFlow.getMobileNumberValue()).toBe('');
  expect(await loginFlow.getCountryCodePrefix()).toBe('+91');
  expect(await loginFlow.isTermsChecked()).toBe(false);
  expect(await loginFlow.isSendOtpEnabled()).toBe(false);
});

test('TC-002 - Mobile number field accepts only numeric input', async ({
  loginFlow,
  testData,
}) => {
  await loginFlow.open();

  const loginData = testData.login<{
    nonNumericMobile: string;
  }>();

  await loginFlow.enterMobileNumber(loginData.nonNumericMobile);

  expect(await loginFlow.getMobileNumberValue()).toBe('12345');
});

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