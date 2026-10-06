# Frontend Automation Boundaries

These rules are distilled from the repository's former layered-testing material. They are decision aids, not universal architecture facts.

| Behavior | Usually component/unit | Usually integration or E2E |
|---|---|---|
| Element or fixed label | Static presence, fixed text, fixed control state | Value or visibility determined by remote data or permission |
| Validation | Rule executes entirely in the client with fixed inputs | Server decides validity or returns the rejection |
| Calculation | Pure client calculation | Value is calculated or confirmed by a service |
| Local interaction | Toggle, selection, local state, local sorting | Action sends a request, changes route, downloads, persists, or reloads data |
| Status display | Mapping a supplied status to text or style | Status transition is driven by backend workflow or event |
| Data rendering | Render a controlled response fixture | Prove request, response mapping, pagination, refresh, or live update |
| Layout | Fixed responsive/layout rule | Layout behavior depends on incremental or remote loading |

Split one user action when it carries two contracts. For example, verify the local loading state in a component test and the request/response behavior in an integration test.

Do not infer that a scenario belongs to frontend merely because its outcome is visible in the UI. Identify which component or service owns the rule.
