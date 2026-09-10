# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: AutomationExecutor.spec.ts >> AutomationExecutor >> should execute a selected Playwright test case
- Location: tests/AutomationExecutor.spec.ts:6:9

# Error details

```
Error: expect(received).toBe(expected) // Object.is equality

Expected: "PASSED"
Received: "FAILED"
```

# Test source

```ts
  1  | import { test, expect } from '@playwright/test';
  2  | import { AutomationExecutor } from '../agent/AutomationExecutor';
  3  | 
  4  | test.describe('AutomationExecutor', () => {
  5  | 
  6  |     test('should execute a selected Playwright test case', async () => {
  7  | 
  8  |         const executor = new AutomationExecutor();
  9  | 
  10 |         const result = await executor.execute(
  11 |             'tests/TEST-1-login.spec.ts',
  12 |             'TC-003'
  13 |         );
  14 | 
  15 |         console.log(
  16 |             '[EXECUTION RESULT]',
  17 |             result
  18 |         );
  19 | 
> 20 |         expect(result.status).toBe('PASSED');
     |                               ^ Error: expect(received).toBe(expected) // Object.is equality
  21 |         expect(result.output).toContain('passed');
  22 |     });
  23 | 
  24 | });
```