````md
# Human Approval Gates Skill

## Purpose

Define when the QA agent must pause and obtain explicit human approval before performing an action.

The Human Approval Gate protects against:

- destructive external actions
- production execution
- external system modifications
- irreversible operations
- actions with significant business impact

The agent may analyze, plan, generate, and recommend actions autonomously.

However, actions defined as approval-required must not be executed until explicit human approval is received.

---

# Core Principle

The agent can make a decision about what should happen.

The human decides whether an approval-required action is allowed to happen.

```text
Agent
  ↓
Analyze
  ↓
Plan
  ↓
Determine approval requirement
  ↓
Approval Gate
  ↓
Human decision
  ↓
Approved ─────→ Execute
Rejected ─────→ Stop
````

The approval gate must never be bypassed because an agent believes an action is safe.

---

# When to Use

Use this Skill when:

* an agent is about to perform an external write
* an agent is about to perform a destructive action
* production execution is requested
* Jira issues may be created or modified
* external notifications may be sent
* repository changes may be committed automatically
* deployment may be triggered
* production data may be changed
* an action cannot easily be reversed

Do not use this Skill for normal read-only operations.

---

# Actions That Do NOT Require Approval

The following actions are normally safe for autonomous execution:

* reading Jira issues
* reading test cases
* reading project files
* reading historical failure knowledge
* analyzing test failures
* generating automation proposals
* selecting a test case
* choosing an automation strategy
* running QA tests
* running UAT tests when explicitly configured
* generating Allure reports
* collecting Playwright artifacts
* performing TypeScript validation
* performing CI validation
* analyzing historical failures

These actions must still follow their respective Skills.

---

# Actions That REQUIRE Approval

The following actions require explicit human approval by default:

## 1. Production execution

Examples:

```text
ENV=prod
```

or any operation that targets production systems.

---

## 2. Jira writes

Examples:

* create Jira bug
* update Jira issue
* transition Jira issue
* modify Jira fields
* add Jira comments
* attach files to Jira

Reading Jira does not require approval.

---

## 3. External email

Examples:

* sending QA reports externally
* sending failure notifications
* sending customer-facing messages
* sending incident notifications

Generating an email draft does not require approval.

Sending it does.

---

## 4. Repository writes

Examples:

* committing generated automation
* pushing code
* creating a pull request
* merging a pull request
* deleting project files

Generating a proposal does not require approval.

Executing the external repository action does.

---

## 5. Production data modification

Examples:

* creating production records
* updating production records
* deleting production records
* executing destructive API operations

These always require approval.

---

## 6. Deployment

Examples:

* deploying an application
* promoting a release
* triggering a production deployment
* rolling back production

These require approval unless an explicitly approved automated deployment policy exists.

---

# Approval Levels

The Skill defines three approval levels.

## NONE

No human approval is required.

```text
approvalRequired = false
```

The agent may continue automatically.

---

## REQUIRED

Explicit human approval is required.

```text
approvalRequired = true
```

The agent must pause before execution.

---

## BLOCKED

The action must not be executed.

```text
approvalRequired = true
status = BLOCKED
```

This should be used when:

* the requested operation violates a safety rule
* required authorization is missing
* the target environment cannot be determined
* credentials or permissions are unclear
* the action is prohibited by the workflow

---

# Approval State

The approval gate must use explicit states.

Valid states:

```text
PENDING
APPROVED
REJECTED
BLOCKED
```

## PENDING

Approval has been requested but no decision has been received.

The action must not execute.

---

## APPROVED

The human explicitly approved the specific action.

Execution may proceed.

---

## REJECTED

The human explicitly rejected the action.

Execution must stop.

---

## BLOCKED

The action cannot proceed regardless of approval.

Execution must stop.

---

# Approval Request

When approval is required, the agent must provide a concise approval request.

The request must identify:

* action
* target
* environment
* reason
* expected effect
* risk
* whether the action is reversible

Example:

```text
Human Approval Required

Action:
Create Jira bug

Target:
TEST-1

Environment:
qa

Reason:
The selected test failed consistently and requires defect tracking.

Expected effect:
A new Jira bug will be created.

Risk:
Creates an external Jira issue.

Reversible:
Yes, the Jira issue can be modified or closed.

Approve?
```

The agent must not execute the action while approval is pending.

---

# Approval Scope

Approval must be specific.

An approval for one action must not automatically approve unrelated actions.

Example:

```text
Approved:
Create Jira bug for TC-004

Not automatically approved:
Send email
Deploy production
Modify another Jira issue
```

Approval should include enough context to identify the intended operation.

---

# Approval Expiration

Approval should be treated as valid only for the specific execution attempt for which it was granted.

Do not reuse an old approval indefinitely.

A new execution attempt should require a new approval when the action or target materially changes.

---

# Human Decision

The human may respond with:

```text
APPROVED
```

or:

```text
REJECTED
```

Additional clarification may also be requested.

The agent must not interpret ambiguous language as approval.

Examples that are NOT explicit approval:

```text
maybe
looks fine
go ahead?
probably
do what you think
```

If the decision is ambiguous:

```text
status = PENDING
```

and the agent must request explicit confirmation.

---

# Agent Decision Rules

Before performing an action, the agent must evaluate:

1. What action is being performed?
2. Which system is affected?
3. Which environment is affected?
4. Is the operation read-only or a write?
5. Is the operation destructive?
6. Is the operation reversible?
7. Does the action affect production?
8. Does the action modify an external system?
9. Does the action require explicit authorization?

If any approval-required condition is true:

```text
approvalRequired = true
```

The agent must stop before execution.

---

# Safety Priority

The following priority order applies:

```text
BLOCKED
   ↓
APPROVAL_REQUIRED
   ↓
AUTONOMOUS_EXECUTION
```

Safety restrictions always override agent preference.

The agent must never downgrade:

```text
BLOCKED → APPROVED
```

or:

```text
APPROVAL_REQUIRED → NONE
```

without a valid policy or explicit human authorization.

---

# QA Workflow Integration

The Human Approval Gate sits between planning and execution.

```text
AgentController
      ↓
Plan
      ↓
Determine action
      ↓
Human Approval Gate
      ↓
┌───────────────┬───────────────┐
│               │               │
APPROVED      REJECTED        BLOCKED
│               │               │
↓               ↓               ↓
Execute         Stop            Stop
```

---

# Integration With AgentController

The intended architecture is:

```text
AgentController
      ↓
AutomationTask
      ↓
Action decision
      ↓
ApprovalGate
      ↓
Execution
```

The Approval Gate should not contain:

* Playwright automation logic
* Jira implementation logic
* email implementation logic
* CI implementation logic
* failure analysis logic

It only determines whether the planned action may proceed.

---

# Integration With CI/CD

CI execution may be autonomous for safe environments.

Example:

```text
QA
 ↓
No approval required
 ↓
Run tests
```

Production execution:

```text
PROD
 ↓
Approval required
 ↓
Human approval
 ↓
Run
```

If CI cannot obtain interactive approval:

```text
APPROVAL_REQUIRED
 ↓
BLOCK CI execution
```

Do not silently bypass the approval gate because CI is non-interactive.

---

# Integration With Jira Skill

The Jira Skill determines how Jira operations are performed.

This Skill determines whether those operations require approval.

Example:

```text
Read Jira issue
    ↓
No approval
```

```text
Create Jira bug
    ↓
Approval required
    ↓
Human approval
    ↓
Jira Skill executes
```

The Human Approval Skill must not implement Jira API calls.

---

# Integration With Reporting

Generating a QA report does not require approval.

Sending the report externally may require approval.

```text
Generate report
    ↓
No approval
```

```text
Send report by email
    ↓
Approval required
```

---

# Integration With Historical Failure Knowledge

Historical failure analysis does not require approval.

The agent may:

* retrieve historical failures
* identify recurring patterns
* determine confidence
* generate recommendations

However, acting on the recommendation may require approval.

Example:

```text
Historical analysis
      ↓
Recommendation:
Create Jira bug
      ↓
Approval Gate
      ↓
Human decision
```

Historical evidence must never itself be treated as authorization.

---

# Integration With Automation

Generating automation:

```text
LLM
 ↓
Automation proposal
```

does not require approval.

Applying generated code may be subject to repository policy.

Committing or pushing generated code requires approval unless an explicitly approved automation policy exists.

---

# Agent Decision Prompt

When an agent must determine whether an action requires approval, use this Skill as the authoritative instruction.

Return ONLY valid JSON.

```json
{
  "action": "CREATE_JIRA_BUG",
  "environment": "qa",
  "approvalRequired": true,
  "status": "PENDING",
  "reason": "Creating a Jira bug modifies an external system.",
  "risk": "Creates an external Jira issue.",
  "reversible": true
}
```

---

# Valid Actions

Examples include:

```text
RUN_QA_TEST
RUN_UAT_TEST
RUN_PROD_TEST
CREATE_JIRA_BUG
UPDATE_JIRA
SEND_EMAIL
COMMIT_CODE
PUSH_CODE
CREATE_PULL_REQUEST
MERGE_PULL_REQUEST
DEPLOY_PRODUCTION
MODIFY_PRODUCTION_DATA
GENERATE_REPORT
ANALYZE_FAILURE
```

The list may be extended when new external actions are introduced.

---

# Output Contract

The agent decision must contain:

```json
{
  "action": "string",
  "environment": "string",
  "approvalRequired": false,
  "status": "PENDING",
  "reason": "string",
  "risk": "string",
  "reversible": true
}
```

Validation rules:

* `action` is required
* `environment` is required
* `approvalRequired` must be boolean
* `status` must be `PENDING`, `APPROVED`, `REJECTED`, or `BLOCKED`
* `reason` is required
* `risk` is required
* `reversible` must be boolean

---

# Output Rules

## No Approval

Example:

```json
{
  "action": "RUN_QA_TEST",
  "environment": "qa",
  "approvalRequired": false,
  "status": "APPROVED",
  "reason": "QA test execution is an approved non-destructive operation.",
  "risk": "Test execution may generate test data.",
  "reversible": true
}
```

---

## Approval Required

Example:

```json
{
  "action": "CREATE_JIRA_BUG",
  "environment": "qa",
  "approvalRequired": true,
  "status": "PENDING",
  "reason": "Creating a Jira bug modifies an external system.",
  "risk": "Creates an external Jira issue.",
  "reversible": true
}
```

---

## Blocked

Example:

```json
{
  "action": "MODIFY_PRODUCTION_DATA",
  "environment": "prod",
  "approvalRequired": true,
  "status": "BLOCKED",
  "reason": "The requested operation is not permitted by the current QA workflow.",
  "risk": "Potential production data modification.",
  "reversible": false
}
```

---

# Safety Rules

The Human Approval Gate must never:

* assume approval
* interpret ambiguous responses as approval
* bypass approval because execution is urgent
* bypass approval because an LLM recommends the action
* reuse unrelated approval
* expose credentials while requesting approval
* approve an action on behalf of the human
* convert a rejection into approval
* execute a blocked action
* treat historical evidence as authorization
* treat CI execution as authorization
* treat Jira permissions as human approval
* treat API credentials as human approval

---

# Approval Audit

Every approval-required action should produce an audit record containing:

```text
timestamp
action
target
environment
reason
approvalRequired
approvalStatus
```

Do not store:

* passwords
* API keys
* authentication tokens
* OTPs
* other secrets

Example:

```json
{
  "timestamp": "2026-09-21T10:00:00.000Z",
  "action": "CREATE_JIRA_BUG",
  "target": "TEST-1",
  "environment": "qa",
  "reason": "Failed test requires defect tracking.",
  "approvalRequired": true,
  "approvalStatus": "APPROVED"
}
```

---

# Completion Criteria

The Human Approval Gate implementation is complete when:

* [ ] Human Approval Skill exists
* [ ] approval-required actions are defined
* [ ] safe autonomous actions are defined
* [ ] approval states are defined
* [ ] approval requests are explicit
* [ ] ambiguous responses do not grant approval
* [ ] approval scope is specific
* [ ] blocked actions cannot execute
* [ ] AgentController can invoke the gate
* [ ] Jira writes are protected
* [ ] external email is protected
* [ ] production execution is protected
* [ ] repository external writes are protected
* [ ] CI/CD respects approval requirements
* [ ] approval decisions are auditable
* [ ] no secrets are exposed
* [ ] integration tests pass

---

# Completion Summary

At the end of an approval-gated workflow, report:

```text
Human Approval Summary

Action:
Target:
Environment:
Approval Required:
Approval Status:
Reason:
Execution Status:
```

The summary must reflect the actual approval state.

An action must never be reported as executed when approval was rejected, pending, or blocked.

```

This gives us the **Skill layer only**. Next we can build the small `HumanApprovalGate` utility and then integrate it into `AgentController` without mixing approval logic into Jira, Playwright, or CI/CD.
```
