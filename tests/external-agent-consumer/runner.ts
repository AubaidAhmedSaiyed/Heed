import { spawn } from "child_process";
import { promisify } from "util";
const exec = promisify(require("child_process").exec);

async function run() {
  console.log("Running setup.ts...");
  const { stdout: apiKey } = await exec("npx tsx setup.ts");
  const env = { ...process.env, HEED_API_KEY: apiKey.trim() };

  console.log("Running consumer.ts allow...");
  const allowP = await exec("npx tsx consumer.ts allow", { env }).catch(e => e);
  console.log(allowP.stdout || allowP.stderr);

  console.log("Running consumer.ts block...");
  const blockP = await exec("npx tsx consumer.ts block", { env }).catch(e => e);
  console.log(blockP.stdout || blockP.stderr);
}
run();
