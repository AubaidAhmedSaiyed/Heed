const http = require("http");

async function main() {
  // Fetch pending interventions
  const res = await fetch("http://127.0.0.1:4000/interventions");
  const interventions = await res.json();
  
  if (interventions.length === 0) {
    console.log("No pending interventions.");
    return;
  }

  const id = interventions[0].id;
  console.log(`Resolving intervention ${id} with ALLOW_ONCE...`);

  const resolveRes = await fetch(`http://127.0.0.1:4000/interventions/${id}/resolve`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ decision: "ALLOW_ONCE" })
  });

  const result = await resolveRes.json();
  console.log(result);
}

main().catch(console.error);
