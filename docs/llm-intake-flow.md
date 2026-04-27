# LLM Intake Flow (MVP)

This planner uses AI as an intake and routing layer, while the planner remains deterministic for validation and estimates.

## Flow

1. User enters a natural-language goal.
2. `POST /api/planner-intake` extracts parent/task/data suggestions.
3. User reviews extracted proposal.
4. Optional clarification mini-step asks up to 3 priority questions.
5. Planner receives a prefill patch and continues with normal step logic.

## Guardrails

- Intake suggestions are not final legal or engineering advice.
- Unknown/low-confidence cases fall back to base planner behavior.
- Only known task keys are accepted in prefill output.
- Missing critical fields are highlighted in planner details.

## Telemetry (MVP)

Client emits lightweight events via `window` custom events:

- `intake_started`
- `intake_reviewed`
- `intake_confirmed`
- `intake_fallback`
- `intake_clarification_opened`
- `intake_clarification_completed`

These can later be forwarded to analytics backend without changing intake UI logic.

## Reporting endpoint (MVP)

- Ingest: `POST /api/planner-intake-event`
- Aggregate report: `GET /api/planner-intake-report?days=7`

Current report is in-memory per running process (suitable for smoke/preview validation). For production, attach persistent storage.
