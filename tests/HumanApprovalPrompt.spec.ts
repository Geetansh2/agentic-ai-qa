
import { test, expect } from '@playwright/test';

import {
    HumanApprovalGate,
    ApprovalRequest,
} from '../utils/HumanApprovalGate';

import {
    HumanApprovalPrompt,
} from '../utils/HumanApprovalPrompt';

test.describe(
    'Human Approval Prompt',
    () => {

        test(
            'should approve a pending action when human enters APPROVED',
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
                    new HumanApprovalPrompt(
                        undefined,
                        async () =>
                            'APPROVED'
                    );

                const finalDecision =
                    await prompt.requestApproval(
                        pendingDecision
                    );

                expect(
                    finalDecision.status
                ).toBe('APPROVED');

                expect(
                    finalDecision.action
                ).toBe(
                    'CREATE_JIRA_BUG'
                );

                expect(
                    finalDecision.target
                ).toBe(
                    'TEST-1 / TC-004'
                );

                expect(
                    gate.canExecute(
                        finalDecision
                    )
                ).toBe(true);
            }
        );

        test(
            'should reject a pending action when human enters REJECTED',
            async () => {

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

                const prompt =
                    new HumanApprovalPrompt(
                        undefined,
                        async () =>
                            'REJECTED'
                    );

                const finalDecision =
                    await prompt.requestApproval(
                        pendingDecision
                    );

                expect(
                    finalDecision.status
                ).toBe('REJECTED');

                expect(
                    gate.canExecute(
                        finalDecision
                    )
                ).toBe(false);
            }
        );

        test(
            'should reject approval request for non-pending action',
            async () => {

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
                            'Execute the QA test.',
                        risk:
                            'Normal QA execution.',
                        reversible:
                            true,
                    };

                const approvedDecision =
                    gate.evaluate(
                        request
                    );

                expect(
                    approvedDecision.status
                ).toBe('APPROVED');

                const prompt =
                    new HumanApprovalPrompt(
                        undefined,
                        async () =>
                            'APPROVED'
                    );

                await expect(
                    prompt.requestApproval(
                        approvedDecision
                    )
                ).rejects.toThrow(
                    'Human approval can only be requested for PENDING actions.'
                );
            }
        );

        test(
            'should not allow production data modification approval',
            async () => {

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
                            'Potential production data modification.',
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

                const prompt =
                    new HumanApprovalPrompt(
                        undefined,
                        async () =>
                            'APPROVED'
                    );

                await expect(
                    prompt.requestApproval(
                        blockedDecision
                    )
                ).rejects.toThrow(
                    'Human approval can only be requested for PENDING actions.'
                );
            }
        );

        test(
            'should pass the exact human response to the resolver',
            async () => {

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

                const pendingDecision =
                    gate.evaluate(
                        request
                    );

                let responseRequested =
                    false;

                const prompt =
                    new HumanApprovalPrompt(
                        undefined,
                        async () => {

                            responseRequested =
                                true;

                            return 'REJECTED';
                        }
                    );

                const finalDecision =
                    await prompt.requestApproval(
                        pendingDecision
                    );

                expect(
                    responseRequested
                ).toBe(true);

                expect(
                    finalDecision.status
                ).toBe('REJECTED');
            }
        );

        test(
            'should preserve approval request details after approval',
            async () => {

                const gate =
                    new HumanApprovalGate();

                const request:
                    ApprovalRequest = {
                        action:
                            'UPDATE_JIRA',
                        target:
                            'TEST-1',
                        environment:
                            'qa',
                        reason:
                            'Update the Jira issue.',
                        risk:
                            'External Jira modification.',
                        reversible:
                            true,
                    };

                const pendingDecision =
                    gate.evaluate(
                        request
                    );

                const prompt =
                    new HumanApprovalPrompt(
                        undefined,
                        async () =>
                            'APPROVED'
                    );

                const finalDecision =
                    await prompt.requestApproval(
                        pendingDecision
                    );

                expect(
                    finalDecision.status
                ).toBe('APPROVED');

                expect(
                    finalDecision.action
                ).toBe(
                    request.action
                );

                expect(
                    finalDecision.target
                ).toBe(
                    request.target
                );

                expect(
                    finalDecision.environment
                ).toBe(
                    request.environment
                );

                expect(
                    finalDecision.reversible
                ).toBe(
                    request.reversible
                );
            }
        );
    }
);
