# Self-Healing / Controlled Retry

## Purpose

Provide controlled self-healing and retry behavior after a Playwright test failure.

This skill consumes the output of:

1. Failure Analysis
2. Failure Decision

It determines whether an approved automation/data/environment fix should be applied and whether the test should be re-executed.

The objective is to recover from known and correctable failures without introducing blind retries, infinite loops, or unsafe changes.

---

## When to Use

Use this skill when:

* A Playwright test has failed.
* Failure Analysis has been completed.
* Failure Decision has produced a recommended action.
* There is sufficient evidence to perform the recommended recovery action.

Do not use this skill to bypass Failure Analysis or Failure Decision.

---

## Inputs

The skill should use:

* Test Case ID
* Test name
* Test file
* Failure Analysis result
* Failure Decision result
* Failure evidence
* Previous execution history
* Previous retry attempts
* Relevant test data
* Jira requirement when applicable
* Current application/environment information

---

## Core Rules

### 1. Never blindly retry

Do not rerun a failed test simply because it failed.

A retry must have:

* A known or suspected cause
* A reason why retrying can provide new evidence
* A clear retry limit

---

### 2. Maximum retry limit

Default maximum retry attempts:

```text
2 attempts
```

Do not exceed the configured retry limit.

If the maximum retry count is reached:

```text
STOP
```

Do not continue retrying indefinitely.

---

### 3. Retry only after a meaningful change

A retry is allowed only when at least one of the following is true:

* An automation issue was fixed.
* A locator issue was fixed.
* Test data was corrected.
* A transient environment issue is suspected.
* Required test setup/state was corrected.
* New evidence justifies another attempt.

Do not repeat the exact same failed action without new evidence.

---

## Classification to Recovery Mapping

### LOCATOR_ISSUE

Decision:

```text
FIX_LOCATOR
```

Action:

1. Identify the incorrect or unstable locator.
2. Inspect the actual application UI.
3. Replace it with a stable locator following project rules.
4. Preserve existing Page Object architecture.
5. Re-run the affected test.
6. Analyze the new result.

---

### AUTOMATION_ISSUE

Decision:

```text
FIX_AUTOMATION
```

Action:

1. Identify the automation defect.
2. Modify only the necessary automation code.
3. Reuse existing Page Objects, Components, Flows, Fixtures, and TestDataProvider.
4. Do not create a parallel framework.
5. Re-run the affected test.
6. Analyze the new result.

---

### TEST_DATA_ISSUE

Decision:

```text
UPDATE_TEST_DATA
```

Action:

1. Identify the incorrect or missing test data.
2. Update the appropriate environment-specific test data.
3. Do not hardcode credentials, OTPs, passwords, or sensitive values.
4. Re-run the affected test.
5. Analyze the new result.

---

### TEST_CASE_ISSUE

Decision:

```text
UPDATE_TEST_CASE
```

Action:

1. Determine why the test case does not represent the requirement correctly.
2. Update the test case only when evidence supports the change.
3. Reassess automation suitability.
4. Update automation if required.
5. Execute only after the test case is valid.

---

### REQUIREMENT_AMBIGUITY

Decision:

```text
REVISIT_REQUIREMENT
```

Action:

```text
STOP
```

Do not guess the intended behavior.

Do not modify automation based on assumptions.

Request clarification or revisit the Jira requirement.

---

### ENVIRONMENT_ISSUE

Decision:

```text
RETRY
```

Action:

1. Confirm evidence indicates an environment/transient issue.
2. Verify the environment is available.
3. Do not modify application automation unnecessarily.
4. Perform a controlled retry.
5. Record the retry reason.
6. Analyze the new result.

Example:

```text
Attempt 1:
HTTP 503 from QA environment

Decision:
RETRY

Reason:
Transient environment failure with no evidence of an application or automation defect.

Attempt 2:
Test executes successfully
```

---

### APPLICATION_DEFECT

Decision:

```text
CREATE_JIRA_BUG
```

Action:

```text
STOP
```

Do not attempt self-healing.

Do not modify automation to make the test pass.

Do not create or modify a Jira issue automatically.

A Jira bug requires sufficient evidence and explicit user approval before any external write action.

---

### INSUFFICIENT_EVIDENCE

Decision:

```text
COLLECT_MORE_EVIDENCE
```

Action:

1. Collect additional available evidence.
2. Review screenshot, trace, console, network, URL, page state, and execution history where available.
3. Re-run only if the newly collected evidence provides a valid reason.
4. Do not blindly retry.

---

## Self-Healing Scope

Self-healing may modify only what is necessary to recover from a confirmed automation-related problem.

Allowed:

* Correct an incorrect locator.
* Correct an automation implementation defect.
* Correct test data configuration.
* Recover from a confirmed transient environment failure.

Not allowed:

* Change the application itself.
* Change production systems.
* Change Jira without approval.
* Modify requirements to make a test pass.
* Remove assertions to make a test pass.
* Weaken test coverage just to achieve a pass.
* Disable failing tests without justification.
* Introduce a new test framework.
* Create duplicate Page Objects, Components, Flows, or utilities.

---

## Locator Self-Healing Rules

When fixing a locator:

1. Inspect the actual application.
2. Verify the target element.
3. Prefer:

```text
getByRole
getByLabel
getByTestId
getByText
```

4. Avoid brittle CSS/XPath unless no stable alternative exists.
5. Keep locators inside Page Objects or Components.
6. Do not place raw locators inside tests.

---

## Test Integrity Rules

Self-healing must never change the expected business behavior merely to make the test pass.

The agent must preserve:

* Test Case ID
* Business intent
* Expected behavior
* Required assertions
* Test independence
* Existing project architecture

A passing test after removing or weakening the assertion is not considered successful self-healing.

---

## Execution Rules

After applying a valid fix:

1. Execute the affected test.
2. Capture the result.
3. If passed:

   * Mark recovery successful.
   * Record the change that resolved the failure.
4. If failed again:

   * Do not automatically repeat the same fix.
   * Run Failure Analysis again.
   * Compare the new failure with the previous failure.
   * Determine whether the root cause changed.
5. Stop when retry limit is reached.

---

## Retry History

Maintain a logical history for every attempt.

Example:

```text
Test: TC-004

Attempt 1:
Status: FAILED
Classification: LOCATOR_ISSUE
Action: FIX_LOCATOR

Attempt 2:
Status: PASSED
Action: NONE
Result: RECOVERED
```

If the same failure occurs again:

```text
Attempt 1:
Status: FAILED
Classification: LOCATOR_ISSUE
Action: FIX_LOCATOR

Attempt 2:
Status: FAILED
Classification: LOCATOR_ISSUE
Action: STOP

Reason:
The same failure persisted after the corrective action.
Further retry requires new evidence.
```

---

## Recovery States

Use the following states:

```text
RECOVERED
RETRYING
STOPPED
NEEDS_APPROVAL
NEEDS_CLARIFICATION
FAILED
```

### RECOVERED

Test passed after an approved recovery action.

### RETRYING

A controlled retry is currently justified.

### STOPPED

No safe or justified recovery action remains.

### NEEDS_APPROVAL

An external action requires explicit user approval.

### NEEDS_CLARIFICATION

Requirement or expected behavior is unclear.

### FAILED

The test remains failed after the allowed recovery attempts.

---

## External Actions

This skill must not independently perform external write actions.

The following always require explicit user approval:

* Jira issue creation
* Jira issue modification
* Jira comments
* Jira field updates
* Emails
* Production modifications

For an application defect, return:

```text
External Action:
USER_APPROVAL_REQUIRED
```

---

## Decision Examples

### Example 1 — Locator Failure

```text
Failure Classification:
LOCATOR_ISSUE

Decision:
FIX_LOCATOR

Action:
Inspect UI → update Page Object locator → rerun test

Retry:
YES

Reason:
A specific automation locator was identified and corrected.
```

### Example 2 — Environment Failure

```text
Failure Classification:
ENVIRONMENT_ISSUE

Decision:
RETRY

Action:
Controlled retry

Retry:
YES

Reason:
QA environment returned HTTP 503 and there is no evidence of an application defect.
```

### Example 3 — Application Defect

```text
Failure Classification:
APPLICATION_DEFECT

Decision:
CREATE_JIRA_BUG

Action:
STOP

External Action:
USER_APPROVAL_REQUIRED

Reason:
The application behavior contradicts the confirmed requirement.
```

### Example 4 — Ambiguous Requirement

```text
Failure Classification:
REQUIREMENT_AMBIGUITY

Decision:
REVISIT_REQUIREMENT

Action:
STOP

Retry:
NO

Reason:
Expected behavior cannot be determined reliably from the available requirement.
```

---

## Output Format

Return:

```text
Test:
<Test name>

Test Case ID:
<TC-ID>

Failure Classification:
<classification>

Previous Attempts:
<number>

Decision:
<action>

Recovery Action:
<what should be changed or retried>

Reason:
<why this action is appropriate>

Retry:
YES | NO

Retry Count:
<current>/<maximum>

State:
RECOVERED | RETRYING | STOPPED | NEEDS_APPROVAL | NEEDS_CLARIFICATION | FAILED

External Action:
NONE | USER_APPROVAL_REQUIRED

Next Step:
<next recommended action>
```

---

## Safety Rules

Never:

* Retry indefinitely.
* Retry without evidence.
* Modify the application to make a test pass.
* Remove assertions to make a test pass.
* Hide or ignore failures.
* Create Jira bugs without sufficient evidence and approval.
* Send emails without approval when external sending is involved.
* Modify production.
* Change requirements based on assumptions.

---

## Completion Criteria

The self-healing process is complete when:

1. The failure has been classified.
2. A recovery decision has been made.
3. A justified corrective action has been applied, or
4. A controlled retry has completed, or
5. The process has safely stopped.
6. Retry limits have been respected.
7. The final execution state has been recorded.
8. Any required external action is waiting for explicit approval.
