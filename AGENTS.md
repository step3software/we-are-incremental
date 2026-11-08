# Repository working instructions

## Project intent
Build the incremental game described in [docs/game-design.md](docs/game-design.md): the player is a collective body-snatcher species, conquers one planet per run, launches a scout to prestige, and gains both durable evolution and meaningful control of the next run.

## Sources of truth
- The game vision and intended mechanics live in docs/game-design.md.
- The first-generation opening starts with exactly one virion inside one carrier. Replication and spread happen automatically, never via a click-for-one-resource action. The UI initially shows only the virion resource; additional systems appear when progression justifies them.
- The UI design authority is docs/ui-guidelines.md: Evolve-inspired density and hierarchy, with original visual identity.
- Actual current mechanics and save schema live in src/game.js and src/storage.js.
- docs/decisions.md distinguishes confirmed premise from working design assumptions.
- One milestone per file under docs/milestones/. Avoid duplicating normative requirements across files.

## Engineering
- Keep simulation rules pure, deterministic, and independent of DOM and storage; side effects belong in src/main.js or src/storage.js.
- Every rule change needs corresponding Node tests for progression, caps, prestige, and/or invalid saves.
- Preserve save compatibility or introduce a versioned migration. Never silently reinterpret an older save.
- Avoid additional dependencies, frameworks, network services, or data collection without a clear demonstrated need.
- Prefer keyboard-accessible controls, meaningful labels, responsive layouts, and reduced-motion support.
- Do not let progression permanently deadlock; the player must retain a route to the next world.
- Keep game numbers and balance tunable in central definitions rather than duplicating constants in the UI.
- Test on Windows-compatible tooling. CI should not require Linux.

## Delivery
- Make changes on a feature branch with a reviewable PR.
- Do not merge PRs; the owner reviews and merges.
- Milestones define outcomes, not forced implementation sequences. Keep scopes cohesive and economical.
