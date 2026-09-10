import { LLMClient } from './LLMClient';
import {
    AutomationDecision,
    AutomationStrategy,
} from './AutomationStrategy';

export class AutomationStrategyAgent {

    private readonly llm: LLMClient;

    constructor() {
        this.llm = new LLMClient();
    }

    async decide(testCase: string): Promise<AutomationDecision> {

        const prompt = `
You are an expert QA automation architect.

Analyze the following test case and choose exactly one automation strategy.

Allowed strategies:
- ui-only
- api-only
- api-ui-hybrid

Definitions:
- ui-only: The test can be validated entirely through the user interface.
- api-only: The test focuses entirely on API/backend behavior.
- api-ui-hybrid: The test requires both API/backend interaction and UI validation.

Return ONLY valid JSON in this exact format:

{
  "strategy": "ui-only",
  "reason": "short explanation"
}

Test case:
${testCase}
`;

        const response = await this.llm.ask(prompt);

        let decision: AutomationDecision;

        try {
            decision = JSON.parse(response);
        } catch {
            throw new Error(
                `LLM returned invalid JSON: ${response}`
            );
        }

        const validStrategies: AutomationStrategy[] = [
            'ui-only',
            'api-only',
            'api-ui-hybrid',
        ];

        if (!validStrategies.includes(decision.strategy)) {
            throw new Error(
                `Invalid automation strategy returned by LLM: ${decision.strategy}`
            );
        }

        if (!decision.reason) {
            throw new Error(
                'LLM did not provide a reason for the automation strategy'
            );
        }

        return decision;
    }
}