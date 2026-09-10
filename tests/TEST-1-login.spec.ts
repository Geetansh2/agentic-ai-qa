import { test, expect } from '../fixtures/test.fixture';

test.beforeEach(async ({}, testInfo) =>{
  console.log(
        `[HOOK] BEFORE EACH: ${testInfo.title}`
    );

})
test.afterEach(async ({}, testInfo) => {
    console.log(
        `[HOOK] AFTER EACH: ${testInfo.title} - ${testInfo.status}`
    );
});


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

// test('TC-004 - Send OTP remains disabled without terms acceptance', async ({
//   loginFlow,
//   testData,
// }) => {
//   await loginFlow.open();

//   const loginData = testData.login<{
//     validMobile: string;
//   }>();

//   await loginFlow.enterMobileNumber(loginData.validMobile);

//   expect(await loginFlow.isSendOtpEnabled()).toBe(false);
// });

// test('TC-005 - valid mobile + terms enables Send OTP', async ({
//   loginFlow,
//   testData,
// }) => {
//   await loginFlow.open();

//   const loginData = testData.login<{
//     validMobile: string;
//   }>();

//   await loginFlow.enterMobileAndAcceptTerms(
//     loginData.validMobile,
//   );

//   expect(await loginFlow.isSendOtpEnabled()).toBe(true);
// });

// test('TC-006 - Send OTP becomes disabled again when checkbox is unchecked', async ({
//   loginFlow,
//   testData,
// }) => {
//   await loginFlow.open();

//   const loginData = testData.login<{
//     validMobile: string;
//   }>();

//   await loginFlow.enterMobileAndAcceptTerms(
//     loginData.validMobile,
//   );

//   expect(await loginFlow.isSendOtpEnabled()).toBe(true);

//   await loginFlow.uncheckTerms();

//   expect(await loginFlow.isSendOtpEnabled()).toBe(false);
// });

test('TC-010 - Privacy Policy link points to the expected URL', async ({ loginFlow, page }) => {
  // Precondition: Login page is loaded
  await loginFlow.open();

  // Locate the 'Privacy Policy' link using a role-based locator
  const privacyLink = page.getByRole('link', { name: /privacy policy/i });

  // Verify its href attribute without navigating away
  await expect(privacyLink).toHaveAttribute(
    'href',
    'https://in.zoworld.app/ed-tech/privacypolicy'
  );
});
