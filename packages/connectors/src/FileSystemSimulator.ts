import { RawActionRequest } from "@heed-ai/runtime";
import { Connector } from "./Connector";

export class FileSystemSimulator implements Connector {
  name = "filesystem";
  capabilities = ["file.read", "file.write", "tests.run"];

  async execute(action: RawActionRequest): Promise<any> {
    console.log(`[FileSystemSimulator] Executing ${action.operation} on ${action.resource}`);
    if (action.operation === "read_file") {
      return { content: "// File content simulation" };
    }
    if (action.operation === "run_tests") {
      return { passed: true, total: 42 };
    }
    return { status: "simulated_success" };
  }
}
