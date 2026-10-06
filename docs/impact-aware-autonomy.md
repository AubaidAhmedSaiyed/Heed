# Impact-Aware Autonomy

## The Problem
Autonomous AI agents are often granted binary permissions based on capability (e.g., "allowed to write to the database"). This model fails to account for the cumulative risk an agent presents over time, the varying destructiveness of different actions within the same capability, and whether the agent has been exposed to untrusted external input.

## Impact-Aware Autonomy
HEED does not give an agent unlimited autonomy just because an action is technically permitted. This implementation explores impact-aware runtime authorization by combining reversibility, cumulative execution impact, trust state, and bounded autonomy. 

Instead of asking just "Is this action allowed?", HEED additionally evaluates:
- How reversible is this action?
- How much impact can it have?
- Has this execution already consumed its risk budget?
- Has the execution crossed a trust/data boundary?

## Core Concepts

### 1. Reversibility
Operations are classified as \`REVERSIBLE\`, \`IRREVERSIBLE\`, or \`UNKNOWN\`. Irreversible operations undergo stricter scrutiny.

### 2. Impact Weights
Every action has an inherent impact weight (e.g., 1 for Read, 3 for Write, 10 for Delete, 25 for External Export). This allows HEED to quantify the risk of the action.

### 3. Execution Budgets
An execution begins with a default impact budget (e.g., 30). As the agent performs authorized actions, the weight of each executed action is atomically consumed from the budget. Once the budget runs low or is exceeded, subsequent actions require human approval (\`ASK\`) or are \`BLOCKED\`.

### 4. Trust Boundaries
HEED tracks the execution's trust state (\`TRUSTED\`, \`UNTRUSTED_INPUT\`, \`SENSITIVE_DATA\`, \`EXTERNAL_DESTINATION\`). If an agent reads a normal repository, it remains trusted. If it accesses a production secret, the state transitions to \`SENSITIVE_DATA\`. If it then attempts a high-impact external network request, the evaluator immediately forces human intervention.

### 5. Compensation Journal
When an execution is unexpectedly denied or terminated by human intervention, HEED utilizes the Compensation Journal. Successfully executed reversible actions are automatically compensated (undone) in reverse order using trusted connector rollback handlers.

## Security Model
- **Server-side authority**: Agents cannot modify their own budget, impact weight, or reversibility metadata.
- **Fail-closed**: If a budget transaction fails or evaluation errors occur, HEED blocks the action.
- **Atomic Accounting**: Budget is consumed securely using database transactions to prevent race conditions.
- **Existing Rules Override**: If a base policy strictly \`BLOCKS\` an action, the impact evaluator will not override it to \`ALLOW\` even if there is budget.

## Future ML Integration
While the current Impact Evaluator is purely deterministic, future integrations can utilize ML drift detection. 
- Normal behavior → larger autonomy budget
- Behavioral deviation → reduced autonomy budget
- Severe deviation → immediate ASK/BLOCK 
