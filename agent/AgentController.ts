
import { AutomationPlanner } from '../utils/AutomationPlanner';
import {
    AutomationActionPlanner,
    AutomationPlan,
} from '../utils/AutomationActionPlanner';
import { TestCaseLoader } from '../utils/TestCaseLoader';
import { TestAutomationRegistry } from '../utils/TestAutomationRegistry';
import { TestCaseSelector } from '../utils/TestCaseSelector';

import { PlaywrightAutomationAgent } from './PlaywrightAutomationAgent';
import { AutomationApplier } from './AutomationApplier';
import { AutomationExecutor } from './AutomationExecutor';
import {
    HistoricalFailureKnowledgeAgent,
} from './HistoricalFailureKnowledgeAgent';

import {
    HistoricalFailureStore,
} from '../utils/HistoricalFailureStore';

import {
    HumanApprovalGate,
} from '../utils/HumanApprovalGate';

import {
    HumanApprovalResolver,
} from '../utils/HumanApprovalResolver';


import {
    HumanApprovalPrompt,
} from '../utils/HumanApprovalPrompt';



export type AutomationTask = {
    jiraIssueKey: string;
    testCaseId: string;
    testCase: Record<string, unknown>;
    strategy: AutomationPlan['strategy'];
    executionType: AutomationPlan['executionType'];
    components: string[];
};

export class AgentController {

    private readonly automationPlanner:
        AutomationPlanner;

    private readonly actionPlanner:
        AutomationActionPlanner;

    private readonly automationRegistry:
        TestAutomationRegistry;

    private readonly testCaseSelector:
        TestCaseSelector;

    private readonly playwrightAutomationAgent:
        PlaywrightAutomationAgent;

    private readonly automationApplier:
        AutomationApplier;

    private readonly automationExecutor:
        AutomationExecutor;

    private readonly historicalFailureKnowledgeAgent:
        HistoricalFailureKnowledgeAgent;

    private readonly historicalFailureStore:
        HistoricalFailureStore;

    private readonly humanApprovalGate:
        HumanApprovalGate;
    
    private readonly humanApprovalResolver:
        HumanApprovalResolver;
    
    private readonly humanApprovalPrompt: HumanApprovalPrompt;

    constructor() {

        this.automationPlanner =
            new AutomationPlanner();

        this.actionPlanner =
            new AutomationActionPlanner();

        this.automationRegistry =
            new TestAutomationRegistry();

        this.testCaseSelector =
            new TestCaseSelector();

        this.playwrightAutomationAgent =
            new PlaywrightAutomationAgent();

        this.automationApplier =
            new AutomationApplier();

        this.automationExecutor =
            new AutomationExecutor();

        this.historicalFailureKnowledgeAgent =
            new HistoricalFailureKnowledgeAgent();

        this.historicalFailureStore =
            new HistoricalFailureStore();
        
        this.humanApprovalGate =
            new HumanApprovalGate();

        this.humanApprovalResolver =
            new HumanApprovalResolver(
                this.humanApprovalGate
            );

        this.humanApprovalPrompt = new HumanApprovalPrompt();
    }

    async plan(
        jiraIssueKey: string
    ): Promise<AutomationTask> {

        console.log(
            `\n[AGENT] Starting automation planning for ${jiraIssueKey}`
        );

        const testCaseJson =
            TestCaseLoader.load(
                jiraIssueKey
            );

        const testCaseData =
            JSON.parse(
                testCaseJson
            );

        if (
            !testCaseData.testCases?.length
        ) {
            throw new Error(
                `No test cases found for ${jiraIssueKey}`
            );
        }

        const candidates =
            testCaseData.testCases.filter(
                (testCase: { id: string }) => {

                    const automated =
                        this.automationRegistry.isAutomated(
                            testCase.id
                        );

                    console.log(
                        `[AGENT] ${testCase.id}: ` +
                        `${
                            automated
                                ? 'ALREADY AUTOMATED → SKIP'
                                : 'NOT AUTOMATED → CANDIDATE'
                        }`
                    );

                    return !automated;
                }
            );

        if (
            candidates.length === 0
        ) {
            throw new Error(
                `[AGENT] No automation candidates found for ${jiraIssueKey}. ` +
                `All test cases are already automated.`
            );
        }

        const selection =
            await this.testCaseSelector.select(
                candidates
            );

        if (
            selection.status ===
            'NO_CANDIDATE'
        ) {
            throw new Error(
                `[AGENT] ${selection.reason}`
            );
        }

        const selectedTestCase =
            selection.testCase;

        console.log(
            `[AGENT] LLM selected test case: ` +
            `${selectedTestCase.id}`
        );

        console.log(
            `[AGENT] Selection reason: ` +
            `${selection.reason}`
        );

        const decision =
            await this.automationPlanner.plan(
                JSON.stringify(
                    selectedTestCase
                )
            );

        const plan =
            this.actionPlanner.plan(
                decision
            );

        console.log(
            `[AGENT] Strategy: ${plan.strategy}`
        );

        console.log(
            `[AGENT] Execution type: ` +
            `${plan.executionType}`
        );

        console.log(
            `[AGENT] Components: ` +
            `${plan.components.join(', ')}`
        );

        const automationTask:
            AutomationTask = {

            jiraIssueKey,

            testCaseId:
                selectedTestCase.id,

            testCase:
                selectedTestCase,

            strategy:
                plan.strategy,

            executionType:
                plan.executionType,

            components:
                plan.components,
        };

        console.log(
            '\n[AGENT] Automation task created:',
            JSON.stringify(
                automationTask,
                null,
                2
            )
        );

        return automationTask;
    }

    async run(
        jiraIssueKey: string
    ): Promise<void> {

        console.log(
            `\n========================================`
        );

        console.log(
            `[AGENT] Starting autonomous QA workflow: ${jiraIssueKey}`
        );

        console.log(
            `========================================\n`
        );

        const task =
            await this.plan(
                jiraIssueKey
            );

        console.log(
            `\n[AGENT] Generating automation for ` +
            `${task.testCaseId}`
        );

        const proposal =
            await this.playwrightAutomationAgent.generate(
                task
            );

        console.log(
            `\n[AGENT] Generated automation proposal:`
        );

        console.log(
            JSON.stringify(
                proposal,
                null,
                2
            )
        );

        console.log(
            `\n[AGENT] Applying automation for ` +
            `${proposal.testCaseId}`
        );

        this.automationApplier.apply(
            proposal
        );

        console.log(
            `\n[AGENT] Executing ` +
            `${proposal.testCaseId}`
        );

        const approvalDecision =
        this.humanApprovalGate.evaluate({
        action:
            process.env.ENV?.toLowerCase() === 'prod'
                ? 'RUN_PROD_TEST'
                : 'RUN_QA_TEST',

        target:
            `${proposal.testCaseId} / ${proposal.file}`,

        environment:
            process.env.ENV ?? 'qa',

        reason:
            `Execute generated Playwright automation for ` +
            `${proposal.testCaseId}.`,

        risk:
            process.env.ENV?.toLowerCase() === 'prod'
                ? 'Production test execution may affect live systems.'
                : 'Normal non-production QA automation execution.',

        reversible:
            true,
    });

        console.log(
            '[AGENT] Human approval decision:'
        );

        console.log(
            JSON.stringify(
                approvalDecision,
                null,
                2
            )
        );

        if (
            approvalDecision.status ===
            'BLOCKED'
        ) {
            throw new Error(
                `[AGENT] Action blocked by human approval gate: ` +
                `${approvalDecision.reason}`
            );
        }


if (
    approvalDecision.status ===
    'PENDING'
) {
    console.log(
        '[AGENT] Human approval required.'
    );

    const finalApprovalDecision =
        await this.humanApprovalPrompt
            .requestApproval(
                approvalDecision
            );

    console.log(
        `[AGENT] Human approval result: ` +
        `${finalApprovalDecision.status}`
    );

    if (
        !this.humanApprovalGate
            .canExecute(
                finalApprovalDecision
            )
    ) {
        throw new Error(
            `[AGENT] Human approval denied: ` +
            `${finalApprovalDecision.status}`
        );
    }
}


        if (
            !this.humanApprovalGate.canExecute(
                approvalDecision
            )
        ) {
            throw new Error(
                `[AGENT] Execution denied by human approval gate.`
            );
        }

        const execution =
            await this.automationExecutor.execute(
                proposal.file,
                proposal.testCaseId
            );

        console.log(
            `[AGENT] Execution status: ` +
            `${execution.status}`
        );

       if (
    execution.status ===
    'FAILED'
) {
    console.log(
        `\n[AGENT] Execution failed. ` +
        `Checking historical failure knowledge...`
    );

    const currentFailure = {
        testCaseId:
            proposal.testCaseId,

        testName:
            proposal.testCaseId,

        testFile:
            proposal.file,

        errorMessage:
            execution.output,

        failureType:
            'AUTOMATION_EXECUTION_FAILURE',

        environment:
            process.env.ENV ?? 'qa',

        browser:
            'chromium',
    };

    try {
        const historicalDecision =
            await this
                .historicalFailureKnowledgeAgent
                .analyze(
                    currentFailure
                );

        console.log(
            `\n[AGENT] Historical failure analysis:`
        );

        console.log(
            JSON.stringify(
                historicalDecision,
                null,
                2
            )
        );
    } catch (error) {
        console.error(
            `[AGENT] Historical failure analysis failed:`,
            error
        );
    }

    this.historicalFailureStore.save({
        testCaseId:
            proposal.testCaseId,

        testName:
            proposal.testCaseId,

        testFile:
            proposal.file,

        errorMessage:
            execution.output,

        failureType:
            'AUTOMATION_EXECUTION_FAILURE',

        environment:
            process.env.ENV ?? 'qa',

        browser:
            'chromium',

        timestamp:
            new Date().toISOString(),
    });

    throw new Error(
        `[AGENT] ${proposal.testCaseId} execution failed.\n\n` +
        `Playwright output:\n${execution.output}`
    );
}

        this.historicalFailureStore.save({
            testCaseId:
                proposal.testCaseId,

            testName:
                proposal.testCaseId,

            testFile:
                proposal.file,

            errorMessage:
                execution.output,

            failureType:
                'AUTOMATION_EXECUTION_FAILURE',

            environment:
                process.env.ENV ?? 'qa',

            browser:
                'chromium',

            timestamp:
                new Date().toISOString(),
        });
        console.log(
            `\n========================================`
        );

        console.log(
            `[AGENT] Autonomous QA workflow completed successfully`
        );

        console.log(
            `========================================\n`
        );
    }
}

