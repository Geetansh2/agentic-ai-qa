
import {
    ApprovalDecision,
    HumanApprovalGate,
} from './HumanApprovalGate';

export type HumanApprovalResponse =
    | 'APPROVED'
    | 'REJECTED';

export class HumanApprovalResolver {

    private readonly gate:
        HumanApprovalGate;

    constructor(
        gate?: HumanApprovalGate
    ) {
        this.gate =
            gate ??
            new HumanApprovalGate();
    }

    resolve(
        decision: ApprovalDecision,
        response: HumanApprovalResponse
    ): ApprovalDecision {

        if (
            decision.status !==
            'PENDING'
        ) {
            throw new Error(
                `Approval response can only be ` +
                `provided for PENDING actions. ` +
                `Current status: ${decision.status}`
            );
        }

        if (
            response ===
            'APPROVED'
        ) {
            return this.gate.approve(
                decision
            );
        }

        if (
            response ===
            'REJECTED'
        ) {
            return this.gate.reject(
                decision
            );
        }

        throw new Error(
            `Invalid human approval response: ${response}`
        );
    }
}

