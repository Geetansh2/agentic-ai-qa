# Failure Analysis Skill

## Purpose

Investigate Playwright test failures and determine the most likely root cause before any retry, automation change, or external action.

The skill must diagnose failures using available execution evidence. It must not blindly retry, modify automation, create Jira issues, or send reports.

---

## When to Use This Skill

Use this skill when:

* A Playwright test execution has failed.
* Failure evidence is available from the test executor, listener, or test result.
* The agent needs to determine why the test failed and what should happen next.

Do not use this skill for passed tests unless explicitly requested for analysis.

---

## Input

Use all available evidence, including:

* Test case ID
* Test name
* Test file
* Error message
* Stack trace
* Assertion details
* Expected result
* Actual result
* Current URL
* Screenshot
* Trace
* Console output
* Network/request information when available
* Relevant test data
* Jira requirement/test-case information
* Recent execution history when available

Do not assume evidence that is not available.

---

## Investigation Rules

When a test fails:

1. Do not immediately retry.
2. Read the complete failure message and stack trace.
3. Identify the failed action or assertion.
4. Compare expected and actual behavior.
5. Review available screenshot, trace, URL, console, and network evidence.
6. Determine whether the failure is deterministic or potentially transient.
7. Determine the most likely root cause.
8. Classify the failure.
9. State the evidence supporting the classification.
10. Recommend the next action.
11. Recommend a retry only when there is a specific reason and new evidence can be obtained.

Do not change automation merely because a test failed.

---

## Failure Classification

Classify each failure into one primary category.

### AUTOMATION_ISSUE

Use when the test implementation or framework behavior is incorrect.

Examples:

* Incorrect test logic
* Incorrect flow implementation
* Incorrect assertion
* Framework setup/teardown problem
* Incorrect use of existing framework components

### LOCATOR_ISSUE

Use when the failure is caused by an incorrect, outdated, or unstable UI locator.

Examples:

* Element cannot be found
* Locator resolves to the wrong element
* UI changed while the underlying application behavior remains correct

Only classify as a locator issue when evidence supports it.

### TEST_DATA_ISSUE

Use when supplied test data is invalid, missing, expired, or incompatible with the environment.

Examples:

* Invalid test mobile number
* Missing required test account
* Test data does not satisfy the required preconditions

### TEST_CASE_ISSUE

Use when the generated test case itself is incorrect or cannot be correctly mapped to the requirement.

Examples:

* Incorrect expected result
* Incorrect precondition
* Test steps contradict the Jira requirement

### REQUIREMENT_AMBIGUITY

Use when the Jira requirement or acceptance criteria do not provide enough information to determine the expected behavior.

Do not invent the expected behavior.

### ENVIRONMENT_ISSUE

Use when the failure is caused by the test environment rather than the application behavior being tested.

Examples:

* HTTP 5xx caused by infrastructure
* Service unavailable
* Environment outage
* Authentication infrastructure unavailable
* Network failure
* Deployment instability

### APPLICATION_DEFECT

Use only when there is sufficient evidence that the application behavior violates the requirement or expected result.

Examples:

* UI displays an incorrect state
* Required business rule is not enforced
* Application returns incorrect data
* Deterministic functional behavior contradicts the acceptance criteria

Do not classify a failure as an application defect solely because a test failed.

### INSUFFICIENT_EVIDENCE

Use when the available evidence is not sufficient to reliably classify the failure.

Do not guess.

Recommend collecting additional evidence.

---

## Evidence Requirements

Every classification must include supporting evidence.

Useful evidence includes:

* Exact assertion failure
* Expected versus actual result
* Screenshot showing application state
* Playwright trace
* Console error
* Network/request failure
* HTTP status or response
* Current URL
* Reproducible application behavior
* Jira requirement or acceptance criteria
* Test-case preconditions

Do not invent evidence.

If evidence is insufficient, explicitly state:

```text
INSUFFICIENT_EVIDENCE
```

and recommend:

```text
COLLECT_MORE_EVIDENCE
```

---

## Root Cause Analysis

Distinguish between:

* **Symptom** — what Playwright reported.
* **Expected** — what should have happened.
* **Actual** — what happened.
* **Root Cause** — why the failure most likely occurred.
* **Evidence** — what supports the conclusion.

Example:

```text
Symptom:
Send OTP button was enabled.

Expected:
Send OTP should remain disabled when Terms are unchecked.

Actual:
Send OTP was enabled.

Likely Root Cause:
Application gating behavior does not enforce Terms acceptance.

Evidence:
The test entered a valid mobile number and did not select Terms.
The Send OTP button was observed as enabled.

Classification:
APPLICATION_DEFECT

Confidence:
HIGH
```

---

## Confidence

Assign one confidence level:

* `HIGH` — strong, direct evidence supports the classification.
* `MEDIUM` — evidence supports the classification but additional confirmation would be useful.
* `LOW` — limited evidence; classification is tentative.

Do not use `HIGH` confidence when the evidence is inconclusive.

---

## Retry Decision

Do not retry automatically.

Recommend:

```text
Retry: YES
```

only when:

* The failure appears transient.
* The environment may have recovered.
* A service/network failure occurred.
* A meaningful state change has occurred.
* The retry can provide new evidence.
* The previous failure is not expected to reproduce deterministically.

Recommend:

```text
Retry: NO
```

when:

* The same deterministic assertion fails.
* A locator is clearly invalid.
* Test data is invalid.
* Test implementation is incorrect.
* The requirement is ambiguous.
* The application defect is reproducible.

Every retry recommendation must include a reason.

Never retry indefinitely.

---

## Recommended Actions

The analysis may recommend exactly one primary action:

* `FIX_AUTOMATION`
* `FIX_LOCATOR`
* `UPDATE_TEST_DATA`
* `UPDATE_TEST_CASE`
* `REVISIT_REQUIREMENT`
* `RETRY`
* `REPORT_ENVIRONMENT_ISSUE`
* `CREATE_JIRA_BUG`
* `COLLECT_MORE_EVIDENCE`

The Failure Analysis Skill only recommends the action.

It must not execute the action.

External write actions require explicit user approval.

---

## Decision Guidelines

Use the following decision logic:

```text
Test failed
    |
    v
Is there sufficient evidence?
    |
    +-- No --> COLLECT_MORE_EVIDENCE
    |
    +-- Yes
          |
          v
Is the environment unavailable or transient?
          |
          +-- Yes --> RETRY / REPORT_ENVIRONMENT_ISSUE
          |
          +-- No
                |
                v
Is the automation implementation incorrect?
                |
                +-- Yes --> FIX_AUTOMATION / FIX_LOCATOR
                |
                +-- No
                      |
                      v
Is test data invalid?
                      |
                      +-- Yes --> UPDATE_TEST_DATA
                      |
                      +-- No
                            |
                            v
Does the test case contradict the requirement?
                            |
                            +-- Yes --> UPDATE_TEST_CASE
                            |
                            +-- No
                                  |
                                  v
Is the requirement ambiguous?
                                  |
                                  +-- Yes --> REVISIT_REQUIREMENT
                                  |
                                  +-- No
                                        |
                                        v
                              APPLICATION_DEFECT
                                        |
                                        v
                                CREATE_JIRA_BUG
```

This is a reasoning guide, not a requirement to force every failure through a fixed sequence.

The agent must use the actual evidence available.

---

## Do Not Modify Automation Without Evidence

A failed test does not automatically mean the test is wrong.

Before recommending an automation change, verify:

1. The test step was intended.
2. The test data is valid.
3. The application was available.
4. The locator was appropriate.
5. The expected result matches the requirement.
6. The failure evidence indicates an automation problem.

Only then recommend modifying automation.

---

## Application Defect Rules

Recommend `CREATE_JIRA_BUG` only when there is sufficient evidence that:

* The requirement is clear.
* The test case is valid.
* The test data is valid.
* The environment is functioning.
* The automation is behaving correctly.
* The observed application behavior violates the expected behavior.

Do not create Jira bugs for:

* Automation issues
* Locator issues
* Invalid test data
* Environment failures
* Requirement ambiguity
* Unconfirmed failures

Creating the Jira bug is a separate external action and requires explicit user approval.

---

## Failure Evidence Preservation

When available, preserve or reference:

* Screenshot
* Playwright trace
* Console output
* Error message
* Stack trace
* URL
* Relevant network information
* Test execution output

Do not delete useful failure evidence before analysis is complete.

---

## Output Format

Return the following structured analysis:

```text
Test:
<Test name>

Test Case ID:
<TC-ID>

Status:
FAILED

Failure:
<short failure summary>

Expected:
<expected behavior>

Actual:
<actual behavior>

Classification:
<one classification>

Evidence:
- <evidence 1>
- <evidence 2>
- <evidence 3>

Root Cause:
<most likely root cause>

Confidence:
HIGH | MEDIUM | LOW

Recommended Action:
<one recommended action>

Retry:
YES | NO

Retry Reason:
<why retry is or is not appropriate>
```

If evidence is insufficient:

```text
Test:
<Test name>

Test Case ID:
<TC-ID>

Status:
FAILED

Classification:
INSUFFICIENT_EVIDENCE

Evidence:
<available evidence>

Root Cause:
Cannot be determined from the available evidence.

Confidence:
LOW

Recommended Action:
COLLECT_MORE_EVIDENCE

Retry:
NO

Retry Reason:
The cause of the failure must be established before retrying.
```

---

## Scope

The Failure Analysis Skill is responsible only for investigation and recommendation.

It must not:

* Modify Playwright tests.
* Modify Page Objects.
* Modify Components.
* Modify Business Flows.
* Modify test cases.
* Retry tests itself.
* Create Jira issues.
* Update Jira issues.
* Post Jira comments.
* Send emails.
* Modify production systems.

Later workflow stages are responsible for executing the recommended action.

---

## External Actions

Never perform external write actions without explicit user approval.

This includes:

* Creating Jira bugs
* Updating Jira issues
* Posting Jira comments
* Sending emails
* Modifying external systems

The skill may recommend an external action but must not execute it.

---

## Completion

Failure analysis is complete when:

* The failure has been investigated using available evidence.
* A primary classification has been assigned, or insufficient evidence has been explicitly stated.
* Expected and actual behavior have been documented.
* The likely root cause has been identified or marked undetermined.
* Supporting evidence has been recorded.
* Confidence has been assigned.
* A recommended next action has been provided.
* A retry decision has been provided with justification.
