# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: HumanApprovalGate.spec.ts >> Human Approval Gate >> should not allow a blocked action to be approved
- Location: tests/HumanApprovalGate.spec.ts:286:13

# Error details

```
Error: expect(received).toBe(expected) // Object.is equality

Expected: "BLOCKED"
Received: "PENDING"
```

# Test source

```ts
  216 |                 expect(
  217 |                     pendingDecision.status
  218 |                 ).toBe('PENDING');
  219 | 
  220 |                 const approvedDecision =
  221 |                     gate.approve(
  222 |                         pendingDecision
  223 |                     );
  224 | 
  225 |                 expect(
  226 |                     approvedDecision.status
  227 |                 ).toBe('APPROVED');
  228 | 
  229 |                 expect(
  230 |                     gate.canExecute(
  231 |                         approvedDecision
  232 |                     )
  233 |                 ).toBe(true);
  234 |             }
  235 |         );
  236 | 
  237 |         test(
  238 |             'should reject a pending action',
  239 |             () => {
  240 | 
  241 |                 const gate =
  242 |                     new HumanApprovalGate();
  243 | 
  244 |                 const request:
  245 |                     ApprovalRequest = {
  246 |                         action:
  247 |                             'SEND_EMAIL',
  248 |                         target:
  249 |                             'QA report recipients',
  250 |                         environment:
  251 |                             'qa',
  252 |                         reason:
  253 |                             'Send the QA execution report.',
  254 |                         risk:
  255 |                             'Sends an external email.',
  256 |                         reversible:
  257 |                             false,
  258 |                     };
  259 | 
  260 |                 const pendingDecision =
  261 |                     gate.evaluate(
  262 |                         request
  263 |                     );
  264 | 
  265 |                 expect(
  266 |                     pendingDecision.status
  267 |                 ).toBe('PENDING');
  268 | 
  269 |                 const rejectedDecision =
  270 |                     gate.reject(
  271 |                         pendingDecision
  272 |                     );
  273 | 
  274 |                 expect(
  275 |                     rejectedDecision.status
  276 |                 ).toBe('REJECTED');
  277 | 
  278 |                 expect(
  279 |                     gate.canExecute(
  280 |                         rejectedDecision
  281 |                     )
  282 |                 ).toBe(false);
  283 |             }
  284 |         );
  285 | 
  286 |         test(
  287 |             'should not allow a blocked action to be approved',
  288 |             () => {
  289 | 
  290 |                 const gate =
  291 |                     new HumanApprovalGate();
  292 | 
  293 |                 const request:
  294 |                     ApprovalRequest = {
  295 |                         action:
  296 |                             'MODIFY_PRODUCTION_DATA',
  297 |                         target:
  298 |                             'Production database',
  299 |                         environment:
  300 |                             'prod',
  301 |                         reason:
  302 |                             'Modify production data.',
  303 |                         risk:
  304 |                             'Destructive production operation.',
  305 |                         reversible:
  306 |                             false,
  307 |                     };
  308 | 
  309 |                 const blockedDecision =
  310 |                     gate.evaluate(
  311 |                         request
  312 |                     );
  313 | 
  314 |                 expect(
  315 |                     blockedDecision.status
> 316 |                 ).toBe('BLOCKED');
      |                   ^ Error: expect(received).toBe(expected) // Object.is equality
  317 | 
  318 |                 expect(
  319 |                     () =>
  320 |                         gate.approve(
  321 |                             blockedDecision
  322 |                         )
  323 |                 ).toThrow(
  324 |                     'Blocked actions cannot be approved.'
  325 |                 );
  326 |             }
  327 |         );
  328 | 
  329 |         test(
  330 |             'should generate a human approval request message',
  331 |             () => {
  332 | 
  333 |                 const gate =
  334 |                     new HumanApprovalGate();
  335 | 
  336 |                 const request:
  337 |                     ApprovalRequest = {
  338 |                         action:
  339 |                             'CREATE_JIRA_BUG',
  340 |                         target:
  341 |                             'TEST-1 / TC-004',
  342 |                         environment:
  343 |                             'qa',
  344 |                         reason:
  345 |                             'Create a Jira bug for the failed test.',
  346 |                         risk:
  347 |                             'Creates an external Jira issue.',
  348 |                         reversible:
  349 |                             true,
  350 |                     };
  351 | 
  352 |                 const message =
  353 |                     gate.getApprovalRequestMessage(
  354 |                         request
  355 |                     );
  356 | 
  357 |                 expect(
  358 |                     message
  359 |                 ).toContain(
  360 |                     'Human Approval Required'
  361 |                 );
  362 | 
  363 |                 expect(
  364 |                     message
  365 |                 ).toContain(
  366 |                     'CREATE_JIRA_BUG'
  367 |                 );
  368 | 
  369 |                 expect(
  370 |                     message
  371 |                 ).toContain(
  372 |                     'TEST-1 / TC-004'
  373 |                 );
  374 | 
  375 |                 expect(
  376 |                     message
  377 |                 ).toContain(
  378 |                     'qa'
  379 |                 );
  380 | 
  381 |                 expect(
  382 |                     message
  383 |                 ).toContain(
  384 |                     'APPROVED'
  385 |                 );
  386 | 
  387 |                 expect(
  388 |                     message
  389 |                 ).toContain(
  390 |                     'REJECTED'
  391 |                 );
  392 |             }
  393 |         );
  394 | 
  395 |         test(
  396 |             'should reject invalid approval request',
  397 |             () => {
  398 | 
  399 |                 const gate =
  400 |                     new HumanApprovalGate();
  401 | 
  402 |                 const invalidRequest =
  403 |                     {
  404 |                         action:
  405 |                             'CREATE_JIRA_BUG',
  406 |                         target:
  407 |                             '',
  408 |                         environment:
  409 |                             'qa',
  410 |                         reason:
  411 |                             'Create Jira bug.',
  412 |                         risk:
  413 |                             'External write.',
  414 |                         reversible:
  415 |                             true,
  416 |                     } as ApprovalRequest;
```