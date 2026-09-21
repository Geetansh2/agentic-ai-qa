import fs from 'fs';
import path from 'path';

import { LLMClient } from '../utils/LLMClient';
import {
HistoricalFailureStore,
HistoricalFailureRecord,
} from '../utils/HistoricalFailureStore';

export type HistoricalMatchType =
| 'STRONG_MATCH'
| 'PARTIAL_MATCH'
| 'WEAK_MATCH'
| 'NO_RELEVANT_HISTORY';

export type HistoricalRelevantFailure = {
testCaseId: string;
reason: string;
matchingSignals: string[];
};

export type HistoricalFailureDecision = {
matchType: HistoricalMatchType;
relevantFailures: HistoricalRelevantFailure[];
recurringPattern: boolean;
historicalRootCause?: string;
rootCauseConsistent?: boolean;
confidence: number;
summary: string;
};

export class HistoricalFailureKnowledgeAgent {


private readonly llm: LLMClient;
private readonly failureStore: HistoricalFailureStore;

constructor(
    failureStore?: HistoricalFailureStore
) {
    this.llm = new LLMClient();

    this.failureStore =
        failureStore ??
        new HistoricalFailureStore();
}

async analyze(
    currentFailure: Record<string, unknown>
): Promise<HistoricalFailureDecision> {

    console.log(
        '\n[HISTORICAL FAILURE AGENT] ' +
        'Analyzing current failure'
    );

    const testCaseId =
        this.getTestCaseId(
            currentFailure
        );

    const errorMessage =
        this.getErrorMessage(
            currentFailure
        );

    console.log(
        `[HISTORICAL FAILURE AGENT] ` +
        `Test case: ${testCaseId}`
    );

    console.log(
        `[HISTORICAL FAILURE AGENT] ` +
        `Retrieving historical failures...`
    );

    const historicalFailures =
        this.failureStore.findRelevant(
            testCaseId,
            errorMessage
        );

    console.log(
        `[HISTORICAL FAILURE AGENT] ` +
        `Retrieved ${historicalFailures.length} ` +
        `historical failure(s)`
    );

    const skill =
        this.loadHistoricalFailureSkill();

    const prompt = `


Use the following Historical Failure Knowledge Skill
as the authoritative instruction.

==================================================
HISTORICAL FAILURE KNOWLEDGE SKILL
==================================

${skill}

==================================================
CURRENT FAILURE
===============

${JSON.stringify(
currentFailure,
null,
2
)}

==================================================
RETRIEVED HISTORICAL FAILURE RECORDS
====================================

${JSON.stringify(
historicalFailures,
null,
2
)}

==================================================
INSTRUCTION
===========

Analyze the current failure against the retrieved
historical failure records using the Skill.

Determine:

1. Which historical failures are relevant.
2. Why they are relevant.
3. Which signals match.
4. Whether the failure represents a recurring pattern.
5. Whether the historical root cause is consistent
   with the current failure.
6. The confidence of the historical match.

If no relevant historical failures are available,
return:

{
"matchType": "NO_RELEVANT_HISTORY",
"relevantFailures": [],
"recurringPattern": false,
"confidence": 0,
"summary": "No relevant historical failure was found."
}

Return ONLY the JSON object defined by the Skill.

Do not return Markdown.

Do not return a code block.

Do not return explanations outside the JSON.

Do not invent historical failures.

Do not invent root causes.

Do not invent resolutions.
`;


    const response =
        await this.llm.ask(prompt);

    const decision =
        this.parseDecision(response);

    this.validateDecision(
        decision
    );

    console.log(
        `[HISTORICAL FAILURE AGENT] ` +
        `Match type: ${decision.matchType}`
    );

    console.log(
        `[HISTORICAL FAILURE AGENT] ` +
        `Confidence: ${decision.confidence}`
    );

    console.log(
        `[HISTORICAL FAILURE AGENT] ` +
        `Recurring pattern: ${decision.recurringPattern}`
    );

    console.log(
        `[HISTORICAL FAILURE AGENT] ` +
        `Summary: ${decision.summary}`
    );

    return decision;
}

private getTestCaseId(
    currentFailure: Record<string, unknown>
): string {

    const testCaseId =
        currentFailure.testCaseId;

    if (
        typeof testCaseId !==
        'string' ||
        !testCaseId.trim()
    ) {
        throw new Error(
            'Current failure is missing testCaseId'
        );
    }

    return testCaseId;
}

private getErrorMessage(
    currentFailure: Record<string, unknown>
): string {

    const errorMessage =
        currentFailure.errorMessage;

    if (
        typeof errorMessage !==
        'string'
    ) {
        return '';
    }

    return errorMessage;
}

private loadHistoricalFailureSkill(): string {

    const skillPath =
        path.resolve(
            process.cwd(),
            '.claude',
            'skills',
            'historical-failure-knowledge',
            'SKILL.md'
        );

    if (!fs.existsSync(skillPath)) {
        throw new Error(
            `Historical Failure Knowledge Skill not found: ` +
            `${skillPath}`
        );
    }

    console.log(
        `[HISTORICAL FAILURE AGENT] ` +
        `Loading Skill: ${skillPath}`
    );

    return fs.readFileSync(
        skillPath,
        'utf-8'
    );
}

private parseDecision(
    response: string
): HistoricalFailureDecision {

    try {
        return JSON.parse(
            response
        ) as HistoricalFailureDecision;

    } catch {
        throw new Error(
            `Historical Failure Agent returned invalid JSON:\n${response}`
        );
    }
}

private validateDecision(
    decision: HistoricalFailureDecision
): void {

    if (!decision) {
        throw new Error(
            'Historical Failure Agent returned an empty decision'
        );
    }

    const validMatchTypes:
        HistoricalMatchType[] = [
            'STRONG_MATCH',
            'PARTIAL_MATCH',
            'WEAK_MATCH',
            'NO_RELEVANT_HISTORY',
        ];

    if (
        !validMatchTypes.includes(
            decision.matchType
        )
    ) {
        throw new Error(
            `Invalid historical match type: ` +
            `${decision.matchType}`
        );
    }

    if (
        !Array.isArray(
            decision.relevantFailures
        )
    ) {
        throw new Error(
            'Historical Failure Agent ' +
            'relevantFailures must be an array'
        );
    }

    if (
        typeof decision.recurringPattern !==
        'boolean'
    ) {
        throw new Error(
            'Historical Failure Agent ' +
            'recurringPattern must be a boolean'
        );
    }

    if (
        typeof decision.confidence !==
        'number'
    ) {
        throw new Error(
            'Historical Failure Agent ' +
            'confidence must be a number'
        );
    }

    if (
        decision.confidence < 0 ||
        decision.confidence > 1
    ) {
        throw new Error(
            'Historical Failure Agent ' +
            'confidence must be between 0 and 1'
        );
    }

    if (!decision.summary) {
        throw new Error(
            'Historical Failure Agent ' +
            'did not provide a summary'
        );
    }

    for (
        const failure
        of decision.relevantFailures
    ) {

        if (!failure.testCaseId) {
            throw new Error(
                'Historical relevant failure ' +
                'is missing testCaseId'
            );
        }

        if (!failure.reason) {
            throw new Error(
                `Historical failure ` +
                `${failure.testCaseId} ` +
                `is missing reason`
            );
        }

        if (
            !Array.isArray(
                failure.matchingSignals
            )
        ) {
            throw new Error(
                `Historical failure ` +
                `${failure.testCaseId} ` +
                `matchingSignals must be an array`
            );
        }
    }

    if (
        decision.matchType ===
        'NO_RELEVANT_HISTORY' &&
        decision.relevantFailures.length > 0
    ) {
        throw new Error(
            'NO_RELEVANT_HISTORY cannot ' +
            'contain relevant failures'
        );
    }
}


}
