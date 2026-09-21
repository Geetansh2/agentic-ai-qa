
import { test, expect } from '@playwright/test';

import {
    HumanApprovalGate,
    ApprovalRequest,
} from '../utils/HumanApprovalGate';

import {
    HumanApprovalPrompt,
} from '../utils/HumanApprovalPrompt';

test.describe(
    'Human Approval Integration',
    () => {

        test(
            'should wait for human approval and continue when APPROVED',
            async () => {

                const gate =
                    new HumanApprovalGate();

                const request:
                    ApprovalRequest = {
                        action:
                            'CREATE_JIRA_BUG',
                        target:
                            'TEST-1 / TC-004',
                        environment:
                            'qa',
                        reason:
                            'Create a Jira bug for the failed test.',
                        risk:
                            'Creates an external Jira issue.',
                        reversible:
                            true,
                    };

                const pendingDecision =
                    gate.evaluate(
                        request
                    );

                expect(
                    pendingDecision.status
                ).toBe('PENDING');

                const prompt =
                    new HumanApprovalPrompt();

                const finalDecision =
                    await prompt.requestApproval(
                        pendingDecision
                    );

                expect(
                    finalDecision.status
                ).toBe('APPROVED');

                expect(
                    gate.canExecute(
                        finalDecision
                    )
                ).toBe(true);
            }
        );
    }
);

