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

---

## Agent Automation Workflow

When the agent selects a test case for automation:

1. Verify the selected test case has:
   `automationStatus: "Automatable"`.

2. Check the existing `tests/` directory for an existing test
   with the same test case ID.

3. If the test already exists:
   - Do not create a duplicate test.
   - Reuse or update the existing automation only when required.

4. If the test does not exist:
   - Inspect the existing Page Objects.
   - Inspect the existing Business Flows.
   - Inspect the existing fixtures.
   - Reuse existing framework components whenever possible.

5. If an existing Page Object is missing a required locator or
   getter:
   - Add the smallest necessary change to the Page Object.
   - Do not bypass the Page Object layer from the test.

6. If an existing Business Flow can support the test:
   - Reuse the Business Flow.
   - Add a small reusable method only when required.

7. Create the Playwright test under `tests/`.

8. Include the test case ID in the test title.

9. The generated test must:
   - Use existing fixtures.
   - Use Page Objects and Business Flows.
   - Follow the locator rules defined by this Skill.
   - Contain meaningful assertions.
   - Avoid real OTP/SMS.
   - Avoid sensitive test data.

10. Before execution, verify that the generated test can be
    uniquely selected using its test case ID.

11. Execute only the selected test case using:

    `--workers=1`

12. Do not generate or modify unrelated test cases.

---

## Framework Reuse Rules

The agent must prefer the existing framework over creating new
automation infrastructure.

Reuse in this order:

1. Existing Page Objects
2. Existing Business Flows
3. Existing Components
4. Existing Fixtures
5. Existing API services
6. New framework code only when necessary

Do not create duplicate Page Objects, flows, fixtures, or API clients.

---

## Automation Scope

For an agent automation task:

- Automate ONE selected test case at a time.
- Do not automatically automate every candidate.
- Do not modify unrelated tests.
- Do not weaken assertions to make a test pass.
- Do not change business requirements.
- Do not bypass existing framework architecture.

---

## Automation Verification

After creating automation, verify:

1. The test file exists.
2. The test case ID exists in the test title.
3. Playwright can discover the test.
4. The selected test can be executed independently.
5. The test result is either `passed` or a failure that must be
   investigated by the Failure Analysis skill.A


## Completion

Playwright automation is complete when:

- All eligible automatable test cases have corresponding tests.
- Tests use stable locators.
- Tests contain meaningful assertions.
- Test case IDs are included.
- No real OTP or sensitive credentials are used.
- Tests are stored under `tests/`.
- The automation can be executed with Playwright.
