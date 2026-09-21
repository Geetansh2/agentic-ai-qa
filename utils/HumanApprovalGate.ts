
export type ApprovalStatus =
    | 'PENDING'
    | 'APPROVED'
    | 'REJECTED'
    | 'BLOCKED';

export type ApprovalAction =
    | 'RUN_QA_TEST'
    | 'RUN_UAT_TEST'
    | 'RUN_PROD_TEST'
    | 'CREATE_JIRA_BUG'
    | 'UPDATE_JIRA'
    | 'SEND_EMAIL'
    | 'COMMIT_CODE'
    | 'PUSH_CODE'
    | 'CREATE_PULL_REQUEST'
    | 'MERGE_PULL_REQUEST'
    | 'DEPLOY_PRODUCTION'
    | 'MODIFY_PRODUCTION_DATA'
    | 'GENERATE_REPORT'
    | 'ANALYZE_FAILURE';

export type ApprovalRequest = {
    action: ApprovalAction;
    target: string;
    environment: string;
    reason: string;
    risk: string;
    reversible: boolean;
};

export type ApprovalDecision = {
    action: ApprovalAction;
    target: string;
    environment: string;
    approvalRequired: boolean;
    status: ApprovalStatus;
    reason: string;
    risk: string;
    reversible: boolean;
    timestamp: string;
};

export class HumanApprovalGate {

    private readonly approvalRequiredActions:
        ApprovalAction[] = [
            'RUN_PROD_TEST',
            'CREATE_JIRA_BUG',
            'UPDATE_JIRA',
            'SEND_EMAIL',
            'COMMIT_CODE',
            'PUSH_CODE',
            'CREATE_PULL_REQUEST',
            'MERGE_PULL_REQUEST',
            'DEPLOY_PRODUCTION',
            'MODIFY_PRODUCTION_DATA',
        ];

    evaluate(
        request: ApprovalRequest
    ): ApprovalDecision {

        this.validateRequest(request);

        const timestamp =
            new Date().toISOString();

        /*
         * BLOCKED actions always take priority
         * over approval-required actions.
         */
        if (
            request.action ===
            'MODIFY_PRODUCTION_DATA'
        ) {
            return {
                ...request,
                approvalRequired: true,
                status: 'BLOCKED',
                reason:
                    'Production data modification is blocked by the QA workflow.',
                timestamp,
            };
        }

        /*
         * Production actions require explicit
         * human approval.
         */
        if (
            request.environment
                .toLowerCase()
                .trim() === 'prod'
        ) {
            return {
                ...request,
                approvalRequired: true,
                status: 'PENDING',
                reason:
                    'Production actions require explicit human approval.',
                timestamp,
            };
        }

        /*
         * Other explicitly approval-required actions
         * require human approval regardless of environment.
         */
        if (
            this.approvalRequiredActions.includes(
                request.action
            )
        ) {
            return {
                ...request,
                approvalRequired: true,
                status: 'PENDING',
                timestamp,
            };
        }

        /*
         * Safe autonomous actions can proceed.
         */
        return {
            ...request,
            approvalRequired: false,
            status: 'APPROVED',
            timestamp,
        };
    }

    approve(
        decision: ApprovalDecision
    ): ApprovalDecision {

        this.validateDecision(decision);

        if (!decision.approvalRequired) {
            return {
                ...decision,
                status: 'APPROVED',
            };
        }

        if (decision.status === 'BLOCKED') {
            throw new Error(
                'Blocked actions cannot be approved.'
            );
        }

        if (decision.status !== 'PENDING') {
            throw new Error(
                `Cannot approve action from status: ` +
                `${decision.status}`
            );
        }

        return {
            ...decision,
            status: 'APPROVED',
            timestamp:
                new Date().toISOString(),
        };
    }

    reject(
        decision: ApprovalDecision
    ): ApprovalDecision {

        this.validateDecision(decision);

        if (decision.status === 'BLOCKED') {
            throw new Error(
                'Blocked actions cannot be rejected into an executable state.'
            );
        }

        if (decision.status !== 'PENDING') {
            throw new Error(
                `Cannot reject action from status: ` +
                `${decision.status}`
            );
        }

        return {
            ...decision,
            status: 'REJECTED',
            timestamp:
                new Date().toISOString(),
        };
    }

    canExecute(
        decision: ApprovalDecision
    ): boolean {

        this.validateDecision(decision);

        return (
            decision.status ===
            'APPROVED'
        );
    }

    getApprovalRequestMessage(
        request: ApprovalRequest
    ): string {

        this.validateRequest(request);

        return [
            'Human Approval Required',
            '',
            `Action: ${request.action}`,
            `Target: ${request.target}`,
            `Environment: ${request.environment}`,
            `Reason: ${request.reason}`,
            `Risk: ${request.risk}`,
            `Reversible: ${
                request.reversible
                    ? 'Yes'
                    : 'No'
            }`,
            '',
            'Approve this action explicitly with APPROVED or REJECTED.',
        ].join('\n');
    }

    private validateRequest(
        request: ApprovalRequest
    ): void {

        if (!request) {
            throw new Error(
                'Approval request is required.'
            );
        }

        if (!request.action) {
            throw new Error(
                'Approval request is missing action.'
            );
        }

        if (
            !request.target ||
            !request.target.trim()
        ) {
            throw new Error(
                'Approval request is missing target.'
            );
        }

        if (
            !request.environment ||
            !request.environment.trim()
        ) {
            throw new Error(
                'Approval request is missing environment.'
            );
        }

        if (
            !request.reason ||
            !request.reason.trim()
        ) {
            throw new Error(
                'Approval request is missing reason.'
            );
        }

        if (
            !request.risk ||
            !request.risk.trim()
        ) {
            throw new Error(
                'Approval request is missing risk.'
            );
        }

        if (
            typeof request.reversible !==
            'boolean'
        ) {
            throw new Error(
                'Approval request reversible must be boolean.'
            );
        }
    }

    private validateDecision(
        decision: ApprovalDecision
    ): void {

        if (!decision) {
            throw new Error(
                'Approval decision is required.'
            );
        }

        if (!decision.action) {
            throw new Error(
                'Approval decision is missing action.'
            );
        }

        if (
            !decision.target ||
            !decision.target.trim()
        ) {
            throw new Error(
                'Approval decision is missing target.'
            );
        }

        if (
            !decision.environment ||
            !decision.environment.trim()
        ) {
            throw new Error(
                'Approval decision is missing environment.'
            );
        }

        if (
            !decision.reason ||
            !decision.reason.trim()
        ) {
            throw new Error(
                'Approval decision is missing reason.'
            );
        }

        if (
            !decision.risk ||
            !decision.risk.trim()
        ) {
            throw new Error(
                'Approval decision is missing risk.'
            );
        }

        const validStatuses:
            ApprovalStatus[] = [
                'PENDING',
                'APPROVED',
                'REJECTED',
                'BLOCKED',
            ];

        if (
            !validStatuses.includes(
                decision.status
            )
        ) {
            throw new Error(
                `Invalid approval status: ${decision.status}`
            );
        }

        if (
            typeof decision.approvalRequired !==
            'boolean'
        ) {
            throw new Error(
                'Approval decision approvalRequired must be boolean.'
            );
        }

        if (
            typeof decision.reversible !==
            'boolean'
        ) {
            throw new Error(
                'Approval decision reversible must be boolean.'
            );
        }

        if (!decision.timestamp) {
            throw new Error(
                'Approval decision timestamp is required.'
            );
        }
    }
}
