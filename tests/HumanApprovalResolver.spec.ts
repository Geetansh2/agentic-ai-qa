
import { test, expect } from '@playwright/test';

import {
    HumanApprovalGate,
    ApprovalRequest,
} from '../utils/HumanApprovalGate';

import {
    HumanApprovalResolver,
} from '../utils/HumanApprovalResolver';

test.describe(
    'Human Approval Resolver',
    () => {

        test(
            'should resolve a pending action as approved',
            () => {

                const gate =
                    new HumanApprovalGate();

                const resolver =
                    new HumanApprovalResolver(
                        gate
                    );

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

                const resolvedDecision =
                    resolver.resolve(
                        pendingDecision,
                        'APPROVED'
                    );

                expect(
                    resolvedDecision.status
                ).toBe('APPROVED');

                expect(
                    gate.canExecute(
                        resolvedDecision
                    )
                ).toBe(true);
            }
        );

        test(
            'should resolve a pending action as rejected',
            () => {

                const gate =
                    new HumanApprovalGate();

                const resolver =
                    new HumanApprovalResolver(
                        gate
                    );

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

                const resolvedDecision =
                    resolver.resolve(
                        pendingDecision,
                        'REJECTED'
                    );

                expect(
                    resolvedDecision.status
                ).toBe('REJECTED');

                expect(
                    gate.canExecute(
                        resolvedDecision
                    )
                ).toBe(false);
            }
        );

        test(
            'should not resolve an already approved action',
            () => {

                const gate =
                    new HumanApprovalGate();

                const resolver =
                    new HumanApprovalResolver(
                        gate
                    );

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
                            'External Jira write.',
                        reversible:
                            true,
                    };

                const approvedDecision =
                    gate.evaluate({
                        ...request,
                        action:
                            'RUN_QA_TEST',
                    });

                expect(
                    approvedDecision.status
                ).toBe('APPROVED');

                expect(
                    () =>
                        resolver.resolve(
                            approvedDecision,
                            'APPROVED'
                        )
                ).toThrow(
                    'Approval response can only be provided for PENDING actions.'
                );
            }
        );

        test(
            'should not resolve a blocked action',
            () => {

                const gate =
                    new HumanApprovalGate();

                const resolver =
                    new HumanApprovalResolver(
                        gate
                    );

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
                            'Production data modification.',
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
                        resolver.resolve(
                            blockedDecision,
                            'APPROVED'
                        )
                ).toThrow(
                    'Approval response can only be provided for PENDING actions.'
                );
            }
        );
    }
);
