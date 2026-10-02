# Error Handling

The `@heed-ai/runtime` SDK uses `HeedError` for structured failure handling.

## `HeedError` properties
- `message`: A human-readable description of why the action was rejected.
- `decision`: The runtime decision (`BLOCK`, `ASK`, `BOUND_APPROVAL`).
- `reasons`: An array of strings detailing the specific policy violations.

## Example Handling
```typescript
import { HeedError } from "@heed-ai/runtime";

try {
  await heed.execute(actionPayload);
} catch (error) {
  if (error instanceof HeedError) {
    if (error.decision === "BLOCK") {
      console.error("Action permanently blocked:", error.reasons);
    }
  } else {
    // 502/504 errors from external Connectors
    console.error("Connector or network failure:", error.message);
  }
}
```

## Fail-Closed Semantics
If the HEED API is unreachable or returns a `500 Internal Server Error`, the SDK natively throws an exception, preventing the action from executing blindly. HEED never fails open.
