
import readline from 'readline';

import {
    ApprovalDecision,
} from './HumanApprovalGate';

import {
    HumanApprovalResolver,
    HumanApprovalResponse,
} from './HumanApprovalResolver';

export type ApprovalResponseReader =
    () => Promise<HumanApprovalResponse>;

export class HumanApprovalPrompt {
    private readonly resolver:
        HumanApprovalResolver;

    private readonly responseReader:
        ApprovalResponseReader;

    constructor(
        resolver?: HumanApprovalResolver,
        responseReader?: ApprovalResponseReader
    ) {
        this.resolver =
            resolver ??
            new HumanApprovalResolver();

        this.responseReader =
            responseReader ??
            this.readResponse.bind(this);
    }

    async requestApproval(
        decision: ApprovalDecision
    ): Promise<ApprovalDecision> {

        if (
            decision.status !==
            'PENDING'
        ) {
            throw new Error(
                `Human approval can only be requested ` +
                `for PENDING actions. ` +
                `Current status: ${decision.status}`
            );
        }

        this.printApprovalRequest(
            decision
        );

        const response =
            await this.responseReader();

        return this.resolver.resolve(
            decision,
            response
        );
    }

    private printApprovalRequest(
        decision: ApprovalDecision
    ): void {

        console.log('');
        console.log(
            '========================================'
        );

        console.log(
            '       HUMAN APPROVAL REQUIRED'
        );

        console.log(
            '========================================'
        );

        console.log(
            `Action: ${decision.action}`
        );

        console.log(
            `Target: ${decision.target}`
        );

        console.log(
            `Environment: ${decision.environment}`
        );

        console.log(
            `Reason: ${decision.reason}`
        );

        console.log(
            `Risk: ${decision.risk}`
        );

        console.log(
            `Reversible: ${
                decision.reversible
                    ? 'Yes'
                    : 'No'
            }`
        );

        console.log(
            '========================================'
        );

        console.log(
            'Type APPROVED or REJECTED:'
        );
    }

    private readResponse():
        Promise<HumanApprovalResponse> {

        return new Promise(
            (
                resolve,
                reject
            ) => {

                const interfaceInstance =
                    readline.createInterface({
                        input:
                            process.stdin,

                        output:
                            process.stdout,
                    });

                interfaceInstance.question(
                    '> ',
                    answer => {

                        interfaceInstance.close();

                        const response =
                            answer
                                .trim()
                                .toUpperCase();

                        if (
                            response ===
                            'APPROVED'
                        ) {
                            resolve(
                                'APPROVED'
                            );

                            return;
                        }

                        if (
                            response ===
                            'REJECTED'
                        ) {
                            resolve(
                                'REJECTED'
                            );

                            return;
                        }

                        reject(
                            new Error(
                                `Invalid approval response: ${answer}. ` +
                                `Expected APPROVED or REJECTED.`
                            )
                        );
                    }
                );
            }
        );
    }
}

