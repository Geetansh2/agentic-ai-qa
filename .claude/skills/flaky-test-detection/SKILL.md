````md
# Flaky Test Detection

## Purpose

Determine whether a Playwright test is stable, flaky, or inconclusive
based on its historical execution results.

The goal is to identify tests that produce inconsistent results
without a consistent code or environment change.

---

## When to Use

Use Flaky Test Detection when:

- A test has been executed multiple times.
- Historical execution results are available.
- The same test has produced both PASS and FAIL results.
- A test fails intermittently.
- A failure appears inconsistent across repeated executions.
- CI execution history is available for analysis.

Do not classify a test as flaky from a single failure.

---

## Classification

The agent must select exactly one classification:

- `STABLE`
- `FLAKY`
- `INCONCLUSIVE`

---

## Classification Rules

### STABLE

Choose `STABLE` when:

- Repeated executions consistently pass.
- Repeated executions consistently fail for the same deterministic reason.
- There is no meaningful variation in execution outcome.
- Available evidence does not indicate intermittent behavior.

A consistently failing test is not automatically flaky.

Example:

```text
PASS
PASS
PASS
PASS
PASS
````

Classification:

```json
{
  "classification": "STABLE"
}
```

---

### FLAKY

Choose `FLAKY` when:

* The same test alternates between PASS and FAIL.
* The test passes and fails without a clear deterministic change.
* The same failure appears intermittently.
* The failure occurs only on some executions.
* Timing-sensitive behavior appears inconsistent.
* The failure appears dependent on browser, worker, environment,
  or execution timing.
* There is sufficient historical evidence to identify inconsistent
  behavior.

Example:

```text
PASS
FAIL
PASS
PASS
FAIL
PASS
```

Classification:

```json
{
  "classification": "FLAKY"
}
```

A single failure followed by a single pass is generally insufficient
evidence unless additional evidence strongly indicates intermittent
behavior.

---

### INCONCLUSIVE

Choose `INCONCLUSIVE` when:

* There are too few executions.
* Historical data is insufficient.
* Failure information is missing.
* The test changed significantly between executions.
* The environment changed in a way that explains the result.
* The available evidence cannot distinguish flaky behavior from
  deterministic failure.
* Execution history contains conflicting or incomplete information.

Example:

```text
FAIL
```

Classification:

```json
{
  "classification": "INCONCLUSIVE"
}
```

---

## Important Distinction

Do not confuse flaky tests with consistently failing tests.

Example:

```text
FAIL
FAIL
FAIL
FAIL
FAIL
```

This is not automatically flaky.

If the same failure occurs consistently, classify it as:

```text
STABLE
```

with an explanation that the test is consistently failing.

Flakiness means inconsistent execution behavior.

---

## Evidence

The agent should consider:

* PASS/FAIL sequence
* Number of executions
* Failure frequency
* Failure messages
* Error types
* Timeout errors
* Locator errors
* Network errors
* Browser
* Environment
* Execution duration
* Worker count
* Retry information
* Test changes
* Application changes
* Infrastructure changes

Do not treat any single signal as proof of flakiness.

---

## Failure Patterns

Potential flaky signals include:

### Timing variation

Examples:

* Timeout waiting for element
* Element appears intermittently
* Navigation timeout
* Race condition
* Unexpected loading delay

These may indicate flakiness when the same test sometimes passes.

---

### Network variation

Examples:

* Intermittent network failure
* Request timeout
* Connection reset
* API occasionally unavailable
* Backend response timing variation

These may indicate flakiness when execution outcomes vary.

---

### Locator variation

Examples:

* Element occasionally not found
* Strict mode violation occurring intermittently
* Dynamic DOM behavior
* Element detached from DOM

These may indicate flakiness when the test passes in other runs.

---

### Environment variation

Examples:

* Failure occurs only in one browser.
* Failure occurs only in CI.
* Failure occurs only in a specific environment.
* Failure occurs only with parallel execution.

Environment-specific behavior should be considered carefully.

Do not automatically classify every environment-specific failure
as flaky.

---

## Non-Flaky Failures

The following should not automatically be classified as flaky:

* Consistent assertion failure.
* Consistent missing element.
* Consistent API failure.
* Invalid test data.
* Broken application functionality.
* Incorrect locator that fails every time.
* Missing configuration.
* Authentication failure occurring on every run.
* A known environment outage.

These may represent deterministic defects or test/configuration
problems rather than flaky behavior.

---

## Minimum Evidence

Use the following guidance:

### 1 execution

Classification:

```text
INCONCLUSIVE
```

unless the evidence clearly indicates the execution cannot be
used for flaky analysis.

### 2 executions

Usually:

```text
INCONCLUSIVE
```

unless the evidence strongly demonstrates inconsistent behavior.

### 3+ executions

The agent may classify:

```text
STABLE
```

or:

```text
FLAKY
```

when the execution pattern provides sufficient evidence.

The agent must explain the evidence used.

---

## Confidence

The agent must return a confidence value between:

```text
0
```

and:

```text
1
```

Where:

* `0.0` = no confidence
* `0.5` = moderate confidence
* `1.0` = very high confidence

Confidence should reflect the quality and amount of available evidence.

Do not return confidence greater than `1`.

Do not return confidence below `0`.

---

## Signals

The agent must return a list of evidence signals.

Examples:

```text
[
  "PASS and FAIL results alternate across executions",
  "Same timeout error appears intermittently"
]
```

Signals must describe evidence from the supplied execution history.

Do not invent evidence.

---

## Safety Rules

Never:

* Invent execution history.
* Invent failures.
* Invent browser/environment information.
* Assume a test is flaky without evidence.
* Modify test code.
* Modify application code.
* Hide failures.
* Ignore consistent failures.
* Treat retries as independent executions without considering
  the retry context.

---

## Agent Decision Prompt

You are an expert QA automation agent responsible for detecting
flaky Playwright tests.

Use this Skill as the authoritative instruction.

Analyze ONLY the supplied execution history.

Determine exactly one classification:

* `STABLE`
* `FLAKY`
* `INCONCLUSIVE`

Consider:

* PASS/FAIL sequence
* Number of executions
* Failure frequency
* Failure messages
* Error patterns
* Timing behavior
* Network behavior
* Browser
* Environment
* Retry information
* Any provided execution metadata

Do not invent missing information.

A consistently failing test is not automatically flaky.

A test should be classified as FLAKY only when the evidence
shows inconsistent execution behavior.

If there is insufficient evidence, choose INCONCLUSIVE.

Return confidence between 0 and 1.

Return evidence-based signals.

---

## Output Contract

Return ONLY valid JSON.

The response must have exactly this structure:

```json
{
  "classification": "STABLE | FLAKY | INCONCLUSIVE",
  "reason": "short evidence-based explanation",
  "confidence": 0.0,
  "signals": [
    "evidence signal 1",
    "evidence signal 2"
  ]
}
```

Rules:

* `classification` is required.
* `reason` is required.
* `confidence` is required.
* `signals` is required.
* `confidence` must be a number.
* `confidence` must be between 0 and 1.
* `signals` must be an array.
* Do not return Markdown.
* Do not return a code block.
* Do not return explanations outside the JSON.

---

## Completion Criteria

Flaky Test Detection is complete when:

* Historical execution data is supplied.
* The Skill is loaded by the agent.
* The agent analyzes the supplied history.
* Exactly one classification is returned.
* The classification is evidence-based.
* Confidence is returned.
* Supporting signals are returned.
* Invalid classifications are rejected.
* Invalid confidence values are rejected.
* Missing required fields are rejected.
* No test or application code is modified.

```
```
