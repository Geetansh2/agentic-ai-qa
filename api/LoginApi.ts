import type { APIRequestContext } from "@playwright/test";

import { ApiClient } from "./ApiClient";

export class LoginApi extends ApiClient{
    constructor(request: APIRequestContext){
        super(request);
    }

    async sendOtp(mobile: string){
        return this.post('/ed-tech/api/auth/send-otp', {
            mobile
        });
    }
}