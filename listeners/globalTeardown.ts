import { FullConfig } from "@playwright/test";

async function globalTearDown(config: FullConfig){
    console.log('[GLOBAL] TEST RUN FINISHED');
}

export default globalTearDown;