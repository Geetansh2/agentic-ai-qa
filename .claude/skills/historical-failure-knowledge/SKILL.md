# Historical Failure Knowledge Skill

## Purpose

Use historical test failure information to improve the analysis of a current test failure.

The agent should retrieve relevant previous failures, compare them with the current failure, and provide historical evidence to the Failure Analysis Agent.

Historical knowledge is supporting evidence.

It must not replace analysis of the current failure.

---

## When to Use

Use this Skill when:

* A Playwright test has failed.
* A test execution produces an error, stack trace, or failure output.
* Historical test failure records are available.
* The system wants to determine whether the current failure matches a previous failure.
* The system wants to identify recurring failure patterns.
* The system wants to improve root-cause analysis using previous failures.

Do not use this Skill when:

* The test has passed.
* No failure information is available.
* No historical failure information is available.
* The task is unrelated to test failure analysis.

---

## Core Principle

The current failure is the primary evidence.

Historical failures are supporting evidence.

The agent must never assume that a current failure has the same root cause as a previous failure merely because the error message looks similar.

Historical evidence must be compared with the current failure.

---

# Historical Failure Record

A historical failure record may contain:

* testCaseId
* testName
* testFile
* errorMessage
* failureType
* stackTrace
* failedStep
* page
* endpoint
* browser
* environment
* durationMs
* rootCause
* resolution
* retryResult
* timestamp

Example:

```json
{
  "testCaseId": "TC-004",
  "testName": "Verify Send OTP button",
  "testFile": "tests/login/TEST-1-login.spec.ts",
  "errorMessage": "Timeout waiting for Send OTP button",
  "failureType": "TIMEOUT",
  "failedStep": "Click Send OTP",
  "page": "LoginPage",
  "environment": "qa",
  "rootCause": "OTP service timeout",
  "resolution": "Retry after service recovery",
  "retryResult": "PASSED",
  "timestamp": "2026-09-01T10:30:00Z"
}
```

---

# Retrieval Rules

Retrieve historical failures using the strongest available evidence.

Prioritize:

1. Same test case ID
2. Same test file
3. Same failed step
4. Same page/component
5. Same endpoint
6. Same failure type
7. Similar error message
8. Similar stack trace
9. Similar failure pattern
10. Same environment or browser when relevant

Exact matches should generally receive more weight than semantic similarities.

---

# Similarity Rules

A historical failure may be considered relevant when one or more meaningful signals match.

Strong signals include:

* Same test case ID
* Same failure location
* Same endpoint
* Same application component
* Same failure type
* Same stack trace
* Same error pattern
* Same failed action

Weak signals include:

* Similar wording only
* Same browser only
* Same environment only
* Same general feature area without additional evidence

Do not classify two failures as the same root cause based only on similar wording.

---

# Historical Evidence Classification

Classify retrieved historical information as:

## STRONG_MATCH

Use when multiple strong signals match.

Example:

```text
Current:
TC-004
LoginPage
Click Send OTP
Timeout waiting for Send OTP

Historical:
TC-004
LoginPage
Click Send OTP
Timeout waiting for Send OTP
```

---

## PARTIAL_MATCH

Use when some meaningful signals match but important information differs or is unavailable.

Example:

```text
Current:
TC-004
Timeout waiting for Send OTP

Historical:
TC-005
Timeout waiting for OTP response
```

---

## WEAK_MATCH

Use when only weak similarities exist.

Example:

```text
Current:
Timeout waiting for Send OTP

Historical:
Timeout waiting for Login button
```

---

## NO_RELEVANT_HISTORY

Use when the historical records do not provide meaningful evidence related to the current failure.

---

# Recurring Failure Detection

The agent should identify recurring failures when the same or strongly similar failure appears multiple times.

Example:

```text
TC-004
  ↓
Failure 1 → OTP timeout
Failure 2 → OTP timeout
Failure 3 → OTP timeout
```

This should be reported as a recurring historical pattern.

The agent must still verify whether the current failure contains evidence consistent with that pattern.

---

# Resolution History

Historical resolutions may be used as supporting information.

Examples:

```text
Previous failure:
OTP API timeout

Previous resolution:
Retry

Retry result:
PASSED
```

or:

```text
Previous failure:
Locator timeout

Previous resolution:
Updated locator

Result:
PASSED
```

The agent must not automatically apply a historical resolution.

A previous resolution is a recommendation signal, not proof that the same action will resolve the current failure.

---

# Environment Awareness

Failures from different environments must be treated carefully.

For example:

```text
QA:
OTP API timeout

UAT:
OTP API timeout
```

These may represent the same underlying issue, but the agent must not assume this without supporting evidence.

Environment should be included in the comparison whenever available.

---

# Browser Awareness

Browser information may help identify browser-specific failures.

Example:

```text
Chromium:
Locator timeout

Firefox:
PASSED

WebKit:
PASSED
```

If the current failure occurs only in Chromium, the historical browser information becomes relevant evidence.

Do not assume browser-specific behavior when the historical data is insufficient.

---

# Evidence Requirements

When historical failures are retrieved, the agent should report:

* Which historical failures were considered relevant.
* Why they were considered relevant.
* Which signals matched.
* Whether the pattern is recurring.
* Whether the historical root cause is consistent with the current failure.
* Confidence in the historical match.

Do not invent historical records.

Do not invent root causes.

Do not invent resolutions.

Do not claim a previous failure existed if it was not retrieved from the historical knowledge source.

---

# Confidence

Confidence must be between:

```text
0.0 and 1.0
```

Suggested interpretation:

```text
0.90 - 1.00
Very strong historical match

0.75 - 0.89
Strong historical match

0.50 - 0.74
Partial historical match

0.25 - 0.49
Weak historical match

0.00 - 0.24
Little or no useful historical evidence
```

Confidence represents confidence in the **historical match**, not certainty about the root cause.

---

# Safety Rules

The agent must:

* Never invent historical failures.
* Never invent historical root causes.
* Never invent historical resolutions.
* Never treat historical evidence as absolute truth.
* Always prioritize current failure evidence.
* Clearly distinguish historical evidence from current evidence.
* Preserve environment and browser context when available.
* Avoid exposing secrets, tokens, passwords, OTPs, or sensitive test data.
* Never modify tests or application code.
* Never automatically apply a historical fix.
* Never skip a test solely because a previous failure had a known resolution.

---

# Agent Workflow

Follow this workflow:

1. Receive the current test failure.
2. Extract useful failure signals.
3. Retrieve historical failure records.
4. Compare the current failure with historical records.
5. Classify historical matches.
6. Identify recurring patterns.
7. Evaluate historical root-cause consistency.
8. Calculate historical-match confidence.
9. Return structured historical evidence.
10. Provide the evidence to the Failure Analysis Agent.

---

# Agent Decision Prompt

Use this section as the authoritative decision instruction for the Historical Failure Knowledge Agent.

Analyze the current test failure using the available historical failure records.

Determine:

1. Which historical failures are relevant.
2. Why each historical failure is relevant.
3. Which signals match.
4. Whether the current failure represents a recurring pattern.
5. Whether the historical root cause is consistent with the current failure.
6. The confidence of the historical match.

Return only the JSON object defined by the Output Contract.

Do not return Markdown.

Do not return explanations outside the JSON.

Do not invent information that is not present in the current failure or historical records.

---

# Output Contract

The agent must return:

```json
{
  "matchType": "STRONG_MATCH",
  "relevantFailures": [
    {
      "testCaseId": "TC-004",
      "reason": "Same test case, same failed step, and same timeout pattern.",
      "matchingSignals": [
        "same test case",
        "same failed step",
        "same failure type"
      ]
    }
  ],
  "recurringPattern": true,
  "historicalRootCause": "OTP service timeout",
  "rootCauseConsistent": true,
  "confidence": 0.94,
  "summary": "The current failure strongly matches previous TC-004 OTP timeout failures."
}
```

Valid `matchType` values:

```text
STRONG_MATCH
PARTIAL_MATCH
WEAK_MATCH
NO_RELEVANT_HISTORY
```

---

# Output Validation

The agent output must:

* Be valid JSON.
* Contain `matchType`.
* Use only valid `matchType` values.
* Contain `relevantFailures` as an array.
* Contain `recurringPattern` as a boolean.
* Contain `confidence` as a number between 0 and 1.
* Contain `summary`.
* Never contain invented historical information.

If the output is invalid, the agent must fail rather than silently assume missing information.

---

# Completion Criteria

The Historical Failure Knowledge implementation is complete when:

* The Skill can be loaded by the agent.
* Historical failure records can be retrieved.
* Current failures can be compared with historical failures.
* Relevant historical failures are identified.
* Recurring patterns can be detected.
* Historical evidence is returned in structured JSON.
* Confidence is provided.
* No historical information is invented.
* The result can be consumed by the Failure Analysis Agent.
