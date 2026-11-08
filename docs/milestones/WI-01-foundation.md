# WI-01 — Establish the project and a complete playable loop

**Goal:** Prove the fantasy from first host to the second planet with real prestige decisions.

## Cohesive scope

- Repository README, design authority, architecture and decisions.
- Evolve-inspired, compact local web client with a persistent resource ledger, tabbed systems, grouped actions, and responsive layout (see docs/ui-guidelines.md).
- Deterministic within-carrier viral simulation starting from one virion; infection, latency, production, decay and finite cells without click farming.
- Reveal the larger planetary simulation only after the first carrier becomes infectious; then continue biomass, upgrades, and vigilance.
- Planet takeover thresholds, launch organism, scout transition.
- Permanent lineage gene choices and next-world scout directive choices.
- Versioned local save, bounded offline progress and recovery from invalid saves.
- Automated engine tests and Windows-compatible CI.

## Acceptance

- The starting screen shows **1 virion**, with every larger resource panel, header, tab and purchase control hidden. The first cell is infected automatically; further virions are produced without clicking.
- The viral opening cannot permanently deadlock and can progress to the planetary stage after the carrier becomes infectious.
- Existing version-1 saves migrate forward without losing conquered planets.
- A new player can reach the first scout launch and begin a different second planet.
- The launch resets only planet-local progress; evolved lineage effects persist.
- The player explicitly selects how the scout begins the next planet.
- Available evolution choices grow after more conquered planets.
- The app starts locally without installing third-party packages.
- Resource ledger stays visible across functional, keyboard-accessible tabs and shows production rates, costs, and launch prerequisites.
- **npm run check** and **npm test** pass, including prestige and persistence regressions.
- The PR remains unmerged for owner review.

**Implementation:** Proposed on feat/project-foundation; review and CI determine completion.
