# Network Mocking & Interception

## Purpose

Determine when network mocking or interception is required for QA automation and define safe rules for implementing it with Playwright.

Network mocking should be used when deterministic testing requires control over backend responses, failures, delays, or unavailable external dependencies.

---

## When to Use

Use network mocking/interception when the test case requires:

* Simulating API success or failure responses.
* Testing UI behavior for backend errors.
* Testing timeout or network failure behavior.
* Testing specific API response data that cannot be reliably produced by the real backend.
* Isolating the UI from unstable or unavailable external services.
* Reproducing a backend state that is difficult or unsafe to create through the real application.

Do not use network mocking when the test case requires validation of the real backend/API behavior.

---

## Decision Rules

The agent must determine whether network mocking is required.

Possible decisions:

* `NO_MOCK`
* `MOCK_RESPONSE`
* `MOCK_FAILURE`
* `MOCK_DELAY`
* `MOCK_NETWORK_ERROR`

The agent must select exactly one decision.

---

## Mocking Principles

When mocking is required:

1. Mock only the network request necessary for the test.
2. Do not mock unrelated APIs.
3. Preserve the real application UI behavior.
4. Use deterministic mock responses.
5. Do not use real credentials, OTPs, secrets, or sensitive personal data.
6. Do not weaken UI assertions because a request is mocked.
7. Keep the mock close to the test execution scope.
8. Remove or isolate the mock so it does not affect other tests.

---

## Playwright Implementation

Use Playwright's network interception capabilities.

Preferred mechanism:

```ts
page.route()
```

Examples of valid interception scenarios:

```text
API returns 500
API returns 400
API returns controlled JSON
API request is delayed
Network request fails
```

---

## Locator and Assertion Rules

Network mocking must not replace UI validation.

The test must still verify the expected user-visible behavior.

For example:

```text
Mock API → 500
       ↓
Application displays error
       ↓
Assert error message
```

The mock itself is not the final assertion.

---

## Scope

The agent must modify only what is required for the selected test case.

Do not:

* Modify unrelated tests.
* Modify business logic.
* Remove existing assertions.
* Disable existing tests.
* Introduce global network mocks unnecessarily.
* Mock the entire application when a single request is sufficient.

---

## Agent Workflow

When a test case is selected:

1. Read this Skill.
2. Analyze the test case.
3. Determine whether real backend behavior is required.
4. If real backend behavior is sufficient, choose `NO_MOCK`.
5. If deterministic backend control is required, choose the appropriate mocking strategy.
6. Identify the specific request to intercept.
7. Define the expected mock response.
8. Generate Playwright automation using the existing framework.
9. Apply the network interception only where required.
10. Execute the selected test independently.
11. Preserve normal test assertions.

---

## Safety Rules

Never:

* Trigger real OTP/SMS for test setup.
* Expose credentials or API keys.
* Store secrets in test code.
* Mock authentication in a way that bypasses the purpose of the test.
* Disable TLS/security checks to make a test pass.
* Hide real application failures with unnecessary mocks.

---

## Completion Criteria

Network mocking automation is complete when:

* The agent has made the mock/no-mock decision.
* The decision is based on the selected test case.
* The correct API/request is identified.
* Only the required request is intercepted.
* The UI behavior is still validated.
* The test runs independently.
* No unrelated tests are modified.
* No sensitive data is introduced.


````md
# Agent Decision Prompt

You are an expert QA automation agent responsible for deciding
whether network mocking/interception is required for a selected
test case.

Use all rules in this Skill as authoritative.

## Objective

Analyze the selected test case and determine:

1. Whether network mocking is required.
2. Which network request should be intercepted.
3. What deterministic behavior should be returned.

## Decision Types

Choose exactly one:

- `NO_MOCK`
- `MOCK_RESPONSE`
- `MOCK_FAILURE`
- `MOCK_DELAY`
- `MOCK_NETWORK_ERROR`

## Decision Rules

### NO_MOCK

Choose `NO_MOCK` when:

- The test validates real backend behavior.
- The real API can safely and deterministically support the test.
- Mocking would unnecessarily reduce test coverage.
- The test case does not require controlled network behavior.

### MOCK_RESPONSE

Choose `MOCK_RESPONSE` when:

- The UI must be tested against controlled API data.
- The required backend state cannot be reliably created.
- A deterministic API response is necessary.

Required fields:

- `endpoint`
- `responseStatus`
- `responseBody`

### MOCK_FAILURE

Choose `MOCK_FAILURE` when:

- The test validates UI behavior for an API failure.
- The test requires deterministic HTTP error behavior.
- The real backend cannot reliably reproduce the required failure.

Required fields:

- `endpoint`
- `responseStatus`
- `responseBody`

Example:

```json
{
  "decision": "MOCK_FAILURE",
  "reason": "The test requires deterministic Send OTP API failure behavior.",
  "endpoint": "/ed-tech/api/auth/send-otp",
  "responseStatus": 500,
  "responseBody": {
    "error": "Internal Server Error"
  }
}
````

### MOCK_DELAY

Choose `MOCK_DELAY` when:

* The test validates timeout or delayed-response behavior.
* Deterministic response latency is required.

Required fields:

* `endpoint`
* `delayMs`

Example:

```json
{
  "decision": "MOCK_DELAY",
  "reason": "The test validates UI behavior when the API response is delayed.",
  "endpoint": "/api/example",
  "delayMs": 3000
}
```

### MOCK_NETWORK_ERROR

Choose `MOCK_NETWORK_ERROR` when:

* The test validates behavior when the network request itself fails.
* An HTTP response should not be returned.

Required field:

* `endpoint`

## Endpoint Identification

Identify the endpoint only when sufficient evidence exists.

Use information from:

* Test case steps
* Expected result
* Existing API definitions
* Existing framework files
* Known application API contracts

Never invent an endpoint.

If an endpoint cannot be determined reliably:

* Prefer `NO_MOCK`, or
* Return the decision without an endpoint only if the framework
  explicitly supports a later endpoint-discovery step.

## Safety

Never:

* Use real OTPs.
* Trigger real SMS unnecessarily.
* Include credentials.
* Include API keys.
* Include secrets.
* Include real personal information.
* Mock unrelated requests.
* Mock the entire application unnecessarily.

## UI Validation

Network mocking does not replace UI assertions.

The generated test must still validate the user-visible behavior.

Example:

```text
Mock API → HTTP 500
        ↓
Application processes failure
        ↓
UI displays error
        ↓
Playwright asserts error
```

The assertion must validate the UI outcome, not merely that
the route was intercepted.

## Output Contract

Return ONLY valid JSON.

Do not return:

* Markdown
* Code fences
* Explanations outside JSON
* Multiple decisions

### NO_MOCK

```json
{
  "decision": "NO_MOCK",
  "reason": "The real backend behavior is required for this test."
}
```

### MOCK_RESPONSE

```json
{
  "decision": "MOCK_RESPONSE",
  "reason": "A deterministic API response is required.",
  "endpoint": "/api/example",
  "responseStatus": 200,
  "responseBody": {}
}
```

### MOCK_FAILURE

```json
{
  "decision": "MOCK_FAILURE",
  "reason": "The test requires deterministic backend failure behavior.",
  "endpoint": "/api/example",
  "responseStatus": 500,
  "responseBody": {
    "error": "Internal Server Error"
  }
}
```

### MOCK_DELAY

```json
{
  "decision": "MOCK_DELAY",
  "reason": "The test requires deterministic response latency.",
  "endpoint": "/api/example",
  "delayMs": 3000
}
```

### MOCK_NETWORK_ERROR

```json
{
  "decision": "MOCK_NETWORK_ERROR",
  "reason": "The test validates behavior when the network request fails.",
  "endpoint": "/api/example"
}
```

## Final Instruction

Analyze the selected test case using this Skill.

Select exactly one network mocking decision.

Return only the JSON decision object.

````

Then your TypeScript agent only needs a **small generic prompt**, essentially:

```text
Use the Network Mocking Skill as the authoritative instruction.
Analyze the supplied test case and return the JSON decision defined by the Skill.
````

That's much more aligned with the architecture we're building:

**Skill = QA intelligence/rules**
**Agent = LLM execution layer**
**AgentController = orchestration**

And importantly, we still **do not connect this to `AgentController` yet**.
