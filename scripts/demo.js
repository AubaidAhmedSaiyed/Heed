const { spawn } = require("child_process");
const fs = require("fs");
const path = require("path");

console.log("==========================================");
console.log("        HEED MVP - DEMONSTRATION        ");
console.log("==========================================\n");

async function main() {
  // Check if .env is set up
  const envPath = path.join(__dirname, "../prisma/.env");
  if (!fs.existsSync(envPath)) {
    console.log("[Setup] Creating default prisma/.env file...");
    fs.writeFileSync(envPath, "DATABASE_URL=\"postgresql://postgres:postgres@localhost:5432/rethen_dev\"\n");
  }

  console.log("[Info] Starting HEED API Backend...");
  const apiProcess = spawn("npm", ["run", "dev"], {
    cwd: path.join(__dirname, "../apps/api"),
    stdio: "pipe",
    shell: true
  });

  apiProcess.stdout.on("data", (data) => {
    const msg = data.toString();
    if (msg.includes("listening on port 4000")) {
      console.log("[Success] API is running.\n");
      runAgent("Normal");
    }
  });

  apiProcess.stderr.on("data", (data) => {
    // Suppress noisy ts-node-dev errors for the demo output unless they are fatal
  });

  function runAgent(mode) {
    console.log(`[Info] Starting Code Review Agent (${mode} Scenario)...`);
    
    const script = mode === "Normal" ? "demo" : "demo:deviation";
    const agentProcess = spawn("npm", ["run", script], {
      cwd: path.join(__dirname, "../apps/demo-agent"),
      stdio: "inherit",
      shell: true
    });

    agentProcess.on("close", (code) => {
      console.log(`\n[Agent] Process exited with code ${code}`);
      
      if (mode === "Normal") {
        console.log("\n==========================================");
        console.log("Now running the Deviation Scenario...");
        console.log("==========================================\n");
        runAgent("Deviation");
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
