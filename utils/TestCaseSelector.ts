import { LLMClient } from './LLMClient';

export type TestCase = {
    id: string;
    title: string;
    automated?: boolean;
    [key: string]: unknown;
};

export type TestCaseSelection =
    | {
        status: 'SELECTED';
        testCase: TestCase;
        reason: string;
    }
    | {
        status: 'NO_CANDIDATE';
        reason: string;
    };

export class TestCaseSelector {

    private readonly llm: LLMClient;

    constructor() {
        this.llm = new LLMClient();
    }

    async select(
        testCases: TestCase[]
    ): Promise<TestCaseSelection> {

        const candidates = testCases.filter(
            testCase => testCase.automated !== true
        );

        console.log(
            `[TEST CASE SELECTOR] Candidates: ${candidates.length}`
        );

        if (candidates.length === 0) {
            return {
                status: 'NO_CANDIDATE',
                reason: 'All test cases are already automated.',
            };
        }

        const prompt = `
You are an expert QA automation agent.

Select EXACTLY ONE test case from the candidates.

Return ONLY valid JSON:

{
  "id": "TC-001",
  "reason": "short explanation"
}

Rules:
- Select exactly one test case.
- The selected ID MUST exist in the candidates.
- Do not select a test case outside the candidates.

Candidates:
${JSON.stringify(candidates, null, 2)}
`;

        const response = await this.llm.ask(prompt);

        let selection: {
            id: string;
            reason: string;
        };

        try {
            selection = JSON.parse(response);
        } catch {
            throw new Error(
                `LLM returned invalid JSON: ${response}`
            );
        }

        if (!selection.id) {
            throw new Error(
                'LLM did not return a test case ID'
            );
        }

        if (!selection.reason) {
            throw new Error(
                'LLM did not provide a selection reason'
            );
        }

        const selectedCase = candidates.find(
            testCase => testCase.id === selection.id
        );

        if (!selectedCase) {
            throw new Error(
                `LLM selected invalid test case: ${selection.id}`
            );
        }

        return {
            status: 'SELECTED',
            testCase: selectedCase,
            reason: selection.reason,
        };
    }
}