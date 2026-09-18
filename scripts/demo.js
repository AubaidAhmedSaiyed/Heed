const { spawn } = require("child_process");
const path = require("path");

console.log("==========================================");
console.log("        HEED MVP - DEMONSTRATION        ");
console.log("==========================================\n");

async function main() {
  console.log("[Info] Starting HEED API Backend (Make sure Postgres is running!)...");
  const apiProcess = spawn("npm", ["run", "dev"], {
    cwd: path.join(__dirname, "../apps/api"),
    stdio: "pipe",
    shell: true
  });

  let hasStarted = false;

  apiProcess.stdout.on("data", (data) => {
    const msg = data.toString();
    if (msg.includes("listening on port 4000") && !hasStarted) {
      hasStarted = true;
      console.log("[Success] API is running.\n");
      runAgent("simple-example.ts");
    }
  });

  apiProcess.stderr.on("data", (data) => {
    // Suppress noisy output unless fatal
  });

  function runAgent(scriptName) {
    console.log(`\n[Info] Running demo script: ${scriptName}...`);
    
    const agentProcess = spawn("npx", ["ts-node", `src/${scriptName}`], {
      cwd: path.join(__dirname, "../apps/demo-agent"),
      stdio: "inherit",
      shell: true
    });

    agentProcess.on("close", (code) => {
      console.log(`\n[Agent] Process exited with code ${code}`);
      
      if (scriptName === "simple-example.ts") {
        console.log("\n==========================================");
        console.log("Now running the Contextual Benchmark...");
        console.log("==========================================\n");
        runAgent("benchmark.ts");
      } else {
        console.log("\n==========================================");
        console.log("Demo completed. Shutting down API...");
        apiProcess.kill();
        process.exit(0);
      }
    });
  }
}

main().catch(console.error);
