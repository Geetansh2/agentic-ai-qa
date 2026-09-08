# Allure Reporting

## Purpose

Generate and manage Allure test execution reports from Playwright test results.

This skill is responsible for converting Playwright execution results into a readable Allure report that can be consumed by the QA Reporting workflow.

It must not modify test behavior, test expectations, or application code merely to improve reporting.

---

## When to Use

Use this skill when:

* Playwright test execution has completed.
* Test results are available.
* An Allure report is required.
* The reporting workflow needs execution evidence.

The skill may be used after a normal successful execution or after a failure investigation/retry cycle.

---

## Inputs

The skill should use:

* Playwright test results
* Allure result files
* Test Case ID
* Test name
* Test status
* Test duration
* Failure information
* Error messages
* Screenshots when available
* Trace files when available
* Relevant execution metadata
* Environment information

---

## Core Responsibilities

The skill should:

1. Verify that Playwright execution has completed.
2. Verify that Allure result data exists.
3. Generate the Allure report.
4. Make the report available at a known location.
5. Preserve execution evidence.
6. Provide report information to the next reporting stage.

---

## Allure Result Generation

Use the project's existing Playwright and Allure configuration.

Do not introduce a second reporting framework.

Do not create duplicate Allure configuration unless the existing configuration is missing and a change is necessary.

The skill should first inspect the existing project configuration and package scripts before executing commands.

---

## Report Generation

The standard workflow is:

```text
Playwright Test
      ↓
Allure Results
      ↓
Allure Report
      ↓
QA Reporting Skill
```

The skill should generate the report using the project's configured Allure commands.

Typical commands may include:

```text
npx allure generate <results-directory> --clean
```

and, when interactive local viewing is required:

```text
npx allure open <report-directory>
```

Do not assume these commands if the project already defines different scripts.

Prefer existing package.json scripts and project configuration.

---

## Test Result Information

The report should preserve, where available:

* Test Case ID
* Test name
* Test status
* Passed tests
* Failed tests
* Skipped tests
* Test duration
* Failure message
* Stack trace
* Environment
* Browser
* Relevant attachments

---

## Test Case Identification

Test Case IDs should remain identifiable in the Allure report.

For example:

```text
TC-004 - Send OTP remains disabled without terms acceptance
```

The skill must not rename a test merely for reporting purposes.

If the project already uses Allure labels or metadata for test case IDs, reuse that mechanism.

---

## Failure Evidence

When a test fails, preserve available evidence such as:

* Screenshot
* Playwright trace
* Error message
* Stack trace
* Console information
* Relevant page state
* URL
* Network information when available

Do not invent missing evidence.

If evidence is unavailable, report that it is unavailable.

---

## Screenshots and Traces

If the existing Playwright configuration produces screenshots or traces, the Allure report should include them when supported by the current project configuration.

Do not modify test behavior solely to generate unnecessary evidence.

Do not enable expensive tracing or video collection globally unless the project configuration requires it.

---

## Environment Information

Where available, the report should identify:

```text
Environment:
QA / UAT / PROD

Base URL:
<configured base URL>

Browser:
<browser>

Execution Time:
<timestamp>
```

Never expose sensitive credentials, tokens, passwords, OTPs, or secrets in the report.

---

## Execution Status

The skill must preserve the actual Playwright result.

Valid statuses include:

```text
PASSED
FAILED
SKIPPED
BROKEN
UNKNOWN
```

Do not change a failed test to passed because of reporting or retry behavior.

If a test eventually passes after a controlled retry, the reporting workflow should retain the relevant execution history where supported.

---

## Retry Awareness

The Allure Skill must not perform retries.

Retry decisions belong to:

```text
Failure Analysis
        ↓
Failure Decision
        ↓
Self-Healing / Controlled Retry
```

Allure only reports the resulting execution information.

---

## Multiple Attempts

When multiple attempts occurred, preserve the available execution evidence.

Example:

```text
TC-004

Attempt 1:
FAILED
Classification: LOCATOR_ISSUE

Action:
Locator corrected

Attempt 2:
PASSED
```

The final QA summary should be able to distinguish between:

* Initially failed but recovered
* Permanently failed
* Passed on first attempt

---

## Report Location

After generation, return:

```text
Report:
<Allure report location>

Results:
<Allure results location>

Status:
GENERATED
```

The report location must correspond to an actual generated report.

Never invent a report path.

---

## Existing Project Architecture

Follow the architecture defined in `CLAUDE.md`.

Do not create:

```text
src/
```

Do not introduce a parallel test framework.

Reuse:

* Existing Playwright configuration
* Existing package scripts
* Existing test structure
* Existing fixtures
* Existing utilities
* Existing reporting configuration

---

## Configuration Rules

Before changing Allure configuration:

1. Inspect the existing Playwright configuration.
2. Inspect `package.json`.
3. Inspect existing Allure configuration.
4. Determine whether Allure is already configured.
5. Reuse existing configuration whenever possible.
6. Make the smallest necessary change if configuration is missing.

Do not overwrite working configuration unnecessarily.

---

## Failure Handling

If Allure report generation fails:

1. Capture the command/output error.
2. Identify whether the problem is:

   * Missing Allure installation
   * Missing result files
   * Invalid configuration
   * Permission/path issue
   * Environment/tooling issue
3. Do not modify test code to solve a reporting problem.
4. Report the failure clearly.
5. Recommend the appropriate next action.

Example:

```text
Allure Status:
FAILED

Reason:
No Allure result files were generated.

Classification:
REPORTING_CONFIGURATION_ISSUE

Action:
Inspect Playwright reporter configuration.
```

---

## No Test Modification

This skill must never:

* Remove assertions.
* Change expected results.
* Skip failing tests.
* Modify test logic to make reports pass.
* Modify application code.
* Modify production systems.
* Hide failures.
* Delete failure evidence to make the report cleaner.

---

## Security

Never include:

* Passwords
* Authentication tokens
* API keys
* OTPs
* Session cookies
* Production secrets
* Sensitive personal information

in:

* Allure attachments
* Report metadata
* Screenshots
* Logs
* Environment information

---

## External Actions

Generating a local Allure report is not an external write action.

However, this skill must not independently:

* Send emails
* Create Jira issues
* Modify Jira issues
* Add Jira comments
* Modify production systems

Those actions require the appropriate workflow and explicit approval where required by `CLAUDE.md`.

---

## Output Format

Return:

```text
Allure Report

Execution:
<execution summary>

Tests:
<total>

Passed:
<count>

Failed:
<count>

Skipped:
<count>

Recovered:
<count if available>

Environment:
<environment>

Report Status:
GENERATED | FAILED

Report Location:
<actual report location>

Results Location:
<actual results location>

Failure Evidence:
<available evidence or NONE>

Next Step:
<next recommended action>
```

---

## Completion Criteria

The Allure Reporting task is complete when:

1. Playwright execution has completed.
2. Allure results are available.
3. Allure report generation has completed successfully.
4. Test statuses are preserved.
5. Relevant evidence is attached when available.
6. The report location is known.
7. No test behavior was modified for reporting purposes.
8. The report is ready for consumption by the QA Reporting Skill.
# QA Reporting

## Purpose

Generate a concise and accurate QA execution summary from Playwright execution results, Failure Analysis, Failure Decision, Self-Healing, and Allure reporting data.

This skill converts technical execution information into a clear QA status that can be consumed by humans and downstream reporting workflows.

The skill must report facts from available execution evidence and must not invent results.

---

## When to Use

Use this skill when:

* Playwright execution has completed.
* Allure reporting has completed or execution results are available.
* Failure Analysis has been performed for failed tests.
* Self-Healing/retry has completed when applicable.
* A QA execution summary is required.

---

## Inputs

The skill should use:

* Jira issue key
* Jira requirement/summary
* Test Case IDs
* Test names
* Playwright execution results
* Allure results/report
* Passed tests
* Failed tests
* Skipped tests
* Retry history
* Self-healing results
* Failure Analysis results
* Failure Decision results
* Environment
* Browser
* Execution duration
* Failure evidence
* Confirmed application defects

---

## Core Responsibilities

The skill should:

1. Summarize the overall execution.
2. Report test counts.
3. List executed test cases.
4. Identify passed, failed, and skipped tests.
5. Identify tests recovered through self-healing/retry.
6. Summarize confirmed failures.
7. Include failure classifications when available.
8. Provide an overall QA status.
9. Provide a recommendation for the next step.
10. Provide the Allure report location when available.

---

## Do Not Diagnose Failures

This skill must not independently determine the root cause of a failure.

Failure diagnosis belongs to:

```text
Failure Analysis
```

This skill should consume the existing Failure Analysis result.

Do not invent a new classification.

For example, if Failure Analysis says:

```text
APPLICATION_DEFECT
```

the QA report should use:

```text
APPLICATION_DEFECT
```

It must not change it to:

```text
AUTOMATION_ISSUE
```

unless a new Failure Analysis has explicitly produced that classification.

---

## Test Status

Use the actual execution status.

Valid statuses include:

```text
PASSED
FAILED
SKIPPED
BROKEN
```

Do not change a failed test to passed simply because a retry was attempted.

If a test failed initially and passed after a valid recovery action, report it as recovered where execution history supports this.

---

## Execution Summary

The report should include:

```text
Jira:
<issue key>

Environment:
<QA/UAT/PROD>

Browser:
<browser>

Total:
<number>

Passed:
<number>

Failed:
<number>

Skipped:
<number>

Recovered:
<number>

Overall Status:
<PASS | FAIL | BLOCKED>
```

---

## Overall Status Rules

### PASS

Use `PASS` when:

* All required tests passed, or
* Tests initially failed but were successfully recovered through valid controlled retry/self-healing.

Example:

```text
Total: 2
Passed: 2
Failed: 0
Skipped: 0
Recovered: 1

Overall Status:
PASS
```

---

### FAIL

Use `FAIL` when:

* One or more required tests remain failed after the allowed recovery process.

Example:

```text
Total: 2
Passed: 1
Failed: 1
Skipped: 0

Overall Status:
FAIL
```

---

### BLOCKED

Use `BLOCKED` when:

* Required execution could not proceed because of a confirmed environment issue.
* Required test data is unavailable.
* Requirement clarification is required.
* A required external dependency prevents execution.

Do not classify a normal application failure as `BLOCKED`.

---

## Test Case Summary

List each relevant test case.

Example:

```text
Test Cases:

TC-004 — Send OTP remains disabled without terms acceptance
Status: PASSED

TC-005 — Valid mobile + terms enables Send OTP
Status: PASSED
```

For recovered tests:

```text
TC-004
Final Status: PASSED
Recovery: Locator fixed
Attempts: 2
```

---

## Failure Summary

For failed tests, include:

* Test Case ID
* Test name
* Failure classification
* Short failure summary
* Root cause when available
* Recommended action
* Whether approval is required

Example:

```text
Failed Test:

TC-004 — Send OTP remains disabled without terms acceptance

Classification:
APPLICATION_DEFECT

Root Cause:
Send OTP is enabled without Terms acceptance.

Recommended Action:
Create Jira bug.

Approval:
USER_APPROVAL_REQUIRED
```

Do not add unsupported conclusions.

---

## Recovered Test Summary

When a test passes after self-healing or controlled retry, report:

```text
Recovered:

TC-004

Initial Result:
FAILED

Initial Classification:
LOCATOR_ISSUE

Recovery:
Locator corrected

Final Result:
PASSED

Attempts:
2
```

This provides transparency instead of hiding the initial failure.

---

## Skipped Test Summary

For skipped tests, report:

```text
Skipped:

TC-006

Reason:
OTP requires a QA OTP mechanism that is currently unavailable.
```

Only report a reason when it is available from execution evidence.

Do not invent a reason.

---

## Environment Information

Include environment information when available:

```text
Environment:
QA

Base URL:
<configured base URL>

Browser:
Chromium

Execution Duration:
<duration>
```

Do not expose:

* Passwords
* API keys
* Access tokens
* OTPs
* Cookies
* Secrets
* Sensitive personal information

---

## Jira Requirement Traceability

The report should maintain traceability between:

```text
Jira Issue
    ↓
Test Case
    ↓
Automation
    ↓
Execution
    ↓
Result
```

Example:

```text
Jira:
TEST-1

Automated Test Cases:
TC-004
TC-005

Execution:
2 tests executed

Result:
2 passed
```

---

## Allure Report

When Allure reporting is available, include:

```text
Allure Report:
<actual report location>

Allure Results:
<actual results location>
```

Never invent a report path.

If the Allure report could not be generated:

```text
Allure Report:
NOT AVAILABLE

Reason:
<actual reason>
```

---

## Evidence

Include relevant evidence references when available:

* Screenshot
* Trace
* Error
* Console information
* Network information
* Allure report
* Execution logs

Do not duplicate large technical logs in the QA summary.

The QA summary should contain concise references to the evidence.

---

## Recommendations

Recommendations must be based on the execution and previous workflow decisions.

Examples:

### All Tests Passed

```text
Recommendation:
Ready for QA sign-off.
```

### Application Defect

```text
Recommendation:
Application defect confirmed. Jira bug creation requires explicit approval.
```

### Environment Failure

```text
Recommendation:
Environment issue requires investigation before QA sign-off.
```

### Requirement Ambiguity

```text
Recommendation:
Clarify the Jira requirement before continuing automation.
```

### Insufficient Evidence

```text
Recommendation:
Collect additional failure evidence before making a final decision.
```

---

## External Actions

This skill only generates a QA summary.

It must not independently:

* Create Jira bugs
* Modify Jira issues
* Add Jira comments
* Send emails
* Modify production systems

External actions must follow `CLAUDE.md` and require explicit approval where applicable.

---

## No Test Modification

The reporting skill must never:

* Modify Playwright tests.
* Modify Page Objects.
* Modify Components.
* Modify Business Flows.
* Modify test data.
* Remove assertions.
* Skip failures.
* Change expected behavior.

Reporting must remain separate from test implementation.

---

## Output Format

Return the following format:

```text
QA Execution Summary

Jira:
<JIRA-KEY>

Requirement:
<short Jira requirement summary>

Environment:
<environment>

Browser:
<browser>

Execution:

Total:
<number>

Passed:
<number>

Failed:
<number>

Skipped:
<number>

Recovered:
<number>

Test Results:

<TC-ID> — <test name>
Status: <PASSED | FAILED | SKIPPED>
Recovery: <NONE | description>

Failures:

<failure information or NONE>

Overall Status:
<PASS | FAIL | BLOCKED>

Recommendation:
<next recommended action>

Allure Report:
<report location>

Evidence:
<relevant evidence>
```

---

## Example — Successful Execution

```text
QA Execution Summary

Jira:
TEST-1

Requirement:
Validate login Send OTP behavior.

Environment:
QA

Browser:
Chromium

Execution:

Total:
2

Passed:
2

Failed:
0

Skipped:
0

Recovered:
0

Test Results:

TC-004 — Send OTP remains disabled without terms acceptance
Status: PASSED
Recovery: NONE

TC-005 — Valid mobile + terms enables Send OTP
Status: PASSED
Recovery: NONE

Failures:
NONE

Overall Status:
PASS

Recommendation:
Ready for QA sign-off.

Allure Report:
<actual report location>

Evidence:
NONE
```

---

## Example — Failure

```text
QA Execution Summary

Jira:
TEST-1

Requirement:
Validate login Send OTP behavior.

Environment:
QA

Browser:
Chromium

Execution:

Total:
2

Passed:
1

Failed:
1

Skipped:
0

Recovered:
0

Test Results:

TC-004 — Send OTP remains disabled without terms acceptance
Status: FAILED
Recovery: NONE

TC-005 — Valid mobile + terms enables Send OTP
Status: PASSED
Recovery: NONE

Failures:

TC-004

Classification:
APPLICATION_DEFECT

Root Cause:
Send OTP is enabled without Terms acceptance.

Overall Status:
FAIL

Recommendation:
Application defect confirmed. Jira bug creation requires explicit approval.

Allure Report:
<actual report location>

Evidence:
<available evidence>
```

---

## Completion Criteria

The QA Reporting task is complete when:

1. Execution results have been summarized.
2. Test counts are accurate.
3. Test Case IDs are included.
4. Passed/failed/skipped results are preserved.
5. Recovered tests are identified when applicable.
6. Failure classifications are taken from Failure Analysis.
7. Overall status is determined from actual results.
8. Recommendations are based on available evidence.
9. Allure location is included when available.
10. No tests or application behavior were modified.
11. No external systems were modified.
