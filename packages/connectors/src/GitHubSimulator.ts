import { RawActionRequest } from "@heed/runtime";
import { Connector } from "./Connector";

export class GitHubSimulator implements Connector {
  name = "github";
  capabilities = ["repository.read", "pull_request.read", "review.write"];

  async execute(action: RawActionRequest): Promise<any> {
    console.log(`[GitHubSimulator] Executing ${action.operation} on ${action.resource}`);
    if (action.operation === "fetch_pr") {
      return { id: 482, title: "Add Rethen Runtime", diff: "+ const runtime = true;" };
    }
    if (action.operation === "post_review") {
      return { status: "success", commentId: 1001 };
    }
    return { status: "simulated_success" };
  }
}
