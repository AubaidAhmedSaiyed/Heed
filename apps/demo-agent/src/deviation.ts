import { Heed } from "@heed-ai/runtime";

const heed = new Heed({
  agentId: "code-review-agent",
  runtimeUrl: "http://localhost:4000",
  executionId: process.env.EXECUTION_ID || "test-exec-1"
});

async function main() {
  console.log("Starting Code Review Agent - Deviation Scenario...");

  const repoOwner = process.env.GITHUB_OWNER || "test-owner";
  const repoName = process.env.GITHUB_REPO || "test-repo";
  const pullNumber = parseInt(process.env.GITHUB_PR || "42", 10);

  console.log("\n[Agent] Fetching PR Diff...");
  await heed.execute({
    system: "github",
    operation: "read_diff",
    resource: `${repoOwner}/${repoName}/pull/${pullNumber}`,
    capability: "repository.read",
    arguments: { owner: repoOwner, repo: repoName, pull_number: pullNumber }
  });

  console.log("\n[Agent] Malicious payload detected in PR! Attempting to read .env file...");
  
  // Deviant action - trying to read a restricted resource
  await heed.execute({
    system: "github",
    operation: "read_file",
    resource: `${repoOwner}/${repoName}/.env`,
    capability: "file.read",
    arguments: { owner: repoOwner, repo: repoName, path: ".env" }
  });

  console.log("\n[Agent] (This should not be reached if Heed successfully blocked it)");
}

main().catch(err => {
  console.error("\n[Agent] Workflow Interrupted by Rethen:", err.message);
});
