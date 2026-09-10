import {test as base} from '@playwright/test';

import { TestDataProvider } from '../data/TestDataProvider';
import { LoginFlow } from '../flows/LoginFlow';
import { LoginApi } from '../api/LoginApi';

type Fixtures = {
    testData: TestDataProvider;
    loginFlow: LoginFlow;
    lifecycle: void;
    loginApi: LoginApi;
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
    loginApi: async({request}, use)=>{
        const loginApi = new LoginApi(request);
        await use(loginApi);
    },

lifecycle:[
    async({}, use, testInfo) =>{
        const startTime = Date.now();

        console.log(
            `[Worker ${testInfo.workerIndex}]`+
            `[${testInfo.project.name}]`+  
             `STARTED: ${testInfo.title}`
            
        );
        await use();

        const duration = Date.now() - startTime;
         console.log(
                `[Worker ${testInfo.workerIndex}] ` +
                `[${testInfo.project.name}] ` +
                `FINISHED: ${testInfo.title} (${duration}ms)`
            );
        },

    { auto: true },
]

});

export {expect} from '@playwright/test';