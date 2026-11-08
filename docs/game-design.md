# Game design — We Are Incremental

## One-sentence pitch

**Become the swarm that wears a civilization's bodies; consume each planet from within, then send a smarter and more specialized scout to the next world.**

## Player fantasy

You do not command an external invading army. You *are* a distributed species: one consciousness made from many hosts. Early play is intimate and precarious: a single scout must take a first body. The midgame transforms a hidden infection into an expanding social, biological, and industrial network. The late game turns the entire planet into a launch platform.

Progress should feel like a change in *what the player can do*, not solely an increase in production numbers. Later lineages can choose different kinds of scouts, hosts, subterfuge, planetary strategies, and launch payloads.

## The two interlocking loops

### Within a planet (the incremental run)

1. **Land.** One scout arrives on a planet with local conditions, a population, and defenses. Any scout directive chosen at the prior launch modifies the opening.
2. **Assimilate.** Convert initial hosts manually; gain biomass and the first tools of concealment and replication.
3. **Spread.** A living network converts additional hosts passively. Spend biomass on faster conversion, stronger extraction, or better disguise.
4. **Overtake.** As the network grows, planetary resistance should create decisions rather than simply slowing an exponential curve. The final stages move from covert control toward open planetary domination.
5. **Grow the launcher.** Convert planetary resources into an organism capable of firing a new scout into space. A conquered world is the price of interstellar propagation.
6. **Launch.** Leave the planet, permanently strengthen the lineage, and select how the next infiltration begins.

### Across planets (prestige)

Each launched scout:
- starts a **new planet run**: local hosts, biomass, alert state, local upgrades, and launch infrastructure reset;
- contributes to **permanent evolution**: one lineage gene is upgraded;
- takes a **scout directive**: a deliberately chosen opening strategy affecting the next planet only;
- increases the scope of available choices over time, including new genes, scouts, host classes, worlds, and later strategic systems.

Prestige is therefore simultaneously **power gain**, **new capabilities**, and **agency over the next run**. It should never feel like an automatic reset performed only to increase a multiplier.

## Three forms of progression

| Layer | Examples | Persistence |
| --- | --- | --- |
| Local infection | Assimilated hosts, biomass, passive spread, disguise, launch organ | Resets on launch |
| Scout loadout | Mass seedfall, carried biomass, deep-cover infiltration, siege organism | Selected for one next run |
| Lineage evolution | Hive resonance, inherited starting hosts, digestion, mimetic memory, new abilities | Carries across all worlds |

Future systems can add specialized host castes, biosphere adaptations, local faction control, alternate routes to planetary dominance, and a galactic map without changing the central prestige principle.

## First playable slice (WI-01)

The implementation deliberately uses an approachable model:
- **Hosts:** the captured portion of a finite planetary population. A manual assimilation action captures additional hosts; existing hosts also recruit automatically.
- **Biomass:** locally generated resource. Spend it to improve capture, passive conversion, biomass production, or disguise.
- **Vigilance:** a simplified measure of planetary response. It grows when hosts are captured and reduces growth; disguise counters it. This is friction, not an irreversible failure state.
- **Launcher:** becomes buildable at 70% population control after paying a biomass cost. A scout can launch at 95% control once the launcher exists.
- **Evolution:** each launch grants one permanent gene rank. Three genes are available from the start, with additional gene choices unlocked after 1, 2, and 3 conquered worlds.
- **Directive:** each launch also selects one opening modifier for the following planet. New directives unlock as the lineage expands.
- **Worlds:** four authored planet descriptions cycle with increasing population and vigilance. They are placeholders for genuinely different world mechanics later.
- **Persistence:** local browser saves and at most six hours of offline simulation.

Exact thresholds, costs, rates, names, numbers of worlds, and trait effects are **prototype tuning parameters**, not permanent design commitments.

## Design principles

1. **From one body to a world.** Every run must visibly advance from a fragile infiltrator to collective planetary control.
2. **A prestige choice must matter.** Favor different openings and strategies over small, indistinguishable multipliers.
3. **New options at increasing scale.** Important unlocks should introduce mechanics and strategic alternatives, not endless copies of early upgrades.
4. **Resistance creates decisions, not softlocks.** Planet defenses should offer counterplay, tradeoffs, and recoverable setbacks. Avoid a run that cannot progress.
5. **Fast feedback, deeper long-run planning.** Early clicks should immediately accomplish something; investment and automation gradually displace repetitive clicking.
6. **Readable at a glance.** Show present control, growth, threat, resources, and next target together. Keep secondary histories and explanations out of the main loop.
7. **Build for replayability.** Variable planets and evolving build options should reward making different invasion plans over time.
8. **Treat idle time respectfully.** Progress may happen while away, within explicit limits and without demanding constant attendance.

## Development directions after the prototype

**Planet depth:** factions, sentries, governments, research institutions, countermeasures, biosphere hazards, and staged conflict. The player can infiltrate institutions, spread quietly, or switch to overt conquest.

**Swarm biology:** host-derived traits, specialized body types and brood organs, mutation combinations, a biomass economy with real tradeoffs, and controlled growth rather than one universal best upgrade.

**Interplanetary strategy:** earned scout capabilities, launch payload constraints, destination selection, persistent lineage branching, milestones that unlock new controls, and long-range goals beyond a single planet.

**Enduring content:** varied procedural and authored planets, story fragments, escalating opposing forces, clear victory feedback, carefully tuned pacing, accessibility, and migration-safe saves.

## Success criteria

A player should understand the premise in under a minute, finish a first invasion without needing a guide, and be excited for a second run because **their next scout starts differently and their collective has learned something durable**. Subsequent worlds should surface new meaningful decisions at regular intervals.

## Interface direction

Use [Evolve Incremental](https://pmotschmann.github.io/Evolve/) as the reference for a compact, text-led management interface. Keep resource stocks, capacities, and production rates persistent while systems live in tabbed, actionable sections. Minimize decorative visuals; prioritize clear costs, disabled states, and progressive reveal. The specific UI requirements and originality boundary are centralized in [UI guidelines](ui-guidelines.md).
