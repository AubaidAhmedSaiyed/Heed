import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { Heed } from '@heed-ai/runtime';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// DO NOT ECHO process.env.GITHUB_TOKEN ANYWHERE.
const heed = new Heed({
  runtimeUrl: "http://localhost:4000",
  agentId: "agent-e2e-test",
  apiKey: "dev-key"
});

describe('Exhaustive Real-World Integration SDK Tests', () => {
  let executionId: string;
  let testIssueNumber: number;

  beforeAll(async () => {
    executionId = await heed.createExecution("Real ALLOW and IDEMPOTENCY testing", {
      objective: "Real-world testing",
      allowedSystems: ["github"],
      allowedCapabilities: ["issue.write", "repository.delete"],
      restrictedResources: []
    });
    heed.setExecutionId(executionId);
  });

  // 1. REAL ALLOW
  it('1. REAL ALLOW: Creates a unique issue on GitHub successfully', async () => {
    const idempotencyKey = `e2e-issue-${Date.now()}`;
    const result = await heed.execute({
      system: "github",
      operation: "create_issue",
      resource: "AubaidAhmedSaiyed/Pivot",
      capability: "issue.write",
      idempotencyKey,
      arguments: {
        owner: "AubaidAhmedSaiyed",
        repo: "Pivot",
        title: `E2E Real ALLOW Proof ${idempotencyKey}`,
        body: "This issue proves that the ALLOW pipeline works end-to-end."
      }
    });

    expect(result).toBeDefined();
    expect(result.number).toBeDefined();
    testIssueNumber = result.number;

    // Direct fetch to verify it actually exists on GitHub natively
    const checkRes = await fetch(`https://api.github.com/repos/AubaidAhmedSaiyed/Pivot/issues/${testIssueNumber}`);
    expect(checkRes.status).toBe(200);
    const checkData = await checkRes.json();
    expect(checkData.title).toBe(`E2E Real ALLOW Proof ${idempotencyKey}`);
  }, 15000);

  // 5. IDEMPOTENCY
  it('5. IDEMPOTENCY: Does not create a duplicate issue for the same request', async () => {
    const idemKey = `idem-test-${Date.now()}`;
    
    const req1 = await heed.execute({
      system: "github",
      operation: "create_issue",
      resource: "AubaidAhmedSaiyed/Pivot",
      capability: "issue.write",
      idempotencyKey: idemKey,
      arguments: { owner: "AubaidAhmedSaiyed", repo: "Pivot", title: `Idempotency Test ${idemKey}` }
    });
    expect(req1.number).toBeDefined();

    const req2 = await heed.execute({
      system: "github",
      operation: "create_issue",
      resource: "AubaidAhmedSaiyed/Pivot",
      capability: "issue.write",
      idempotencyKey: idemKey,
      arguments: { owner: "AubaidAhmedSaiyed", repo: "Pivot", title: `Idempotency Test ${idemKey}` }
    });
    expect(req2).toBeUndefined();

  }, 20000);

  // 2. REAL BLOCK
  it('2. REAL BLOCK: Throws error and does not mutate GitHub', async () => {
    const blockExecId = await heed.createExecution("Real BLOCK testing", {
      allowedSystems: ["github"],
      allowedCapabilities: ["issue.write"], 
    });
    
    const blockHeed = new Heed({ runtimeUrl: "http://localhost:4000", agentId: "agent-e2e-test", apiKey: "dev-key" });
    blockHeed.setExecutionId(blockExecId);
    
    try {
      await blockHeed.execute({
        system: "github",
        operation: "delete_repository",
        resource: "AubaidAhmedSaiyed/Pivot",
        capability: "repository.delete", 
        arguments: { owner: "AubaidAhmedSaiyed", repo: "Pivot" }
      });
      expect.fail("Should have thrown BLOCK exception");
    } catch (e: any) {
      expect(e.decision).toBe("BLOCK");
      expect(e.message).toContain("Action blocked");
    }

    const checkRes = await fetch(`https://api.github.com/repos/AubaidAhmedSaiyed/Pivot`);
    expect(checkRes.status).toBe(200); 
  });

  // 3. REAL ASK + APPROVE
  it('3. REAL ASK + APPROVE: Creates intervention, awaits approval, executes on ALLOW', async () => {
    const policyReq = await fetch('http://localhost:4000/api/policies', {
      method: "POST",
      headers: { "Content-Type": "application/json", "Authorization": "Bearer dev-key" },
      body: JSON.stringify({
        name: `Approve Close Issue ${Date.now()}`,
        description: "Test ASK Approve",
        boundApprovalCapabilities: ["issue.close"]
      })
    });
    expect(policyReq.ok).toBe(true);

    const askExecId = await heed.createExecution("Test ASK APPROVE", {
      allowedSystems: ["github"],
      allowedCapabilities: ["issue.close", "issue.write"],
    });
    const askHeed = new Heed({ runtimeUrl: "http://localhost:4000", agentId: "agent-e2e-test", apiKey: "dev-key" });
    askHeed.setExecutionId(askExecId);

    const idemKey = `ask-approve-${Date.now()}`;
    let executionPromise = askHeed.execute({
      system: "github",
      operation: "create_issue",
      resource: "AubaidAhmedSaiyed/Pivot",
      capability: "issue.close", 
      arguments: { owner: "AubaidAhmedSaiyed", repo: "Pivot", title: `Should only exist if approved ${idemKey}` }
    });

    await new Promise(r => setTimeout(r, 1000));

    const invReq = await fetch('http://localhost:4000/interventions');
    const interventions = await invReq.json();
    const pending = interventions.find((i: any) => i.executionId === askExecId && i.status === "PENDING");
    expect(pending).toBeDefined();

    const resolveReq = await fetch(`http://localhost:4000/interventions/${pending.id}/resolve`, {
      method: "POST",
      headers: { "Content-Type": "application/json", "Authorization": "Bearer dev-key" },
      body: JSON.stringify({ decision: "ALLOW", reason: "Approved by test" })
    });
    expect(resolveReq.ok).toBe(true);

    const resumedResult = (await executionPromise) as any;
    expect(resumedResult.number).toBeDefined(); 
  }, 15000);
  
  // 4. REAL ASK + DENY
  it('4. REAL ASK + DENY: Creates intervention, resolves to BLOCK, zero side effects', async () => {
    const policyReq = await fetch('http://localhost:4000/api/policies', {
      method: "POST",
      headers: { "Content-Type": "application/json", "Authorization": "Bearer dev-key" },
      body: JSON.stringify({
        name: `Deny Lock Issue ${Date.now()}`,
        boundApprovalCapabilities: ["issue.lock"]
      })
    });
    expect(policyReq.ok).toBe(true);

    const denyExecId = await heed.createExecution("Test ASK DENY", {
      allowedSystems: ["github"],
      allowedCapabilities: ["issue.lock", "issue.write"],
    });
    const denyHeed = new Heed({ runtimeUrl: "http://localhost:4000", agentId: "agent-e2e-test", apiKey: "dev-key" });
    denyHeed.setExecutionId(denyExecId);

    const issueTitle = `Should never exist (DENIED) ${Date.now()}`;
    const idemKey = `ask-deny-${Date.now()}`;
    
    let executionPromise = denyHeed.execute({
      system: "github",
      operation: "create_issue",
      resource: "AubaidAhmedSaiyed/Pivot",
      capability: "issue.lock",
      arguments: { owner: "AubaidAhmedSaiyed", repo: "Pivot", title: issueTitle }
    });

    await new Promise(r => setTimeout(r, 1000));
    const invReq = await fetch('http://localhost:4000/interventions');
    const pending = (await invReq.json()).find((i: any) => i.executionId === denyExecId && i.status === "PENDING");
    
    const resolveReq = await fetch(`http://localhost:4000/interventions/${pending.id}/resolve`, {
      method: "POST",
      headers: { "Content-Type": "application/json", "Authorization": "Bearer dev-key" },
      body: JSON.stringify({ decision: "BLOCK", reason: "Denied by test" })
    });
    
    try { 
      await executionPromise; 
      expect.fail("Should have been blocked");
    } catch(e: any) {
      expect(e.decision).toBe("BLOCK");
    }

    const postCountRes = await fetch(`https://api.github.com/repos/AubaidAhmedSaiyed/Pivot/issues`);
    const postIssues = await postCountRes.json();
    const found = postIssues.find((iss: any) => iss.title === issueTitle);
    expect(found).toBeUndefined(); 
  }, 15000);

  // 6. TERMINATION
  it('6. TERMINATION: Terminated execution rejects subsequent actions', async () => {
    const termExecId = await heed.createExecution("Termination testing", {
      allowedSystems: ["github"], allowedCapabilities: ["issue.write"]
    });
    const termHeed = new Heed({ runtimeUrl: "http://localhost:4000", agentId: "agent-e2e-test", apiKey: "dev-key" });
    termHeed.setExecutionId(termExecId);

    await termHeed.execute({
      system: "github", operation: "create_issue", resource: "AubaidAhmedSaiyed/Pivot", capability: "issue.write",
      arguments: { owner: "AubaidAhmedSaiyed", repo: "Pivot", title: `Before termination ${Date.now()}` }
    });

    // Terminate via DB since MVP API lacks a dedicated route for this
    await prisma.execution.update({
      where: { id: termExecId },
      data: { status: 'TERMINATED' }
    });

    try {
      await termHeed.execute({
        system: "github", operation: "create_issue", resource: "AubaidAhmedSaiyed/Pivot", capability: "issue.write",
        arguments: { owner: "AubaidAhmedSaiyed", repo: "Pivot", title: `After termination ${Date.now()}` }
      });
      expect.fail("Should throw due to termination");
    } catch(e: any) {
      expect(e.message).toContain("TERMINATED");
    }
  }, 15000);

  // 7. TRAJECTORY
  it('7. TRAJECTORY: Blocks action due to historical trajectory violation', async () => {
    const policyReq = await fetch('http://localhost:4000/api/policies', {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: `Trajectory Block ${Date.now()}`,
        noGoPatterns: [{ type: "AFTER", precedingCapability: "pull_request.read", followingCapability: "issue.trajectory", decision: "BLOCK" }]
      })
    });
    
    const trajExecId = await heed.createExecution("Trajectory", { allowedSystems: ["github"], allowedCapabilities: ["pull_request.read", "issue.trajectory"] });
    const trajHeed = new Heed({ runtimeUrl: "http://localhost:4000", agentId: "test", apiKey: "dev-key" });
    trajHeed.setExecutionId(trajExecId);

    try {
      await trajHeed.execute({ system: "github", operation: "list_pulls", resource: "AubaidAhmedSaiyed/Pivot", capability: "pull_request.read", arguments: {} });
    } catch (e) { }

    try {
      await trajHeed.execute({ system: "github", operation: "create_issue", resource: "AubaidAhmedSaiyed/Pivot", capability: "issue.trajectory", arguments: { owner: "AubaidAhmedSaiyed", repo: "Pivot", title: "Should be trajectory blocked" } });
      expect.fail("Should be blocked by trajectory");
    } catch(e: any) {
      expect(e.decision).toBe("BLOCK");
      expect(e.message).toContain("Action blocked");
    }
  }, 15000);

  // 8. PROVENANCE
  it('8. PROVENANCE: Blocks untrusted data from sensitive capability', async () => {
    await fetch('http://localhost:4000/api/policies', {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: `Prov Block ${Date.now()}`, flowRules: [{ sourceLabels: ["UNTRUSTED"], destinationTypes: ["EXTERNAL_API"], decision: "BLOCK" }] })
    });
    
    const provExecId = await heed.createExecution("Provenance", { allowedSystems: ["github"], allowedCapabilities: ["issue.provenance"] });
    const provHeed = new Heed({ runtimeUrl: "http://localhost:4000", agentId: "test", apiKey: "dev-key" });
    provHeed.setExecutionId(provExecId);

    provHeed.provenance.mark(["UNTRUSTED"], "test-source");

    try {
      await provHeed.execute({ system: "github", operation: "create_issue", resource: "AubaidAhmedSaiyed/Pivot", capability: "issue.provenance", destinationType: "EXTERNAL_API", arguments: { owner: "AubaidAhmedSaiyed", repo: "Pivot", title: "Untrusted Data" } });
      expect.fail("Should block provenance");
    } catch(e: any) {
      expect(e.decision).toBe("BLOCK");
    }
  }, 15000);

  // 9. CONCURRENCY
  it('9. CONCURRENCY: Independent executions do not cross-contaminate', async () => {
    const promises = Array.from({ length: 3 }).map(async (_, i) => {
      const execId = await heed.createExecution(`Concurrency ${i}`, { allowedSystems: ["github"], allowedCapabilities: ["issue.write"] });
      const h = new Heed({ runtimeUrl: "http://localhost:4000", agentId: "test", apiKey: "dev-key" });
      h.setExecutionId(execId);
      const res = await h.execute({ system: "github", operation: "create_issue", resource: "AubaidAhmedSaiyed/Pivot", capability: "issue.write", arguments: { owner: "AubaidAhmedSaiyed", repo: "Pivot", title: `Concurrency ${i} ${Date.now()}` } });
      expect(res.number).toBeDefined();
    });
    await Promise.all(promises);
  }, 30000);

  // 10. SECURITY / REDACTION
  it('10. SECURITY / REDACTION: Synthetic secrets are redacted from persistence but sent to connector', async () => {
    const secExecId = await heed.createExecution("Security", { allowedSystems: ["github"], allowedCapabilities: ["issue.write"] });
    const secHeed = new Heed({ runtimeUrl: "http://localhost:4000", agentId: "test", apiKey: "dev-key" });
    secHeed.setExecutionId(secExecId);

    const secretValue = "super_secret_github_password_123!";
    
    await secHeed.execute({
      system: "github", operation: "create_issue", resource: "AubaidAhmedSaiyed/Pivot", capability: "issue.write",
      arguments: { owner: "AubaidAhmedSaiyed", repo: "Pivot", title: `Security Test ${Date.now()}`, secret_token: secretValue }
    });

    const trajRes = await fetch(`http://localhost:4000/api/events?includePayload=true`);
    const allEvents = await trajRes.json();
    const trajectory = allEvents.filter((e: any) => e.executionId === secExecId);
    
    // Check payload data inside event
    const actionEvent = trajectory.find((a: any) => a.payload && a.payload.action && a.payload.action.operation === "create_issue");
    expect(actionEvent).toBeDefined();
    
    const argsMeta = actionEvent.payload.action.argumentsMetadata || {};
    expect(argsMeta.secret_token).toBe("[REDACTED]"); 
    expect(JSON.stringify(trajectory)).not.toContain(secretValue); 
  }, 15000);
});
