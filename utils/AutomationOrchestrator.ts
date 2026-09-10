import { AutomationPlanner } from './AutomationPlanner';
import {
    AutomationActionPlanner,
    AutomationPlan,
} from './AutomationActionPlanner';

export class AutomationOrchestrator {

    private readonly planner: AutomationPlanner;
    private readonly actionPlanner: AutomationActionPlanner;

    constructor() {
        this.planner = new AutomationPlanner();
        this.actionPlanner = new AutomationActionPlanner();
    }

    async createPlan(testCase: string): Promise<AutomationPlan> {

        console.log(
            '[AUTOMATION ORCHESTRATOR] Analyzing test case...'
        );

        const decision = await this.planner.plan(testCase);

        const plan = this.actionPlanner.plan(decision);

        console.log(
            `[AUTOMATION ORCHESTRATOR] Strategy: ${plan.strategy}`
        );

        console.log(
            `[AUTOMATION ORCHESTRATOR] Execution Type: ${plan.executionType}`
        );

        console.log(
            `[AUTOMATION ORCHESTRATOR] Components: ${plan.components.join(', ')}`
        );

        return plan;
    }
}