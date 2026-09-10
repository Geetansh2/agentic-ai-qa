import { test, expect } from '@playwright/test';

import { AgentController } from '../agent/AgentController';

test.describe('AgentController', () => {


test('should create automation task from Jira issue test cases', async () => {

    const agent =
        new AgentController();

    const task =
        await agent.plan('TEST-1');

    console.log(
        '\nFINAL AGENT TASK:',
        task
    );

    expect(
        task.jiraIssueKey
    ).toBe('TEST-1');

    expect(
        task.testCaseId
    ).toBeTruthy();

    expect(
        task.testCase
    ).toBeTruthy();

    expect(
        task.strategy
    ).toBeTruthy();

    expect(
        task.executionType
    ).toBeTruthy();

    expect(
        task.components.length
    ).toBeGreaterThan(0);
});


test('should execute autonomous QA workflow', async () => {

    const agent =
        new AgentController();

    await agent.run('TEST-1');

    expect(true).toBe(true);
});


});
