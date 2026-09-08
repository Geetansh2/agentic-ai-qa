# Test Case Generation

## Purpose

Generate QA test cases from an analyzed Jira requirement and observed application behavior.

The goal is to create test cases that are realistic, traceable to the requirement, and executable through Playwright when appropriate.

---

## When to Use This Skill

Use this skill when:

* Jira requirement analysis is available.
* Application behavior has been inspected.
* The agent is asked to generate test cases.

Do not generate test cases from assumptions alone.

---

## Inputs

Use the following information when available:

1. Jira requirement
2. Acceptance criteria
3. Jira requirement analysis
4. Application observations from Playwright
5. Known test data
6. Known environment information

---

## Test Case Design

Cover relevant scenarios such as:

* Positive / happy path
* Required field validation
* Invalid input
* Boundary conditions
* Error handling
* User interaction
* Business rules
* Navigation
* Accessibility-related behavior when observable

Only create scenarios that are supported by the requirement or observed application behavior.

---

## Unknown Behavior

If expected behavior is unknown:

* Do not invent the expected result.
* Mark the behavior as `UNKNOWN`.
* Do not create an automation test that depends on the unknown behavior.
* Identify what information is required.

Example:

```text
OTP expiry behavior: UNKNOWN
```

Do not assume:

```text
OTP expires after 5 minutes
```

unless that behavior is explicitly documented or observed.

---

## OTP Testing Rules

For OTP-based authentication:

* Do not trigger real OTP/SMS delivery without explicit permission.
* Do not use real user credentials.
* Do not expose OTPs or credentials in source code.
* Prefer a QA/staging OTP bypass or test hook when available.
* If no OTP test mechanism exists, mark end-to-end OTP verification as `BLOCKED`.
* Test observable pre-OTP behavior independently.

Examples of valid pre-OTP tests:

* Mobile number field is displayed.
* Terms and Conditions checkbox is displayed.
* Privacy Policy link is displayed.
* Send OTP is disabled initially.
* Send OTP becomes enabled when required inputs are provided.
* Send OTP remains disabled when required inputs are missing.

---

## Test Case Structure

Each test case should contain:

* Test Case ID
* Title
* Preconditions
* Test Data
* Steps
* Expected Result
* Priority
* Automation Status

Example:

```json
{
  "id": "TC-001",
  "title": "Send OTP remains disabled when terms are not accepted",
  "preconditions": [
    "Login page is accessible"
  ],
  "testData": {
    "mobileNumber": "9999999999"
  },
  "steps": [
    "Enter a valid mobile number",
    "Do not select the Terms & Conditions checkbox"
  ],
  "expectedResult": "Send OTP remains disabled",
  "priority": "High",
  "automationStatus": "Automatable"
}
```

---

## Automation Classification

Classify each test case as one of:

### Automatable

The complete scenario can safely be automated with available test data and application behavior.

### Blocked

Automation requires something unavailable, such as:

* OTP
* Credentials
* Test account
* External service
* Unknown expected behavior

### Manual

The scenario requires manual verification or cannot reasonably be automated.

---

## Playwright Rules

When generating automation-oriented test cases:

* Prefer stable user-facing behavior.
* Use role, label, test ID, or text-based locators where appropriate.
* Do not invent selectors.
* Do not invent element attributes.
* Use actual selectors discovered through Playwright inspection when available.

---

## Test Case Quality Rules

1. Every test case must have a clear purpose.
2. Expected results must be based on known behavior.
3. Do not invent requirements.
4. Do not invent business rules.
5. Do not invent test data.
6. Avoid duplicate test cases.
7. Keep each test case focused on one behavior.
8. Identify blocked tests clearly.
9. Separate automatable and non-automatable scenarios.
10. Never trigger real external side effects merely to complete a test.

---

## Output

Return test cases in a structured format.

```json
{
  "testCases": [
    {
      "id": "TC-001",
      "title": "string",
      "preconditions": [],
      "testData": {},
      "steps": [],
      "expectedResult": "string",
      "priority": "High | Medium | Low",
      "automationStatus": "Automatable | Blocked | Manual"
    }
  ],
  "blockedScenarios": [],
  "unknownBehavior": []
}
```

---

## Completion

Test generation is complete when:

* Relevant scenarios have been identified.
* Positive and negative cases are covered where behavior is known.
* Unknown behavior is explicitly identified.
* Blocked automation is identified.
* No unsupported assumptions have been introduced.
* Structured test cases have been produced.


## Storage

After generating test cases, save them to:

test-cases/<JIRA_ISSUE_KEY>.json

Example:

test-cases/TEST-1.json

The file must contain the complete structured test case output.

Do not overwrite existing test cases without first checking whether the file already exists.
