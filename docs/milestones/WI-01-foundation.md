# WI-01 — Establish the project and a complete playable loop

**Goal:** Prove the fantasy from first host to the second planet with real prestige decisions.

## Cohesive scope

- Repository README, design authority, architecture and decisions.
- Evolve-inspired, compact local web client with a persistent resource ledger, tabbed systems, grouped actions, and responsive layout (see docs/ui-guidelines.md).
- Deterministic within-carrier viral simulation starting from one virion; infection, latency, production, decay and finite cells without click farming.
- Unlock a data-driven **spatial** evolution skill tree when the first carrier becomes infectious. Adapt Crystal Craft's authored radial connections, selection inspector, independent Evolve action, navigation and keyboard/list alternatives without adding dependencies. Require a meaningful, exclusive transmission adaptation rather than a generic Continue button; then reveal biomass, upgrades, and vigilance.
- Planet takeover thresholds, launch organism, scout transition.
- Permanent lineage gene choices and next-world scout directive choices.
- Versioned local save, bounded offline progress and recovery from invalid saves.
- Automated engine tests and Windows-compatible CI.

## Acceptance

- The starting screen shows **1 virion**, with every larger resource panel, header, tab and purchase control hidden. The first cell is infected automatically; further virions are produced without clicking.
- The viral opening cannot permanently deadlock. Once infectious, selecting a valid transmission skill transitions to planetary spread; invalid selections do not.
- The two starting transmission choices measurably differ in passive growth and vigilance; the chosen branch survives save/reload.
- Existing version-1 and version-2 saves migrate without losing progress.
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

- Graph selection, pan/zoom, browsing and focus must never commit evolution; only the guarded Evolve action does.
- Camera fit occurs once when the node graph is measurable; expanding the game must not reset manual camera positioning.

- The first infection screen contains no explanatory sentences, decorative headings, or generic progress text. The graphical tree appears to the **right** of resources on desktop, with **transparent, borderless panels**.
- Virions, infected cells, and all later resource rows expose their producers, outputs and consumers through keyboard-accessible hover/focus details; quantitative rates come from simulation where available.
- Intentional node selection shows actionable consequences; unselected inspector space does not contain placeholder copy.
