
import fs from 'fs';
import path from 'path';

import { LLMClient } from '../utils/LLMClient';
import { AutomationTask } from './AgentController';
import {
    ProjectInspector,
    InspectedFile,
} from './ProjectInspector';

export type PlaywrightAutomationProposal = {
    file: string;
    testCaseId: string;
    code: string;
    reason: string;
};

export class PlaywrightAutomationAgent {

    private readonly llm: LLMClient;
    private readonly projectInspector: ProjectInspector;

    constructor() {

        this.llm = new LLMClient();

        this.projectInspector =
            new ProjectInspector();
    }

    async generate(
        task: AutomationTask
    ): Promise<PlaywrightAutomationProposal> {

        console.log(
            `\n[PLAYWRIGHT AGENT] ` +
            `Generating automation for ${task.testCaseId}`
        );

        /*
         * 1. Load Playwright Skill
         */
        const playwrightSkill =
            this.loadPlaywrightSkill();

        /*
         * 2. Dynamically inspect existing project
         */
        const inspectedFiles =
            this.projectInspector.inspect(
                task.testCase
            );

        /*
         * 3. Build framework context
         */
        const frameworkContext =
            this.buildFrameworkContext(
                inspectedFiles
            );

        /*
         * 4. Build LLM prompt
         */
        const prompt = `
You are the Playwright Automation Agent.

Your job is to create automation for EXACTLY ONE
selected QA test case.

The Playwright Automation Skill below is authoritative.

==================================================
PLAYWRIGHT AUTOMATION SKILL
==================================================

${playwrightSkill}

==================================================
SELECTED AUTOMATION TASK
==================================================

${JSON.stringify(
    task,
    null,
    2
)}

==================================================
EXISTING PROJECT CONTEXT
==================================================

The following files were dynamically discovered
from the existing project.

Use them to understand the existing framework.

Reuse existing:
- Page Objects
- Business Flows
- Components
- Fixtures
- API services
- Helpers
- Existing framework patterns

Do not create duplicate framework components.

${frameworkContext}

==================================================
AUTOMATION SCOPE
==================================================

You are automating ONLY:

${task.testCaseId}

This is extremely important.

The generated code must contain ONLY the automation
for ${task.testCaseId}.

DO NOT regenerate the existing test file.

DO NOT reproduce existing tests.

DO NOT copy existing test cases.

DO NOT include other test cases.

DO NOT include commented-out tests.

DO NOT include TC-001.

DO NOT include TC-002.

DO NOT include TC-003.

DO NOT include TC-004.

DO NOT include TC-005.

DO NOT include TC-006.

DO NOT include any other TC-* test case.

Only ${task.testCaseId} is allowed.

==================================================
FRAMEWORK REUSE
==================================================

Before creating automation:

1. Inspect the discovered project files.

2. Identify existing Page Objects.

3. Identify existing Business Flows.

4. Identify existing Components.

5. Identify existing Fixtures.

6. Identify existing API services.

7. Reuse existing capabilities wherever possible.

8. Do not duplicate existing framework code.

9. If a Page Object capability is missing,
   identify the smallest required change.

10. If a Business Flow capability is missing,
    identify the smallest reusable change.

==================================================
PLAYWRIGHT RULES
==================================================

Follow the Playwright Automation Skill.

Use stable locators.

Prefer:

1. getByRole()
2. getByLabel()
3. getByTestId()
4. getByText()

Do not invent selectors.

Use actual application behavior.

Every test must contain meaningful assertions.

The expected result of the selected test case
must be validated.

Include ${task.testCaseId} in the test title.

Do not weaken assertions.

Do not modify unrelated tests.

Do not trigger real OTP/SMS.

Do not use real OTPs.

Do not use production credentials.

Do not use sensitive personal information.

Follow the existing fixture architecture.

Do not put LLM/AI logic inside the Playwright test.

==================================================
IMPORTANT OUTPUT RULE
==================================================

Return ONLY the NEW TEST CODE required for:

${task.testCaseId}

The code must be a Playwright test that can be
added to the existing target file.

Do NOT return the entire existing test file.

Do NOT return imports that are already handled by
the existing target file unless they are genuinely
required.

Do NOT return other test cases.

Do NOT return commented-out tests.

The generated code must contain exactly ONE
Playwright test.

That test must be:

${task.testCaseId}

==================================================
OUTPUT
==================================================

Return ONLY valid JSON.

{
  "file": "tests/TEST-1-login.spec.ts",
  "testCaseId": "${task.testCaseId}",
  "code": "only the new Playwright test for ${task.testCaseId}",
  "reason": "short explanation"
}

Do not return Markdown.

Do not return a code block.

Do not return explanations outside the JSON.
`;

        /*
         * 5. Ask LLM
         */
        const response =
            await this.llm.ask(prompt);

        /*
         * 6. Parse response
         */
        const proposal =
            this.parseProposal(response);

        /*
         * 7. Validate proposal
         */
        this.validateProposal(
            proposal,
            task
        );

        console.log(
            `[PLAYWRIGHT AGENT] ` +
            `Test case: ${proposal.testCaseId}`
        );

        console.log(
            `[PLAYWRIGHT AGENT] ` +
            `Target file: ${proposal.file}`
        );

        console.log(
            `[PLAYWRIGHT AGENT] ` +
            `Reason: ${proposal.reason}`
        );

        return proposal;
    }

    private loadPlaywrightSkill(): string {

        const skillPath =
            path.resolve(
                process.cwd(),
                '.claude',
                'skills',
                'playwright',
                'SKILL.md'
            );

        if (!fs.existsSync(skillPath)) {

            throw new Error(
                `Playwright Skill not found: ${skillPath}`
            );
        }

        console.log(
            `[PLAYWRIGHT AGENT] Loading Skill: ${skillPath}`
        );

        return fs.readFileSync(
            skillPath,
            'utf-8'
        );
    }

    private buildFrameworkContext(
        files: InspectedFile[]
    ): string {

        if (files.length === 0) {

            return (
                'No relevant project files were discovered.'
            );
        }

        return files
            .map(file => `
===== ${file.file} =====

${file.content}
`)
            .join('\n');
    }

    private parseProposal(
        response: string
    ): PlaywrightAutomationProposal {

        try {

            return JSON.parse(
                response
            ) as PlaywrightAutomationProposal;

        } catch {

            throw new Error(
                `Playwright Agent returned invalid JSON:\n${response}`
            );
        }
    }

    private validateProposal(
        proposal: PlaywrightAutomationProposal,
        task: AutomationTask
    ): void {

        /*
         * Basic proposal validation
         */

        if (!proposal) {

            throw new Error(
                'Playwright Agent returned an empty proposal'
            );
        }

        if (!proposal.file) {

            throw new Error(
                'Playwright Agent did not return a target file'
            );
        }

        if (!proposal.testCaseId) {

            throw new Error(
                'Playwright Agent did not return a test case ID'
            );
        }

        if (
            proposal.testCaseId !==
            task.testCaseId
        ) {

            throw new Error(
                `Playwright Agent returned wrong test case: ` +
                `${proposal.testCaseId}. ` +
                `Expected: ${task.testCaseId}`
            );
        }

        if (!proposal.code) {

            throw new Error(
                'Playwright Agent did not return automation code'
            );
        }

        if (!proposal.reason) {

            throw new Error(
                'Playwright Agent did not provide a reason'
            );
        }

        /*
         * Target file validation
         */

        if (
            proposal.file.startsWith('/')
        ) {

            throw new Error(
                'Generated automation file must be project-relative'
            );
        }

        if (
            !proposal.file.startsWith(
                'tests/'
            )
        ) {

            throw new Error(
                `Generated automation must be stored under tests/: ` +
                `${proposal.file}`
            );
        }

        /*
         * Test case ID validation
         */

        if (
            !proposal.code.includes(
                task.testCaseId
            )
        ) {

            throw new Error(
                `Generated code does not contain ` +
                `${task.testCaseId}`
            );
        }

        /*
         * Assertion validation
         */

        if (
            !proposal.code.includes(
                'expect'
            )
        ) {

            throw new Error(
                'Generated automation does not contain an assertion'
            );
        }

        /*
         * Placeholder validation
         */

        if (
            proposal.code.includes(
                'TODO'
            )
        ) {

            throw new Error(
                'Generated automation contains TODO placeholders'
            );
        }

        /*
         * Make sure the agent did not return
         * multiple test cases.
         */

        const testCaseIds =
            proposal.code.match(
                /TC-\d+/g
            ) ?? [];

        const uniqueTestCaseIds =
            [
                ...new Set(
                    testCaseIds
                ),
            ];

        const unexpectedTestCaseIds =
            uniqueTestCaseIds.filter(
                id =>
                    id !== task.testCaseId
            );

        if (
            unexpectedTestCaseIds.length > 0
        ) {

            throw new Error(
                `Generated automation contains ` +
                `unexpected test case IDs: ` +
                `${unexpectedTestCaseIds.join(', ')}. ` +
                `Only ${task.testCaseId} is allowed.`
            );
        }

        /*
         * Make sure there is exactly one
         * Playwright test declaration.
         */

        const testDeclarations =
            proposal.code.match(
                /\btest\s*\(/g
            ) ?? [];

        if (
            testDeclarations.length !== 1
        ) {

            throw new Error(
                `Generated automation must contain exactly ` +
                `one Playwright test. Found: ` +
                `${testDeclarations.length}`
            );
        }

        /*
         * Prevent full existing test-file generation.
         *
         * If the agent starts returning multiple
         * unrelated test declarations, the validation
         * above will reject it.
         */

        if (
            proposal.code.includes(
                "test.describe("
            )
        ) {

            throw new Error(
                'Generated automation must contain only the new test, ' +
                'not the complete test suite.'
            );
        }

        /*
         * Prevent obvious copied test cases.
         */

        const forbiddenExistingTests = [
            'TC-001',
            'TC-002',
            'TC-003',
            'TC-004',
            'TC-005',
            'TC-006',
        ];

        for (
            const existingTestId
            of forbiddenExistingTests
        ) {

            if (
                existingTestId !==
                task.testCaseId &&
                proposal.code.includes(
                    existingTestId
                )
            ) {

                throw new Error(
                    `Generated automation contains existing ` +
                    `test case ${existingTestId}. ` +
                    `Only ${task.testCaseId} is allowed.`
                );
            }
        }
    }
}

