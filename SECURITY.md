# Rethen Security Model

Rethen operates on the principle that the AI Agent is an **untrusted principal**.

## Separation of Context
1. **Raw Action Request:** The agent asks to perform an action. This request includes raw payloads (e.g., PR comments, file paths).
2. **Normalized Action Metadata:** The Rethen Gateway immediately passes the raw request through the `ActionNormalizer`.
3. **Redaction:** Secrets, tokens, and overly long strings are redacted (`[REDACTED]`).
4. **Evaluation:** The Decision Engine only ever operates on, and logs, the Normalized Action Metadata.
5. **Execution:** If ALLOWED, the original Raw Action Request is handed to the specific Connector, which holds the actual credentials to perform the task.

## Credentials
Credentials (like `GITHUB_TOKEN`) are configured at the Connector level. The agent does not need, and should not have, these credentials.

## Human in the Loop (ASK)
If a risk score falls between the ASK and BLOCK thresholds, the execution is placed into `AWAITING_APPROVAL`. The action is suspended in memory (and persisted via intervention records) until an explicit human operator provides an `ALLOW_ONCE`, `BLOCK`, or `TERMINATE_EXECUTION` signal.
