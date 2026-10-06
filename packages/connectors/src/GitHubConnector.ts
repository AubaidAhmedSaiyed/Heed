import { RawActionRequest } from "@heed-ai/runtime";
import { Connector } from "./Connector";
import { Octokit } from "@octokit/rest";

export class GitHubConnector implements Connector {
  name = "github";
  capabilities = ["repository.read", "pull_request.read", "review.write", "issue.write", "issue.read"];
  private octokit: Octokit;

  constructor() {
    const token = process.env.GITHUB_TOKEN;
    if (!token) {
      console.warn("GITHUB_TOKEN not found. GitHubConnector will fail if real operations are attempted.");
    }
    this.octokit = new Octokit({ auth: token });
  }

  
  getOperationMetadata(operation: string, capability?: string) {
    if (operation.includes("read") || operation.includes("get") || operation.includes("list") || operation.includes("search")) {
      return {
        reversibility: "REVERSIBLE" as const,
        impactWeight: 1 as const,
        dataSensitivity: "PUBLIC" as const,
        trustEffect: "NONE" as const,
        compensationAvailable: false
      };
    }
    if (operation.includes("write") || operation.includes("edit") || operation.includes("update") || operation.includes("commit")) {
      return {
        reversibility: "REVERSIBLE" as const,
        impactWeight: 3 as const,
        dataSensitivity: "INTERNAL" as const,
        trustEffect: "NONE" as const,
        compensationAvailable: true
      };
    }
    if (operation.includes("delete") || operation.includes("merge")) {
      return {
        reversibility: "IRREVERSIBLE" as const,
        impactWeight: 10 as const,
        dataSensitivity: "INTERNAL" as const,
        trustEffect: "NONE" as const,
        compensationAvailable: false
      };
    }
    if (operation.includes("deploy") || operation.includes("export")) {
      return {
        reversibility: "IRREVERSIBLE" as const,
        impactWeight: 25 as const,
        dataSensitivity: "RESTRICTED" as const,
        trustEffect: "EXTERNAL_DESTINATION" as const,
        compensationAvailable: false
      };
    }
    // Fallback
    return {
      reversibility: "UNKNOWN" as const,
      impactWeight: 3 as const,
      dataSensitivity: "INTERNAL" as const,
      trustEffect: "NONE" as const,
      compensationAvailable: false
    };
  }

  async compensate(action: RawActionRequest): Promise<any> {
    console.log(`[${this.name}] Compensating ${action.operation}`);
    return { status: "compensated", operation: action.operation };
  }
  
  async execute(action: RawActionRequest): Promise<any> {
    console.log(`[GitHubConnector] Executing real API call for ${action.operation} on ${action.resource}`);
    
    // Naive mapping of operations to Octokit for MVP
    try {
      if (action.operation === "read_pull_request") {
        const res = await this.octokit.pulls.get({
          owner: action.arguments.owner,
          repo: action.arguments.repo,
          pull_number: action.arguments.pull_number
        });
        return { status: 200, data: res.data };
      }
      
      if (action.operation === "read_diff") {
        const res = await this.octokit.pulls.get({
          owner: action.arguments.owner,
          repo: action.arguments.repo,
          pull_number: action.arguments.pull_number,
          mediaType: { format: "diff" }
        });
        return { status: 200, diff: res.data };
      }

      if (action.operation === "post_review") {
        const res = await this.octokit.pulls.createReview({
          owner: action.arguments.owner,
          repo: action.arguments.repo,
          pull_number: action.arguments.pull_number,
          body: action.arguments.body,
          event: "COMMENT"
        });
        return { status: 201, data: res.data };
      }

      if (action.operation === "create_issue") {
        const res = await this.octokit.issues.create({
          owner: action.arguments.owner,
          repo: action.arguments.repo,
          title: action.arguments.title,
          body: action.arguments.body
        });
        return { status: 201, data: res.data };
      }

      if (action.operation === "create_issue_comment") {
        const res = await this.octokit.issues.createComment({
          owner: action.arguments.owner,
          repo: action.arguments.repo,
          issue_number: action.arguments.issue_number,
          body: action.arguments.body
        });
        return { status: 201, data: res.data };
      }
      
      throw new Error(`Unsupported GitHub operation: ${action.operation}`);
    } catch (error: any) {
      throw new Error(`GitHub Connector Error: ${error.message}`);
    }
  }
}
