# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: TestAutomationRegistry.spec.ts >> TestAutomationRegistry >> should identify a test case that is not automated
- Location: tests/TestAutomationRegistry.spec.ts:31:9

# Error details

```
Error: expect(received).toBeFalsy()

Received: true
```

# Test source

```ts
  1  | import { test, expect } from '@playwright/test';
  2  | import { TestAutomationRegistry } from '../utils/TestAutomationRegistry';
  3  | 
  4  | test.describe('TestAutomationRegistry', () => {
  5  | 
  6  |     const registry = new TestAutomationRegistry();
  7  | 
  8  |     test('should detect automated test cases', () => {
  9  | 
  10 |         expect(
  11 |             registry.isAutomated('TC-001')
  12 |         ).toBeTruthy();
  13 | 
  14 |         expect(
  15 |             registry.isAutomated('TC-002')
  16 |         ).toBeTruthy();
  17 | 
  18 |         expect(
  19 |             registry.isAutomated('TC-004')
  20 |         ).toBeTruthy();
  21 | 
  22 |         expect(
  23 |             registry.isAutomated('TC-005')
  24 |         ).toBeTruthy();
  25 | 
  26 |         expect(
  27 |             registry.isAutomated('TC-006')
  28 |         ).toBeTruthy();
  29 |     });
  30 | 
  31 |     test('should identify a test case that is not automated', () => {
  32 | 
  33 |         expect(
  34 |             registry.isAutomated('TC-999')
> 35 |         ).toBeFalsy();
     |           ^ Error: expect(received).toBeFalsy()
  36 |     });
  37 | });
```