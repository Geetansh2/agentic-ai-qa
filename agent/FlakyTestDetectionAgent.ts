
import fs from 'fs';
import path from 'path';

import { LLMClient } from '../utils/LLMClient';

export type FlakyTestClassification =
    | 'STABLE'
    | 'FLAKY'
    | 'INCONCLUSIVE';

export type FlakyTestDecision = {
    classification: FlakyTestClassification;
    reason: string;
    confidence: number;
    signals: string[];
};

export class FlakyTestDetectionAgent {

    private readonly llm: LLMClient;

    constructor() {

        this.llm =
            new LLMClient();
    }

    async analyze(

        testCaseId: string,

        executionHistory:
            Record<string, unknown>[]

    ): Promise<FlakyTestDecision> {

        console.log(
            `\n[FLAKY TEST AGENT] ` +
            `Analyzing ${testCaseId}`
        );

        /*
         * 1. Load Flaky Test Detection Skill
         */

        const skill =
            this.loadFlakyTestSkill();

        /*
         * 2. Build prompt
         */

        const prompt = `

Use the following Flaky Test Detection Skill
as the authoritative instruction.

==================================================
FLAKY TEST DETECTION SKILL
==================================================

${skill}

==================================================
TEST CASE
==================================================

Test Case ID:

${testCaseId}

==================================================
EXECUTION HISTORY
==================================================

${JSON.stringify(
    executionHistory,
    null,
    2
)}

==================================================
INSTRUCTION
==================================================

Analyze the execution history using the Skill.

Determine whether the test is:

STABLE
FLAKY
INCONCLUSIVE

Return ONLY the JSON object defined by the Skill.

Do not return Markdown.

Do not return a code block.

Do not return explanations outside the JSON.

`;

        /*
         * 3. Ask OpenAI
         */

        const response =
            await this.llm.ask(
                prompt
            );

        /*
         * 4. Parse response
         */

        const decision =
            this.parseDecision(
                response
            );

        /*
         * 5. Validate decision
         */

        this.validateDecision(
            decision
        );

        console.log(
            `[FLAKY TEST AGENT] ` +
            `Classification: ${decision.classification}`
        );

        console.log(
            `[FLAKY TEST AGENT] ` +
            `Confidence: ${decision.confidence}`
        );

        console.log(
            `[FLAKY TEST AGENT] ` +
            `Reason: ${decision.reason}`
        );

        console.log(
            `[FLAKY TEST AGENT] ` +
            `Signals: ${decision.signals.join('; ')}`
        );

        return decision;
    }

    private loadFlakyTestSkill(): string {

        const skillPath =
            path.resolve(
                process.cwd(),
                '.claude',
                'skills',
                'flaky-test-detection',
                'SKILL.md'
            );

        if (!fs.existsSync(skillPath)) {

            throw new Error(
                `Flaky Test Detection Skill not found: ` +
                `${skillPath}`
            );
        }

        console.log(
            `[FLAKY TEST AGENT] Loading Skill: ` +
            `${skillPath}`
        );

        return fs.readFileSync(
            skillPath,
            'utf-8'
        );
    }

    private parseDecision(
        response: string
    ): FlakyTestDecision {

        try {

            return JSON.parse(
                response
            ) as FlakyTestDecision;

        } catch {

            throw new Error(
                `Flaky Test Agent returned invalid JSON:\n${response}`
            );
        }
    }

    private validateDecision(
        decision: FlakyTestDecision
    ): void {

        if (!decision) {

            throw new Error(
                'Flaky Test Agent returned an empty decision'
            );
        }

        const validClassifications:
            FlakyTestClassification[] = [

            'STABLE',

            'FLAKY',

            'INCONCLUSIVE',

        ];

        if (

            !validClassifications.includes(
                decision.classification
            )

        ) {

            throw new Error(
                `Invalid flaky test classification: ` +
                `${decision.classification}`
            );
        }

        if (!decision.reason) {

            throw new Error(
                'Flaky Test Agent did not provide a reason'
            );
        }

        if (

            typeof decision.confidence !==
            'number'

        ) {

            throw new Error(
                'Flaky Test Agent confidence must be a number'
            );
        }

        if (

            decision.confidence < 0 ||
            decision.confidence > 1

        ) {

            throw new Error(
                'Flaky Test Agent confidence must be between 0 and 1'
            );
        }

        if (!Array.isArray(decision.signals)) {

            throw new Error(
                'Flaky Test Agent signals must be an array'
            );
        }
    }
}

