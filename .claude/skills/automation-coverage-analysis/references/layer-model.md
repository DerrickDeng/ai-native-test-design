# Automation Layer Model

Use boundaries, dependencies, and failure localization rather than UI wording to choose a layer.

## Unit or component

Prefer when the behavior can be proven with deterministic inputs inside one function, class, component, validator, formatter, reducer, or calculation boundary.

Typical dependency strategy: direct calls, fixed fixtures, rendered component props, or in-memory collaborators.

Examples: input formatting, pure calculations, local state transitions, fixed option rendering, schema validation.

## Integration, contract, or service

Prefer when the behavior depends on collaboration across components, routes, persistence, message handling, API request/response mapping, or a published contract.

Typical dependency strategy: real code across the boundary under test, with unstable or external systems replaced by controlled fakes, containers, sandboxes, or contract fixtures.

Examples: frontend response mapping, repository persistence, API validation, service orchestration, consumer-provider compatibility.

## End-to-end

Retain when confidence depends on a production-like journey crossing real deployment boundaries, authentication, routing, persistence, messaging, or third-party integration.

E2E is most valuable for:

- principal user journeys;
- critical financial, compliance, permission, or irreversible outcomes;
- wiring and configuration that lower layers cannot prove;
- a small representative set of cross-system states.

Avoid putting every data permutation in E2E when the same business rule can be proven deterministically lower down.

## Complementary coverage

One behavior may justify more than one layer for different risks. State the separate purpose of each layer. Do not count duplicated wording as independent protection.
