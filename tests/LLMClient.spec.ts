import { test, expect } from '@playwright/test';
import { LLMClient } from '../utils/LLMClient';

test('LLMClient - OpenAI connectivity', async () => {
    const llm = new LLMClient();

    const response = await llm.ask(
        'Reply with exactly: OPENAI_CONNECTION_OK'
    );

    console.log('LLM Response:', response);

    expect(response).toContain('OPENAI_CONNECTION_OK');
});