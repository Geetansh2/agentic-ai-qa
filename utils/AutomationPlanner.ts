import { AutomationStrategyAgent } from './AutomationStrategyAgent';
import { AutomationDecision } from './AutomationStrategy';

export class AutomationPlanner {

    private readonly strategyAgent: AutomationStrategyAgent;

    constructor() {
        this.strategyAgent = new AutomationStrategyAgent();
    }

    async plan(testCase: string): Promise<AutomationDecision> {
        const decision = await this.strategyAgent.decide(testCase);

        console.log(
            `[AUTOMATION PLANNER] Strategy: ${decision.strategy}`
        );

        console.log(
            `[AUTOMATION PLANNER] Reason: ${decision.reason}`
        );

        return decision;
    }
}