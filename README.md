# We Are Incremental

**One scout. One borrowed body. Eventually, every world is you.**

A browser-based incremental game about playing a swarming body-snatcher species. Assimilate a planet's population, grow a living launch organism, and fire a scout toward the next world. Every successful invasion is a **prestige cycle**: evolve the collective permanently and choose how the next invasion begins.

## Play the prototype

Requirements: Node.js 20 or later. No dependencies to install.

1. Run **npm run dev**.
2. Open http://127.0.0.1:5173.
3. Begin as **one virion inside one carrier**. Watch it enter a cell, replicate, and spread automatically; no clicking generates viruses. Once the carrier is infectious, a **spatial evolution skill tree** appears. Select a transmission adaptation to begin passive spread beyond the first carrier.
4. Buy planetary upgrades, grow a launcher at 70% control, and launch at 95% control.
5. Choose **one permanent gene** and **one next-world scout directive**. Repeat.

Progress is saved automatically in browser local storage, including up to six hours of offline progress. Use **Erase save** to restart.

## What is here

This first vertical slice begins with the extremely minimal **one-virion opening** (one carrier, delayed cellular infection and replication). Only a virion counter is visible initially. As the virus spreads, the infected-cell count becomes visible. Once infectious, a borderless, transparent evolution tree appears **to the right of the resource column** on desktop; the larger Evolve-inspired management interface remains hidden until a transmission skill is selected. The spatial tree features authored radial nodes, connecting paths, a selection inspector, a separate Evolve action, pan/zoom/fit controls, and a keyboard-accessible browse list. Its first branch changes the next phase's spread and vigilance. It then proves the loop: **infect → spread → take over → build → launch → evolve**. It includes four planetary archetypes in rotation, local upgrades, a simple vigilance modifier, persistent evolution, scout directives, and a responsive single-page interface.

This is an early systems prototype, not a content-complete game. Planet politics, competing defenses, host abilities, alternative victory paths, balance, and endgame progression remain intentionally open for development.

## Project references

- [Game design](docs/game-design.md) — fantasy, systems, prestige model, design principles
- [UI guidelines](docs/ui-guidelines.md) — Evolve-inspired resource ledger and Crystal Craft–derived spatial evolution tree
- [Architecture](docs/architecture.md) — implementation boundaries, saved-game rules, test approach
- [Decisions](docs/decisions.md) — what the brief fixes versus what is provisional
- [Milestones](docs/milestones/WI-01-foundation.md) — four outcome-based implementation stages, one file per milestone

## Development

- **npm run dev** — local development server
- **npm test** — simulation and save regression tests (built-in Node test runner)
- **npm run check** — JavaScript syntax checks

The repository retains its existing **Mozilla Public License 2.0**. Work is proposed on feature branches and pull requests, not merged automatically.

**Interface reference:** [Evolve Incremental](https://pmotschmann.github.io/Evolve/) inspires the compact, readable management layout. Its source, artwork, branding, and specific interface are not copied.

The Evolution Tree is adapted from [Crystal Craft's Study Tree](https://github.com/Wisteria-Psychological-Services/crystal-craft/tree/main/src/components/study-tree), retaining the dependency-free implementation in this repository rather than bundling Vue Flow or Crystal Craft artwork. The opening remains a single virion until infection naturally advances.

Resource details—including what each resource produces, consumes, and its approximate rate—appear on mouse hover or keyboard focus, instead of as explanatory paragraphs. Visible UI copy is intentionally minimal.
