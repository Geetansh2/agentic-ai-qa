import { Page } from "@playwright/test";    

export abstract class BaseComponent{
    protected readonly page: Page;

    constructor(page: Page){
        this.page = page;
    }
}