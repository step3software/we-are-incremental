# Repository working instructions

## Project intent
Build the incremental game described in [docs/game-design.md](docs/game-design.md): the player is a collective body-snatcher species, conquers one planet per run, launches a scout to prestige, and gains both durable evolution and meaningful control of the next run.

## Sources of truth
- The game vision and intended mechanics live in docs/game-design.md.
- The first-generation opening starts with exactly one virion inside one carrier. Replication and spread happen automatically, never via a click-for-one-resource action. The UI initially shows only the virion resource; additional systems appear when progression justifies them.
- Progression choices belong in a **skill tree**, not generic continue buttons. Viral milestones complete automatically; an infectious carrier unlocks exclusive transmission branches with meaningful simulation effects. Future biological upgrades should grow this data-driven tree rather than introduce unrelated click-based actions.
- The UI design authority is docs/ui-guidelines.md: Evolve-inspired management and a Crystal Craft–derived spatial graph for the biological skill tree. Keep the opening to one virion until progression unlocks the tree.
- Actual current mechanics and save schema live in src/game.js and src/storage.js.
- docs/decisions.md distinguishes confirmed premise from working design assumptions.
- One milestone per file under docs/milestones/. Avoid duplicating normative requirements across files.

## Engineering
- Keep simulation rules pure, deterministic, and independent of DOM and storage; side effects belong in src/main.js or src/storage.js.
- Every rule change needs corresponding Node tests for progression, caps, prestige, and/or invalid saves.
- Preserve save compatibility or introduce a versioned migration. Never silently reinterpret an older save.
- Avoid additional dependencies, frameworks, network services, or data collection without a clear demonstrated need.
- The Evolution Tree layout/eligibility are pure derived data in src/evolutionTreeLayout.js; src/evolutionTreeView.js owns only DOM/SVG rendering, camera, selection, keyboard navigation, and the explicit Evolve action. Selecting/panning/zooming must never purchase or advance a node.
- Prefer keyboard-accessible controls, meaningful labels, responsive layouts, and reduced-motion support.
- **Standing UI copy rule:** Do not add explanatory headers, tutorials, filler, instructions, status sentences, or panel descriptions to the main game view unless essential to decide or act. Prefer minimal resource names, numbers and verbs; put optional explanations in concise mouse-hover/keyboard-focus tooltips with accessible text equivalents. Avoid new visible text by default.
- **Origin layout:** after infection matures, show the evolution skill tree as the panel to the **right** of the virus resource column on desktop (stack on mobile); keep its canvas, workspace, and inspector surfaces transparent and borderless. The single-virion opening must remain visually quiet before that unlock.
- Resource tooltips should disclose production, consumption, and the driver of each rate, using canonical simulation-derived values where feasible. Never invent a simulated cost or a gain that game rules do not support.
- Do not let progression permanently deadlock; the player must retain a route to the next world.
- Keep game numbers and balance tunable in central definitions rather than duplicating constants in the UI.
- Test on Windows-compatible tooling. CI should not require Linux.

## Delivery
- Make changes on a feature branch with a reviewable PR.
- Do not merge PRs; the owner reviews and merges.
- Milestones define outcomes, not forced implementation sequences. Keep scopes cohesive and economical.
