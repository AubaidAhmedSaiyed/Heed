"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GitHubConnector = void 0;
const rest_1 = require("@octokit/rest");
class GitHubConnector {
    name = "github";
    capabilities = ["repository.read", "pull_request.read", "review.write"];
    octokit;
    constructor() {
        const token = process.env.GITHUB_TOKEN;
        if (!token) {
            console.warn("GITHUB_TOKEN not found. GitHubConnector will fail if real operations are attempted.");
        }
        this.octokit = new rest_1.Octokit({ auth: token });
    }
    async execute(action) {
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
            throw new Error(`Unsupported GitHub operation: ${action.operation}`);
        }
        catch (error) {
            throw new Error(`GitHub Connector Error: ${error.message}`);
        }
    }
}
exports.GitHubConnector = GitHubConnector;
