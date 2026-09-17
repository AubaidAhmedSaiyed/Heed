async function main() {
  const res = await fetch("http://localhost:4000/api/executions/123/actions", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ system: "test", operation: "test", resource: "test", capability: "test", arguments: {} })
  });
  console.log("Status:", res.status);
  const data = await res.json();
  console.log("Response:", data);
}
main();
