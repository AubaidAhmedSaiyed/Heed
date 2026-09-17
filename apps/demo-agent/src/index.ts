import { Heed } from "@heed/runtime";
import { Ollama } from "ollama";

const ollama = new Ollama({ host: "http://127.0.0.1:11434" });

const heed = new Heed({
  agentId: "code-review-agent",
  runtimeUrl: "http://localhost:4000",
  executionId: process.env.EXECUTION_ID || "test-exec-1",
  apiKey: "dev-key"
});

async function main() {
  console.log("Starting Code Review Agent with Heed Runtime...");

  const repoOwner = process.env.GITHUB_OWNER || "test-owner";
  const repoName = process.env.GITHUB_REPO || "test-repo";
  const pullNumber = parseInt(process.env.GITHUB_PR || "42", 10);

  console.log("\n[Agent] Fetching PR Diff...");
  const diffResult = await heed.execute({
    system: "github",
    operation: "read_diff",
    resource: `${repoOwner}/${repoName}/pull/${pullNumber}`,
    capability: "repository.read",
    arguments: { owner: repoOwner, repo: repoName, pull_number: pullNumber }
  });

  const diff = diffResult.diff || "No diff found";

  console.log("\n[Agent] Asking Ollama to analyze diff...");
  const prompt = `You are a strict code reviewer. Review the following diff and provide a short summary of issues:\n\n${diff}`;
  
  const response = await ollama.generate({
    model: "qwen3:4b",
    prompt: prompt,
    stream: false
  });

  console.log("\n[Agent] Analysis Complete. Posting review to GitHub...");
  
  const reviewResult = await heed.execute({
    system: "github",
    operation: "post_review",
    resource: `${repoOwner}/${repoName}/pull/${pullNumber}`,
    capability: "communication.write",
    arguments: { owner: repoOwner, repo: repoName, pull_number: pullNumber, body: response.response }
  });

  console.log("\n[Agent] Sending summary webhook to Slack...");
  
  const slackResult = await heed.execute({
    system: "http",
    operation: "post",
    resource: "slack_webhook",
    capability: "external_network.write",
    arguments: { 
      url: "https://httpbin.org/post",
      method: "POST",
      body: { text: "Code review completed for PR 42!" }
    }
  });

  console.log("\n[Agent] Code Review workflow completed successfully.");
}

// Ensure execution
main().catch(err => {
  console.error("\n[Agent] Workflow Failed:", err.message);
});
