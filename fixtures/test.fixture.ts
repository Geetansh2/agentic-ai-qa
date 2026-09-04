import {test as base} from '@playwright/test';

import { TestDataProvider } from '../data/TestDataProvider';
import { LoginFlow } from '../flows/LoginFlow';

type Fixtures = {
    testData: TestDataProvider;
    loginFlow: LoginFlow;
};

export const test = base.extend<Fixtures>({
    testData: async({}, use)=>{
        const testData = new TestDataProvider();
        await use(testData);
    },

    loginFlow: async ({ page }, use) => {
    const loginFlow = new LoginFlow(page);

    await use(loginFlow);
},
});

export {expect} from '@playwright/test';