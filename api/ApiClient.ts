import type { APIRequestContext } from "@playwright/test";

export class ApiClient{
    constructor (protected readonly request: APIRequestContext){}

    async get(endpoint: string){
        return this.request.get(endpoint);
    }

    async post(endpoint: string, data?: unknown){
        return this.request.post(endpoint, {
            data
        });
    }

    async put(endpoint: string, data?:unknown){
        return this.request.put(endpoint, {
            data
        });
    }

    async delete(endpoint: string){
        return this.request.delete(endpoint);
    }
}