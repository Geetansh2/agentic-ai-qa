# QA Agent Skill

## Purpose

The `qa-agent` skill is the primary orchestration skill for the Agentic AI QA framework.

It coordinates the complete QA workflow for a Jira issue by using the existing QA Skills, framework architecture, Playwright automation, test execution, failure analysis, controlled self-healing, Allure reporting, and QA reporting.

The agent must make decisions based on the Jira requirement, stored test cases, existing automation, application behavior, framework architecture, execution evidence, and the rules defined in `CLAUDE.md`.

The agent must not rely on hardcoded test-case choices or examples from this Skill.

---

# Source of Truth

Always follow:

1. `CLAUDE.md`
2. This `qa-agent` Skill
3. The individual Skills invoked by this Skill
4. Existing project architecture and implementation

Do not create a parallel QA framework.

Reuse existing:

* Page Objects
* Components
* Business Flows
* Fixtures / Dependency Injection
* TestDataProvider
* Utilities
* Existing Playwright tests
* Existing test cases
* Existing reporting configuration

Do not introduce a new framework structure unless explicitly required.

---

# Required Skills

Use the existing Skills when applicable:

* Jira Skill
* Test Generation Skill
* Playwright Automation Skill
* Failure Analysis Skill
* Failure Decision Skill
* Self-Healing Skill
* Allure Skill
* QA Reporting Skill

The `qa-agent` Skill orchestrates these Skills.

It must not duplicate their responsibilities.

---

# Core Objective

For a requested Jira issue:

```text
Jira Issue
    ↓
Requirement Analysis
    ↓
Test Case Discovery / Generation
    ↓
Test Case Eligibility Analysis
    ↓
Intelligent Selection of ONE Test Case
    ↓
Framework Inspection
    ↓
Automation Creation / Reuse
    ↓
Execute ONE Selected Test
    ↓
PASS
   └── Allure → QA Reporting

FAIL
   ↓
Failure Analysis
   ↓
Failure Decision
   ↓
Controlled Self-Healing / Retry
   ↓
Allure → QA Reporting
```

The workflow must operate on **ONE Jira issue at a time**.

The execution scope must be **ONE selected test case at a time**.

Never automatically execute the complete test suite.

---

# Phase 1 — Jira Analysis

Use the Jira Skill to read the requested Jira issue.

Extract:

* Jira issue key
* Summary
* Description
* Acceptance criteria
* Preconditions
* Expected behavior
* Business rules
* Testable scenarios
* Dependencies
* Environment requirements
* Test-data requirements
* Authentication requirements
* OTP requirements
* Ambiguous or missing requirements

Do not modify Jira.

Do not add comments.

Do not create Jira bugs.

If the requirement is unclear enough that a reliable test cannot be selected or executed, classify it as:

```text
REQUIREMENT_AMBIGUITY
```

and stop with:

```text
NEEDS_CLARIFICATION
```

---

# Phase 2 — Test Case Discovery

After Jira analysis:

1. Check whether test cases already exist for the Jira issue.
2. If they exist, read them.
3. If they do not exist, invoke the Test Generation Skill.
4. Do not regenerate existing test cases unnecessarily.
5. Preserve existing valid test cases.

Typical location:

```text
test-cases/<JIRA_ISSUE_KEY>.json
```

The test cases are the source for determining automation candidates.

---

# Phase 3 — Test Case Eligibility

Before selecting a test case, evaluate every relevant test case.

Each test case should be classified based on its automation status.

Eligible:

```text
Automatable
```

Not eligible:

```text
Manual
Blocked
```

A test case must not be selected if it:

* Requires a real OTP with no approved QA mechanism
* Requires unavailable external credentials
* Requires unavailable test data
* Requires unsupported environment functionality
* Has unresolved requirement ambiguity
* Cannot be implemented using the existing framework
* Requires production modification
* Requires an external action without approval

For OTP-dependent tests:

If no QA OTP mechanism exists and triggering a real OTP is not explicitly authorized:

```text
Status = BLOCKED
Reason = No QA OTP mechanism available
```

Do not attempt the real OTP flow.

---

# Phase 4 — Intelligent Test Case Selection

The agent MUST select exactly ONE test case for execution.

The agent must evaluate all eligible candidates before making the selection.

Never select a test case merely because:

* It appears first in the test-case file
* It was used in a previous example
* It is mentioned as an example in this Skill
* It was previously selected
* It happens to already have automation

## Selection Rules

First filter the candidates.

Exclude:

1. Blocked test cases
2. Manual test cases
3. Tests requiring unavailable test data
4. Tests requiring unavailable QA mechanisms
5. Tests with unresolved requirement ambiguity
6. Tests that cannot currently be automated using the framework

Then rank the remaining candidates.

Use these priorities:

### Priority 1 — New Coverage

Prefer a valid test case that:

* Is not already successfully automated
* Is not already successfully covered by a recent execution

This prevents repeatedly executing the same successful test when other eligible coverage exists.

### Priority 2 — Business Value

Prefer scenarios covering:

* Core acceptance criteria
* Critical user journeys
* Primary business functionality
* High-risk behavior
* Important validation rules

### Priority 3 — Automation Readiness

Prefer tests with:

* Stable UI
* Available test data
* Existing Page Objects
* Existing Components
* Existing Business Flows
* Existing Fixtures
* No special infrastructure requirements

### Priority 4 — Reliability

Prefer tests with:

* Deterministic behavior
* Stable selectors
* Minimal external dependencies
* Predictable test data

### Priority 5 — Dependencies

Prefer tests with fewer dependencies on:

* Other tests
* External systems
* Manual setup
* Unavailable services
* Unstable environments

---

# Test Selection Decision

After evaluating candidates, select exactly ONE.

The agent must record the reasoning.

Example:

```text
Selected Test Case:
TC-001

Selection Reason:
TC-001 was selected because it is Automatable, covers a core acceptance criterion,
has available test data, has no OTP dependency, and is not already successfully
automated/executed. It provides new coverage compared with TC-004 and TC-005.
```

Do not use wording such as:

```text
Selected because it is the eligible example.
```

Do not select a test case based solely on Skill examples.

---

# Previously Automated Tests

Existing automation must be inspected before creating new automation.

If the selected test case is already automated:

1. Reuse the existing automation.
2. Do not create a duplicate test.
3. Verify that it corresponds to the selected test case.
4. Execute only that test.

If another eligible test case is not yet automated, prefer the new candidate instead of repeatedly executing an already-passing test.

However, an already automated test may be selected when:

* It has not been recently executed
* Its implementation may be stale
* The Jira requirement changed
* Previous execution failed
* The test needs verification
* It is materially higher priority than the other candidates

The agent must explain the reason.

---

# Phase 5 — Framework Inspection

Before creating or modifying automation, inspect the existing framework.

Check:

```text
config/
data/
fixtures/
components/
pages/
flows/
tests/
test-cases/
utils/
listeners/
```

Reuse existing architecture.

Do not:

* Create duplicate Page Objects
* Create duplicate Components
* Create duplicate utilities
* Put raw locators directly in tests
* Create a new framework
* Create a new `src/` directory
* Bypass existing Fixtures / DI
* Hardcode credentials

---

# Phase 6 — Automation

Invoke the Playwright Automation Skill for the selected test case.

Before writing automation:

1. Open the target application when required.
2. Inspect actual application behavior.
3. Verify available UI elements.
4. Identify reliable selectors.
5. Reuse existing Page Objects and Flows.
6. Add only the minimum required automation.

Preferred locator order:

```text
getByRole
getByLabel
getByTestId
getByText
```

Avoid brittle:

```text
CSS chains
XPath
nth()
positional selectors
implementation-specific selectors
```

unless there is no better reliable option.

Every automated test must contain meaningful assertions.

Do not weaken assertions merely to make a test pass.

---

# Phase 7 — Execute Selected Test

Execute ONLY the selected test case.

Do not execute:

```text
all tests
full suite
all tests for Jira issue
all tests in the spec
```

unless explicitly requested.

Prefer targeted Playwright execution.

Example:

```text
npx playwright test <specific-test-file> -g "<selected-test-name>" --workers=1
```

Or, using the project's targeted npm script (which already pins `--workers=1`):

```text
npm run test:single -- <specific-test-file> -g "<selected-test-name>"
```

Agent-targeted execution MUST always pass `--workers=1` explicitly (via the
`test:single` script or the `--workers=1` flag), regardless of the
`PLAYWRIGHT_WORKERS` environment variable or local/CI default worker count
configured in `playwright.config.ts`. Parallel worker configuration is only
for suite/regression execution (e.g. `npm run test:parallel`) and must never
cause more than one test to execute during a one-test agent run.

Use the project's existing test commands where applicable.

Capture:

* Test result
* Duration
* Error
* Stack trace
* Expected result
* Actual result
* URL
* Screenshot
* Trace
* Video
* Console information
* Relevant network information
* Environment
* Browser


Execution Scope Enforcement

The agent MUST NOT execute the complete spec file when the workflow scope is ONE
selected test case.

If targeted execution does not produce the expected Allure result:

1. Do NOT run the full spec as a fallback.
2. Investigate the targeted execution command and reporter configuration.
3. Retry the SAME selected test using an alternative targeted command if necessary.
4. Preserve the one-test execution scope.
5. If targeted execution cannot be completed reliably, classify the issue as:
   REPORTING_CONFIGURATION_ISSUE
   or
   AUTOMATION_EXECUTION_ISSUE
   depending on the evidence.
6. Do not expand execution scope merely to generate reporting artifacts.
---

# Phase 8 — Successful Execution

If the selected test passes:

```text
Status = PASS
```

Do not perform failure analysis.

Do not retry.

Invoke the Allure Skill.

Generate/update the Allure report.

Then invoke the QA Reporting Skill.

The final summary must include:

* Jira issue
* Selected test case
* Test name
* Environment
* Execution attempts
* Initial result
* Final result
* Recovery
* Failure classification
* Root cause
* Allure report
* QA recommendation
* Next action

---

# Phase 9 — Failure Investigation

If the selected test fails:

DO NOT immediately retry.

Invoke:

```text
Failure Analysis Skill
```

Provide all available evidence.

The Failure Analysis Skill must determine whether the failure is:

```text
AUTOMATION_ISSUE
LOCATOR_ISSUE
TEST_DATA_ISSUE
TEST_CASE_ISSUE
REQUIREMENT_AMBIGUITY
ENVIRONMENT_ISSUE
APPLICATION_DEFECT
INSUFFICIENT_EVIDENCE
```

Do not independently override the Failure Analysis result without evidence.

---

# Phase 10 — Failure Decision

After Failure Analysis, invoke:

```text
Failure Decision Skill
```

Determine the correct action.

Possible actions:

```text
FIX_AUTOMATION
FIX_LOCATOR
UPDATE_TEST_DATA
UPDATE_TEST_CASE
REVISIT_REQUIREMENT
RETRY
REPORT_ENVIRONMENT_ISSUE
CREATE_JIRA_BUG
COLLECT_MORE_EVIDENCE
```

The decision must be evidence-based.

Never retry simply because the test failed.

---

# Phase 11 — Controlled Self-Healing

If Failure Decision recommends recovery or retry, invoke:

```text
Self-Healing Skill
```

Maximum retry attempts:

```text
2
```

A retry is allowed only when:

1. The failure cause is understood sufficiently.
2. A meaningful corrective action has been taken.
3. The corrective action is permitted.
4. The retry can provide useful new evidence.

Examples:

```text
LOCATOR_ISSUE
→ Fix locator
→ Retry

AUTOMATION_ISSUE
→ Fix automation
→ Retry

TEST_DATA_ISSUE
→ Correct test data
→ Retry

ENVIRONMENT_ISSUE
→ Controlled retry
```

Do not retry indefinitely.

Do not weaken assertions.

Do not change expected business behavior merely to obtain a pass.

---

# Phase 12 — Application Defect

If Failure Analysis identifies:

```text
APPLICATION_DEFECT
```

and sufficient evidence exists:

Stop automation recovery.

Do not create a Jira bug automatically.

Jira bug creation is currently disabled for this project.

Report:

```text
Application defect suspected/confirmed.
External Jira action skipped because Jira bug creation is disabled.
```

If evidence is insufficient, collect additional evidence instead.

---

# Phase 13 — Requirement Ambiguity

If the failure or test case depends on unclear requirements:

```text
REQUIREMENT_AMBIGUITY
```

Stop automation changes.

Do not guess the expected behavior.

Do not modify assertions to accommodate an assumption.

Report:

```text
NEEDS_CLARIFICATION
```

and identify the exact requirement clarification needed.

---

# Phase 14 — Final Allure Reporting

After the final execution state is known:

Invoke the Allure Skill.

Ensure the final execution is represented in Allure.

The report should preserve:

* Jira/Test Case ID
* Test name
* Status
* Duration
* Failure information
* Stack trace
* Environment
* Browser
* Screenshots
* Trace
* Video when available

Do not expose secrets in reports.

---

# Phase 15 — QA Reporting

Invoke the QA Reporting Skill after the final execution state.

The QA summary must reflect the actual final state.

Do not independently invent:

* Failure classifications
* Root causes
* Test results
* Recovery actions

Use evidence from:

* Playwright
* Failure Analysis
* Failure Decision
* Self-Healing
* Allure

---

# Email Reporting

Email reporting is currently disabled.

Do not send emails.

Do not modify email configuration.

Report the QA summary only.

---

# Jira Actions

The following actions are currently disabled unless the user explicitly enables/approves them:

* Jira comments
* Jira issue updates
* Jira bug creation

Do not perform these actions automatically.

---

# External Actions

Any external write action requires explicit user approval.

Examples:

* Jira updates
* Jira bug creation
* Sending emails
* Production changes
* External system modifications

Read-only actions required for analysis are allowed when supported by the workflow.

---

# Execution Scope

For every invocation:

```text
ONE Jira Issue
    ↓
ONE Selected Test Case
    ↓
ONE Automation Target
    ↓
ONE Targeted Execution
```

Failure recovery may execute controlled retries of the same selected test.

Never expand the execution scope automatically.

---

# Stop Conditions

Stop the workflow when:

* No Automatable test case exists
* All candidates are Blocked
* Required test data is unavailable
* QA OTP mechanism is unavailable
* Requirement clarification is required
* External approval is required
* Application defect requires Jira action
* Self-healing retry limit is reached
* Evidence is insufficient to safely continue
* Environment is unavailable and controlled retry is exhausted

Report the reason clearly.

---

# No Infinite Loops

The agent must not repeatedly perform:

```text
generate → automate → execute → fail → generate → automate → execute
```

without a meaningful decision.

Every retry must have:

* Known reason
* Evidence
* Corrective action
* Maximum attempt limit

---

# Final QA Execution Summary

At the end of every completed workflow, provide:

```text
Agentic QA Execution Summary

Jira:
<issue key> — <summary>

Selected Test Case:
<TC-ID> — <test case title>

Selection Reason:
<why this test case was selected over other eligible candidates>

Test:
<automated test name>

Automation:
<created | updated | reused>

Environment:
<environment>

Execution Attempts:
<number>

Initial Result:
<PASSED | FAILED | BLOCKED>

Final Result:
<PASSED | FAILED | BLOCKED>

Recovery:
<NONE | description>

Failure Classification:
<NONE | classification>

Root Cause:
<NONE | root cause>

Overall Status:
<PASS | FAIL | BLOCKED>

Allure Report:
<report location>

QA Recommendation:
<recommendation>

Next Action:
<next action>
```

---

# Completion Criteria

The `qa-agent` workflow is complete when:

* Jira requirement was analyzed
* Test cases were discovered/generated
* Candidate test cases were evaluated
* Exactly ONE test case was selected
* Selection reasoning was recorded
* Existing automation was reused where appropriate
* Required automation was created/updated
* Only the selected test was executed
* Failures were analyzed before retry
* Failure decisions were evidence-based
* Self-healing was controlled
* Maximum retry limit was respected
* Final Allure report was generated
* QA execution summary was generated
* No unauthorized external action was performed

The agent must always optimize for:

```text
Correctness
Evidence
Controlled Automation
Reusable Architecture
Minimal Scope
Deterministic Execution
Clear QA Reporting
```
