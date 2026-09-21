
import { test, expect } from '@playwright/test';

import {
    HumanApprovalGate,
    ApprovalDecision,
    ApprovalRequest,
} from '../utils/HumanApprovalGate';

test.describe(
    'Human Approval Gate',
    () => {

        test(
            'should automatically approve QA test execution',
            () => {

                const gate =
                    new HumanApprovalGate();

                const request:
                    ApprovalRequest = {
                        action:
                            'RUN_QA_TEST',
                        target:
                            'TEST-1',
                        environment:
                            'qa',
                        reason:
                            'Execute the selected QA test.',
                        risk:
                            'Normal QA test execution.',
                        reversible:
                            true,
                    };

                const decision =
                    gate.evaluate(
                        request
                    );

                expect(
                    decision.approvalRequired
                ).toBe(false);

                expect(
                    decision.status
                ).toBe('APPROVED');

                expect(
                    decision.action
                ).toBe('RUN_QA_TEST');

                expect(
                    decision.target
                ).toBe('TEST-1');
            }
        );

        test(
            'should require approval for Jira bug creation',
            () => {

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

                const decision =
                    gate.evaluate(
                        request
                    );

                expect(
                    decision.approvalRequired
                ).toBe(true);

                expect(
                    decision.status
                ).toBe('PENDING');

                expect(
                    decision.action
                ).toBe('CREATE_JIRA_BUG');
            }
        );

        test(
            'should require approval for production test execution',
            () => {

                const gate =
                    new HumanApprovalGate();

                const request:
                    ApprovalRequest = {
                        action:
                            'RUN_PROD_TEST',
                        target:
                            'TEST-1',
                        environment:
                            'prod',
                        reason:
                            'Execute QA automation against production.',
                        risk:
                            'Production test execution may affect live systems.',
                        reversible:
                            true,
                    };

                const decision =
                    gate.evaluate(
                        request
                    );

                expect(
                    decision.approvalRequired
                ).toBe(true);

                expect(
                    decision.status
                ).toBe('PENDING');

                expect(
                    decision.environment
                ).toBe('prod');
            }
        );

        test(
            'should block production data modification',
            () => {

                const gate =
                    new HumanApprovalGate();

                const request:
                    ApprovalRequest = {
                        action:
                            'MODIFY_PRODUCTION_DATA',
                        target:
                            'Production database',
                        environment:
                            'prod',
                        reason:
                            'Modify production test data.',
                        risk:
                            'Potential production data modification.',
                        reversible:
                            false,
                    };

                const decision =
                    gate.evaluate(
                        request
                    );

                expect(
                    decision.approvalRequired
                ).toBe(true);

                expect(
                    decision.status
                ).toBe('BLOCKED');

                expect(
                    decision.reason
                ).toContain(
                    'blocked'
                );
            }
        );

        test(
            'should approve a pending action after explicit approval',
            () => {

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
                            'Create a Jira bug.',
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

                const approvedDecision =
                    gate.approve(
                        pendingDecision
                    );

                expect(
                    approvedDecision.status
                ).toBe('APPROVED');

                expect(
                    gate.canExecute(
                        approvedDecision
                    )
                ).toBe(true);
            }
        );

        test(
            'should reject a pending action',
            () => {

                const gate =
                    new HumanApprovalGate();

                const request:
                    ApprovalRequest = {
                        action:
                            'SEND_EMAIL',
                        target:
                            'QA report recipients',
                        environment:
                            'qa',
                        reason:
                            'Send the QA execution report.',
                        risk:
                            'Sends an external email.',
                        reversible:
                            false,
                    };

                const pendingDecision =
                    gate.evaluate(
                        request
                    );

                expect(
                    pendingDecision.status
                ).toBe('PENDING');

                const rejectedDecision =
                    gate.reject(
                        pendingDecision
                    );

                expect(
                    rejectedDecision.status
                ).toBe('REJECTED');

                expect(
                    gate.canExecute(
                        rejectedDecision
                    )
                ).toBe(false);
            }
        );

        test(
            'should not allow a blocked action to be approved',
            () => {

                const gate =
                    new HumanApprovalGate();

                const request:
                    ApprovalRequest = {
                        action:
                            'MODIFY_PRODUCTION_DATA',
                        target:
                            'Production database',
                        environment:
                            'prod',
                        reason:
                            'Modify production data.',
                        risk:
                            'Destructive production operation.',
                        reversible:
                            false,
                    };

                const blockedDecision =
                    gate.evaluate(
                        request
                    );

                expect(
                    blockedDecision.status
                ).toBe('BLOCKED');

                expect(
                    () =>
                        gate.approve(
                            blockedDecision
                        )
                ).toThrow(
                    'Blocked actions cannot be approved.'
                );
            }
        );

        test(
            'should generate a human approval request message',
            () => {

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

                const message =
                    gate.getApprovalRequestMessage(
                        request
                    );

                expect(
                    message
                ).toContain(
                    'Human Approval Required'
                );

                expect(
                    message
                ).toContain(
                    'CREATE_JIRA_BUG'
                );

                expect(
                    message
                ).toContain(
                    'TEST-1 / TC-004'
                );

                expect(
                    message
                ).toContain(
                    'qa'
                );

                expect(
                    message
                ).toContain(
                    'APPROVED'
                );

                expect(
                    message
                ).toContain(
                    'REJECTED'
                );
            }
        );

        test(
            'should reject invalid approval request',
            () => {

                const gate =
                    new HumanApprovalGate();

                const invalidRequest =
                    {
                        action:
                            'CREATE_JIRA_BUG',
                        target:
                            '',
                        environment:
                            'qa',
                        reason:
                            'Create Jira bug.',
                        risk:
                            'External write.',
                        reversible:
                            true,
                    } as ApprovalRequest;

                expect(
                    () =>
                        gate.evaluate(
                            invalidRequest
                        )
                ).toThrow(
                    'Approval request is missing target.'
                );
            }
        );

        test(
            'should not execute a rejected action',
            () => {

                const gate =
                    new HumanApprovalGate();

                const request:
                    ApprovalRequest = {
                        action:
                            'CREATE_PULL_REQUEST',
                        target:
                            'TEST-1 automation',
                        environment:
                            'qa',
                        reason:
                            'Create a pull request.',
                        risk:
                            'Creates an external repository change.',
                        reversible:
                            true,
                    };

                const pendingDecision:
                    ApprovalDecision =
                        gate.evaluate(
                            request
                        );

                const rejectedDecision =
                    gate.reject(
                        pendingDecision
                    );

                expect(
                    rejectedDecision.status
                ).toBe('REJECTED');

                expect(
                    gate.canExecute(
                        rejectedDecision
                    )
                ).toBe(false);
            }
        );
    }
);

