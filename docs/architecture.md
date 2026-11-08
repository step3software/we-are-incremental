# Architecture and technical boundaries

## Starter architecture

The prototype is a zero-dependency browser app running on JavaScript ES modules, with Node.js 20+ for development and tests. This avoids framework commitments before the incremental loop is validated.

| File | Responsibility |
| --- | --- |
| index.html | Static structure, labels, controls, launch dialog |
| src/styles.css | Responsive presentation and reduced-motion support |
| src/game.js | Pure simulation, phase gating, upgrade/world/trait definitions, progression and prestige |
| src/viral.js | Deterministic within-carrier replication; latency, cell availability and virion production |
| src/storage.js | Versioned save/restore with validation and capped offline progress |
| src/main.js | Browser wiring, rendering, user input and periodic save |
| scripts/serve.mjs | Allowlisted local-only static development server |
| test/game.test.js | Node built-in regression tests |

## State invariants

- New games start with exactly one virion, no infected cells, and one carrier. Viral particles consume a susceptible cell to infect it, incubate before producing new particles, and spread without player clicks.
- The minimal viral stage and the advanced planetary stage are mutually exclusive views; planetary actions cannot be used before transmission unlocks.
- Planet population is finite; assimilated hosts may never exceed the local population through normal gameplay.
- Planet-local state resets upon launch: hosts, biomass, vigilance, upgrades, and launch structure.
- Only lineage genes and the conquered-world count persist across launches.
- A directive modifies the *next* planet and is chosen again on every launch.
- A launch requires both the population-control threshold and a built launcher.
- Illegal upgrades, invalid launches, and insufficient resources make no state change.
- Pure game functions do not touch the DOM, local storage, or network; time is an explicit argument when needed.

## Persistence

The current save format is version 2 in localStorage under we-are-incremental:v2. Older version-1 saves are migrated to the existing planetary stage without discarding progress. New games open in the viral stage; the existing planetary screen stays hidden until the first carrier has become infectious and the player continues. Saves have an updatedAt timestamp, integer upgrade ranks, a planetary index and a lineage ledger. Malformed or incompatible saves are rejected rather than reinterpreted. Offline progress uses the same deterministic function as active play and is capped at six hours.

Before shipping, add explicit schema migrations, export/import, storage diagnostics, precision handling for very large numbers, and testing of old save fixtures. Changing saved-game field semantics requires deliberate migration work.

## Development and release

- **npm run dev** starts an allowlisted server bound to 127.0.0.1.
- **npm run check** checks JavaScript syntax.
- **npm test** exercises pure simulation and save recovery.
- The GitHub workflow uses a Windows runner; it doesn't depend on Linux or paid services.
- A static host could serve the app later; publishing is intentionally outside this initial foundation.

## Future scalability

Move to a component framework or TypeScript when expanding UI/state complexity justifies the cost. Before extremely large populations and growth rates, adopt a deliberate large-number representation and formatter; standard JavaScript floating-point numbers are sufficient only for early gameplay. Simulation speed, prestige balancing, and offline integration will need scale tests as the game grows.
