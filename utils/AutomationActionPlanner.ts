import {
    AutomationDecision,
    AutomationStrategy,
} from './AutomationStrategy';

export type AutomationPlan = {
    strategy: AutomationStrategy;
    executionType: 'ui' | 'api' | 'hybrid';
    components: string[];
};

export class AutomationActionPlanner {

    plan(decision: AutomationDecision): AutomationPlan {

        switch (decision.strategy) {

            case 'ui-only':
                return {
                    strategy: 'ui-only',
                    executionType: 'ui',
                    components: [
                        'Page Object',
                        'Business Flow',
                        'Playwright Test',
                    ],
                };

            case 'api-only':
                return {
                    strategy: 'api-only',
                    executionType: 'api',
                    components: [
                        'ApiClient',
                        'API Service',
                        'Playwright API Test',
                    ],
                };

            case 'api-ui-hybrid':
                return {
                    strategy: 'api-ui-hybrid',
                    executionType: 'hybrid',
                    components: [
                        'API Service',
                        'Page Object',
                        'Business Flow',
                        'Playwright Test',
                    ],
                };

            default:
                throw new Error(
                    `Unsupported automation strategy: ${decision.strategy}`
                );
        }
    }
}