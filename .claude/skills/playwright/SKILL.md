# Playwright Automation

## Purpose

Convert approved and automatable QA test cases into reliable Playwright automation.

The automation must be based on the stored test cases and actual application behavior.

---

## When to Use This Skill

Use this skill when:

- Test cases have been generated.
- Test cases are stored in `test-cases/`.
- A test case has `automationStatus: "Automatable"`.

Do not automate tests marked:

- `Blocked`
- `Manual`

---

## Input

Read the relevant test case file:

```text
test-cases/<JIRA_ISSUE_KEY>.json
```

Example:

```text
test-cases/TEST-1.json
```

Only automate test cases marked:

```text
automationStatus: "Automatable"
```

---

## Test File Location

Create Playwright tests under:

```text
tests/
```

Use the Jira issue key when appropriate.

Example:

```text
tests/TEST-1-login.spec.ts
```

---

## Application Inspection

Before writing automation:

1. Open the application using Playwright.
2. Inspect the relevant page.
3. Identify the actual UI elements.
4. Verify their roles, labels, text, and attributes.
5. Use observed application behavior when available.

Do not invent selectors.

---

## Locator Rules

Prefer stable Playwright locators in this order:

1. `getByRole()`
2. `getByLabel()`
3. `getByTestId()`
4. `getByText()`

Avoid brittle:

- CSS selectors
- XPath
- DOM traversal

unless no stable alternative exists.

---

## Assertions

Every automated test must verify an expected result.

Prefer user-visible assertions.

Examples:

```ts
await expect(page.getByRole('button', { name: 'Send OTP' })).toBeDisabled();
```

```ts
await expect(page.getByRole('button', { name: 'Send OTP' })).toBeEnabled();
```

Do not write tests that only perform actions without assertions.

---

## Test Data

Do not hardcode:

- Real passwords
- Real OTPs
- Production credentials
- Sensitive personal information

Use safe test data or environment variables where required.

Example:

```ts
const mobileNumber = process.env.TEST_MOBILE_NUMBER ?? '9999999999';
```

---

## OTP Rules

Never trigger a real OTP/SMS during automation unless explicitly authorized.

If a test requires:

- Real OTP
- OTP delivery
- OTP verification
- OTP expiry
- OTP resend

and no QA OTP mechanism exists:

Do not automate the test.

Keep the test case marked as:

```text
Blocked
```

---

## Test Independence

Each test should:

- Start from a known state.
- Avoid depending on another test.
- Clean up when necessary.
- Be executable independently.

---

## Test Structure

Use clear Playwright structure:

```ts
import { test, expect } from '@playwright/test';

test.describe('Login flow', () => {
  test('TC-001 - login page loads with correct initial state', async ({
    page,
  }) => {
    await page.goto('APPLICATION_URL');

    // actions

    // assertions
  });
});
```

---

## Naming

Include the test case ID in the test title.

Example:

```text
TC-001 - Login page loads with correct initial state
```

This allows execution results to be mapped back to the generated test cases.

---

## Failure Evidence

When a test fails, preserve useful evidence when possible:

- Screenshot
- Trace
- Console output
- Error message
- URL
- Relevant page state

Do not immediately modify the test because it failed.

Failure investigation is handled by the Failure Analysis skill.

---

## Test Modification Rules

If an automation test fails:

1. Do not immediately change the test.
2. Determine whether the failure is caused by:
   - Locator
   - Test data
   - Application behavior
   - Environment
   - Test logic

3. Only modify automation when evidence indicates an automation problem.
4. Follow the Failure Analysis skill for classification and next action.

---

## Completion

Playwright automation is complete when:

- All eligible automatable test cases have corresponding tests.
- Tests use stable locators.
- Tests contain meaningful assertions.
- Test case IDs are included.
- No real OTP or sensitive credentials are used.
- Tests are stored under `tests/`.
- The automation can be executed with Playwright.
