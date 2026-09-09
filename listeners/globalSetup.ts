import { FullConfig } from "@playwright/test";

async function globalSetup(config: FullConfig){
    console.log('[GLOBAL] TEST RUN STARTED');
}

export default globalSetup;