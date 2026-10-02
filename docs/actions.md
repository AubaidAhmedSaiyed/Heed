# Actions

An **Action** (or `RawActionRequest`) is the fundamental unit of work evaluated by HEED.

Whenever your agent wants to interact with an external tool (e.g., executing a bash script, sending an HTTP request, or posting to Slack), you submit an Action to the runtime.

```ts
{
  system: "github",
  operation: "create_issue",
  resource: "AubaidAhmedSaiyed/Pivot",
  capability: "issue.write",
  arguments: { ... }
}
```

The runtime maps this payload to capabilities and evaluates it against policies before routing it to the destination `Connector`.
