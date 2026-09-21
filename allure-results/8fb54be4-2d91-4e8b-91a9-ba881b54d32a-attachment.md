# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: NetworkMockConfigTest.spec.ts >> NetworkMockApplier >> should return mocked response for MOCK_FAILURE
- Location: tests/NetworkMockConfigTest.spec.ts:13:9

# Error details

```
Error: page.evaluate: TypeError: Failed to execute 'fetch' on 'Window': Failed to parse URL from /ed-tech/api/auth/send-otp
    at eval (eval at evaluate (:311:30), <anonymous>:2:30)
    at UtilityScript.evaluate (<anonymous>:313:16)
    at UtilityScript.<anonymous> (<anonymous>:1:44)
```