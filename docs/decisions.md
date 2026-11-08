# Decisions and working assumptions

## Established premise (from owner brief)

- The player controls a **swarming body-snatcher species**, not a conventional human empire.
- The game is an **incremental game** about gradually conquering planets.
- Conquering a planet permits the construction and launch of another **scout**.
- The next planet is a **prestige run** whose opening can be shaped by the player.
- Power, abilities, and options **expand over successive planets**.
- **First generation starts with exactly one virion inside one carrier.** Replication requires infection of cells, and spread is gradual and autonomous; no click-to-add-one.
- **Opening UI is extremely minimal.** Initially, only the single virion is visible. Other resources and game controls remain hidden until earned by progression.

## Provisional choices for the first implementation

These choices make the prototype playable and do not claim final design approval:
- Browser-based single-player game; zero-dependency HTML/CSS/JavaScript.
- Four placeholder planetary archetypes; numerical rather than faction-based resistance.
- Hosts, biomass, vigilance, and four repeatable local upgrades.
- Build the launcher at 70% control; launch at 95%.
- One permanent gene rank and one next-run directive per launch.
- LocalStorage autosave, capped six-hour offline progress, no account or backend.
- Biopunk science-fiction presentation with simple CSS visual art.

## To decide during later design work

1. **Scale and tone:** grounded horror, dark comedy, cosmic strategy, or a blend.
2. **Planet gameplay:** static growth with pressure versus distinct strategic phases and active opposing factions.
3. **Prestige depth:** single scout versus selectable scout classes, payload budgets, host carryover, multiple destinations, and lineage branching.
4. **Endgame:** galactic takeover, adversarial civilizations, rival swarms, ascension, or an open-ended sandbox.
5. **World generation:** authored worlds, procedural variation, and rarity of exceptional planets.
6. **Pacing:** ideal time to first prestige, active/idle balance, offline caps, and target length of later runs.
7. **Technical evolution:** large-number model, save migrations, game engine/framework, hosting, and optional cloud saves.

Keep uncertain design choices documented here until tested or explicitly decided; do not allow a quick prototype implementation to become an accidental permanent rule.

## Opening-stage implementation decisions (provisional parameters)

- The first carrier contains a simplified, finite cell pool. A free virion attaches to a cell, becomes latent, and only later yields new virions via productive cells. Virions are consumed by successful infections and cleared over time; infected cells can become exhausted.
- An infectious viral load and infected-cell threshold unlock **Continue spreading**. This is a transition to a new scale of gameplay, not a button that adds virions or carriers.
- Existing planetary simulation, upgrades and prestige remain available after this transition. Later-world scout openings currently skip the one-virion tutorial; scout biology itself is a future design decision.
- Exact replication, latency, clearance, and transmission thresholds are fictionalized balance constants, not biological facts.
