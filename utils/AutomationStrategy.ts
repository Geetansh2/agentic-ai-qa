export type AutomationStrategy =
    | 'ui-only'
    | 'api-only'
    | 'api-ui-hybrid';

export type AutomationDecision = {
    strategy: AutomationStrategy;
    reason: string;
};