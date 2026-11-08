# We Are Incremental

**One scout. One borrowed body. Eventually, every world is you.**

A browser-based incremental game about playing a swarming body-snatcher species. Assimilate a planet's population, grow a living launch organism, and fire a scout toward the next world. Every successful invasion is a **prestige cycle**: evolve the collective permanently and choose how the next invasion begins.

## Play the prototype

Requirements: Node.js 20 or later. No dependencies to install.

1. Run **npm run dev**.
2. Open http://127.0.0.1:5173.
3. Assimilate hosts, buy planetary upgrades, grow a launcher at 70% control, and launch at 95% control.
4. Choose **one permanent gene** and **one next-world scout directive**. Repeat.

Progress is saved automatically in browser local storage, including up to six hours of offline progress. Use **Erase save** to restart.

## What is here

This first vertical slice proves the complete loop: **infect → spread → take over → build → launch → evolve**. It includes four planetary archetypes in rotation, local upgrades, a simple vigilance modifier, persistent evolution, scout directives, and a responsive single-page interface.

This is an early systems prototype, not a content-complete game. Planet politics, competing defenses, host abilities, alternative victory paths, balance, and endgame progression remain intentionally open for development.

## Project references

- [Game design](docs/game-design.md) — fantasy, systems, prestige model, design principles
- [Architecture](docs/architecture.md) — implementation boundaries, saved-game rules, test approach
- [Decisions](docs/decisions.md) — what the brief fixes versus what is provisional
- [Milestones](docs/milestones/WI-01-foundation.md) — four outcome-based implementation stages, one file per milestone

## Development

- **npm run dev** — local development server
- **npm test** — simulation and save regression tests (built-in Node test runner)
- **npm run check** — JavaScript syntax checks

The repository retains its existing **Mozilla Public License 2.0**. Work is proposed on feature branches and pull requests, not merged automatically.
