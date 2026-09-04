# Jira Requirement Analysis

## Purpose

This skill is responsible for analyzing a Jira issue before test cases or automation are created.

The goal is to understand the requirement accurately and identify missing or ambiguous information.

---

## When to Use This Skill

Use this skill when:

* A Jira issue is provided.
* A user asks to automate a Jira requirement.
* A new QA automation task starts.

---

## Process

### Step 1: Read the Jira Issue

Retrieve and analyze:

* Issue key
* Title
* Description
* Issue type
* Acceptance criteria
* Priority
* Attachments, if available

Do not assume missing information.

---

### Step 2: Extract Requirements

Identify:

* Main feature
* User actions
* Expected behavior
* Input requirements
* Business rules
* Acceptance criteria

Only extract information explicitly available in Jira.

---

### Step 3: Identify Missing Information

Check whether the following information is available:

* Acceptance criteria
* Expected behavior
* Test environment
* Test data
* User credentials

If information is unavailable, mark it as:

`UNKNOWN`

Do not invent missing requirements.

---

### Step 4: Identify Ambiguity

Identify statements that could have multiple interpretations.

Examples:

* "User should be able to login."
* "The system should validate the user."
* "Display an appropriate error."

Do not guess what these statements mean.

Mark ambiguous requirements clearly.

---

## Output Format

Return a structured requirement analysis:

```json
{
  "issueKey": "string",
  "feature": "string",
  "requirements": [
    "string"
  ],
  "acceptanceCriteria": [
    "string"
  ],
  "unknownInformation": [
    "string"
  ],
  "ambiguities": [
    "string"
  ]
}
```

---

## Rules

1. Do not invent requirements.
2. Do not invent acceptance criteria.
3. Do not invent application behavior.
4. Do not invent test credentials.
5. Do not invent API endpoints.
6. Do not invent UI selectors.
7. Clearly identify unknown information.
8. Clearly identify ambiguous requirements.
9. Do not create test cases in this skill.
10. Do not create Playwright automation in this skill.

---

## Completion

The Jira analysis is complete when:

* The Jira issue has been analyzed.
* Explicit requirements have been extracted.
* Acceptance criteria have been identified.
* Unknown information has been identified.
* Ambiguities have been identified.
* Structured output has been produced.
