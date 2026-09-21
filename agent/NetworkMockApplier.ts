
import {
    Page,
    Route,
} from '@playwright/test';

import {
    NetworkMockingDecision,
} from './NetworkMockingAgent';

export class NetworkMockApplier {

    async apply(
        page: Page,
        decision: NetworkMockingDecision
    ): Promise<void> {

        if (decision.decision === 'NO_MOCK') {
            console.log(
                '[NETWORK MOCK] No network mocking required'
            );

            return;
        }

        if (!decision.endpoint) {
            throw new Error(
                `Network mock decision ${decision.decision} ` +
                `does not contain an endpoint`
            );
        }

        const endpoint =
            decision.endpoint;

        console.log(
            `[NETWORK MOCK] Applying ${decision.decision} ` +
            `for ${endpoint}`
        );

        await page.route(
            `**${endpoint}`,
            async (route: Route) => {

                switch (decision.decision) {

                    case 'MOCK_RESPONSE':
                    case 'MOCK_FAILURE':

                        await route.fulfill({
                            status:
                                decision.responseStatus ?? 500,

                            contentType:
                                'application/json',

                            body:
                                JSON.stringify(
                                    decision.responseBody ?? {}
                                ),
                        });

                        break;

                    case 'MOCK_DELAY':

                        await new Promise(
                            resolve =>
                                setTimeout(
                                    resolve,
                                    decision.delayMs ?? 1000
                                )
                        );

                        await route.continue();

                        break;

                    case 'MOCK_NETWORK_ERROR':

                        await route.abort(
                            'failed'
                        );

                        break;

                    default:

                        await route.continue();
                }
            }
        );
    }
}
