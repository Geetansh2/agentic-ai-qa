import { AutomationDecision, AutomationStrategy } from "./AutomationStrategy";

export class AutomationStrategyAgent{
    decide(testCase: string): AutomationDecision{
        const normalized = testCase.toLowerCase();

        if (normalized.includes('api') && normalized.includes('ui')){
            return {
                strategy: 'api-ui-hybrid',
                reason: 'Test case explicitly requires both API and UI validation.',
            };
        }
        if (
            normalized.includes('api') ||
            normalized.includes('endpoint') ||
            normalized.includes('request') ||
            normalized.includes('response')
        ) {
            return {
                strategy: 'api-only',
                reason: 'Test case focuses on backend/API behavior.',
            };
        }

        // UI-only
        return {
            strategy: 'ui-only',
            reason: 'Test case primarily validates user interface behavior.',
        };

    }
}