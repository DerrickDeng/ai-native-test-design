# Automation Coverage Analysis

This is a recommendation based on the synthetic requirements and functional scenarios. No implementation repository or CI evidence was provided, so existing coverage is `Unknown`.

| Scenario / behavior | Recommended primary layer | Component or owner | Dependency strategy | Evidence status | Rationale | Residual risk |
|---|---|---|---|---|---|---|
| Delivery choices and fixed terms | Component | Checkout delivery selector | Render fixed delivery configuration | Unknown | Deterministic display rules can be localized cheaply | Production configuration may differ |
| Delivery cost updates the total | Component plus integration | Checkout total calculation | Component fixtures; integration check for persisted selection | Unknown | Most permutations are deterministic, while persistence crosses a boundary | Request mapping remains unverified |
| Available basket creates Submitted order | API integration plus one E2E journey | Order service and checkout | Real service orchestration with controlled inventory; representative browser journey | Unknown | Order creation and final wiring cross service boundaries | Authentication and deployment wiring require E2E |
| Unavailable item rejects submission | API integration | Order service | Controlled unavailable inventory response | Unknown | The service owns availability rejection and non-creation | UI error rendering may need a focused component check |

Retain one E2E happy-path order journey. Keep delivery permutations and rejection variants at deterministic lower layers unless architecture evidence shows that only a production-like environment can exercise them.
