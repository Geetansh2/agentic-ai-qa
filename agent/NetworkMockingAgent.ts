import fs from 'fs';
import path from 'path';

import { LLMClient } from '../utils/LLMClient';

export type NetworkMockDecision =
| 'NO_MOCK'
| 'MOCK_RESPONSE'
| 'MOCK_FAILURE'
| 'MOCK_DELAY'
| 'MOCK_NETWORK_ERROR';

export type NetworkMockingDecision = {
decision: NetworkMockDecision;
reason: string;
endpoint?: string;
responseStatus?: number;
responseBody?: unknown;
delayMs?: number;
};

export class NetworkMockingAgent {


private readonly llm: LLMClient;

constructor() {
    this.llm = new LLMClient();
}

async decide(
    testCase: Record<string, unknown>
): Promise<NetworkMockingDecision> {

    const skill =
        this.loadNetworkMockingSkill();

    const prompt = ` Use the following Network Mocking & Interception Skill as the authoritative instruction. ===== NETWORK MOCKING SKILL ===== ${skill} ===== END SKILL ===== Analyze the following test case according to the Skill. Return only the JSON decision object defined by the Skill. Test case: ${JSON.stringify( testCase, null, 2 )} `;
    const response =
        await this.llm.ask(prompt);

    return this.parseDecision(
        response
    );
}

private loadNetworkMockingSkill(): string {

    const skillPath =
        path.resolve(
            process.cwd(),
            '.claude',
            'skills',
            'network-mocking',
            'SKILL.md'
        );

    if (!fs.existsSync(skillPath)) {
        throw new Error(
            `Network Mocking Skill not found: ${skillPath}`
        );
    }

    return fs.readFileSync(
        skillPath,
        'utf-8'
    );
}

private parseDecision(
    response: string
): NetworkMockingDecision {

    let decision:
        NetworkMockingDecision;

    try {
        decision =
            JSON.parse(response);
    } catch {
        throw new Error(
            `LLM returned invalid network mocking JSON: ${response}`
        );
    }

    const validDecisions:
        NetworkMockDecision[] = [
            'NO_MOCK',
            'MOCK_RESPONSE',
            'MOCK_FAILURE',
            'MOCK_DELAY',
            'MOCK_NETWORK_ERROR',
        ];

    if (
        !validDecisions.includes(
            decision.decision
        )
    ) {
        throw new Error(
            `Invalid network mocking decision: ` +
            `${decision.decision}`
        );
    }

    if (!decision.reason) {
        throw new Error(
            'LLM did not provide a network mocking reason'
        );
    }

    return decision;
}

}
