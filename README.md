# We Are Incremental

**One scout. One borrowed body. Eventually, every world is you.**

A browser-based incremental game about playing a swarming body-snatcher species. Assimilate a planet's population, grow a living launch organism, and fire a scout toward the next world. Every successful invasion is a **prestige cycle**: evolve the collective permanently and choose how the next invasion begins.

## Play the prototype

Requirements: Node.js 20 or later. No dependencies to install.

1. Run **npm run dev**.
2. Open http://127.0.0.1:5173.
3. Begin as **one virion inside one carrier**. Watch it enter a cell, replicate, and spread automatically; no clicking generates viruses. Once the carrier is infectious, a **small evolution skill tree** appears. Select a transmission adaptation to begin passive spread beyond the first carrier.
4. Buy planetary upgrades, grow a launcher at 70% control, and launch at 95% control.
5. Choose **one permanent gene** and **one next-world scout directive**. Repeat.

Progress is saved automatically in browser local storage, including up to six hours of offline progress. Use **Erase save** to restart.

## What is here

This first vertical slice begins with the extremely minimal **one-virion opening** (one carrier, delayed cellular infection and replication). Only a virion counter is visible initially. As the virus spreads, infected-cell information becomes visible; the larger Evolve-inspired management interface stays entirely hidden until a transmission skill is selected. The skill tree replaces the generic Continue button and its first branch changes the next phase's spread and vigilance. It then proves the loop: **infect → spread → take over → build → launch → evolve**. It includes four planetary archetypes in rotation, local upgrades, a simple vigilance modifier, persistent evolution, scout directives, and a responsive single-page interface.

This is an early systems prototype, not a content-complete game. Planet politics, competing defenses, host abilities, alternative victory paths, balance, and endgame progression remain intentionally open for development.

## Project references

- [Game design](docs/game-design.md) — fantasy, systems, prestige model, design principles
- [UI guidelines](docs/ui-guidelines.md) — Evolve-inspired resource ledger, grouped actions, and tabbed interface
- [Architecture](docs/architecture.md) — implementation boundaries, saved-game rules, test approach
- [Decisions](docs/decisions.md) — what the brief fixes versus what is provisional
- [Milestones](docs/milestones/WI-01-foundation.md) — four outcome-based implementation stages, one file per milestone

## Development

- **npm run dev** — local development server
- **npm test** — simulation and save regression tests (built-in Node test runner)
- **npm run check** — JavaScript syntax checks

The repository retains its existing **Mozilla Public License 2.0**. Work is proposed on feature branches and pull requests, not merged automatically.

**Interface reference:** [Evolve Incremental](https://pmotschmann.github.io/Evolve/) inspires the compact, readable management layout. Its source, artwork, branding, and specific interface are not copied.
