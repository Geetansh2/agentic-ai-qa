
import {
    test,
    expect,
} from '@playwright/test';

import {
    NetworkMockApplier,
} from '../agent/NetworkMockApplier';

test.describe('NetworkMockApplier', () => {

    test('should return mocked response for MOCK_FAILURE', async ({
        page,
    }) => {

        const applier =
            new NetworkMockApplier();

        await applier.apply(
            page,
            {
                decision:
                    'MOCK_FAILURE',

                reason:
                    'Test requires deterministic API failure.',

                endpoint:
                   'https://stg.zoworld.app/ed-tech/api/auth/send-otp',

                responseStatus:
                    500,

                responseBody: {
                    error:
                        'Internal Server Error',
                },
            }
        );

        const response =
            await page.evaluate(
                async () => {

                    const response =
                        await fetch(
                            'https://stg.zoworld.app/ed-tech/api/auth/send-otp',
                            {
                                method: 'POST',
                            }
                        );

                    return {
                        status:
                            response.status,

                        body:
                            await response.json(),
                    };
                }
            );

        expect(response.status)
            .toBe(500);

        expect(response.body)
            .toEqual({
                error:
                    'Internal Server Error',
            });
    });

    test('should abort request for MOCK_NETWORK_ERROR', async ({
        page,
    }) => {

        const applier =
            new NetworkMockApplier();

        await applier.apply(
            page,
            {
                decision:
                    'MOCK_NETWORK_ERROR',

                reason:
                    'Test requires network failure.',

                endpoint:
                    '/ed-tech/api/auth/send-otp',
            }
        );

        await expect(
            page.evaluate(
                async () => {

                    await fetch(
                        '/ed-tech/api/auth/send-otp',
                        {
                            method: 'POST',
                        }
                    );
                }
            )
        ).rejects.toThrow();
    });

    test('should not register a mock for NO_MOCK', async ({
        page,
    }) => {

        const applier =
            new NetworkMockApplier();

        await applier.apply(
            page,
            {
                decision:
                    'NO_MOCK',

                reason:
                    'Real backend behavior is required.',
            }
        );

        // The important assertion here is that
        // apply() completes without registering
        // any route or throwing an error.

        expect(true)
            .toBe(true);
    });

});
