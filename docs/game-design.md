# Game design — We Are Incremental

## One-sentence pitch

**Become the swarm that wears a civilization's bodies; consume each planet from within, then send a smarter and more specialized scout to the next world.**

## Player fantasy

You do not command an external invading army. You *are* a distributed species: one consciousness made from many hosts. Early play is intimate and precarious: on the first world, one virion exists inside a single carrier and must infect cells to replicate. The midgame transforms a hidden infection into an expanding social, biological, and industrial network. The late game turns the entire planet into a launch platform.

Progress should feel like a change in *what the player can do*, not solely an increase in production numbers. Later lineages can choose different kinds of scouts, hosts, subterfuge, planetary strategies, and launch payloads.

## The two interlocking loops

### Within a planet (the incremental run)

1. **Land.** The original scout is just one virion inside one carrier. In later generations, scouts may have different biological starting forms and directives.
2. **Replicate.** The virus passively enters cells, incubates, and produces more virions. Once the carrier is infectious, unlock transmission to other hosts. There is **no click-to-add-one** at either scale.
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
- **Opening:** exactly one free virion in a single carrier. It enters a susceptible cell automatically, incubates, and produces further virions. Finite local cells become infected or exhausted; additional counters are initially hidden. Once infectious, the player's first **skill-tree decision** becomes available: stealthier shedding or faster, more conspicuous spread. The choice has an immediate mechanical effect on passive transmission and vigilance.
- **Hosts:** the captured portion of a finite planetary population. Existing carriers spread automatically; there is no direct host-increment button.
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
5. **Emergent agency.** Begin with observation, not clicking. Give the player decisions only once the swarm has developed corresponding capabilities; never require repeated clicks to manufacture virions or hosts.
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

### Opening-stage revelation

The first seconds show **one virion and nothing else interactive**. A single infected cell is the first reveal, then passive replication. A carrier that becomes infectious reveals the first **evolution skill tree**. Completed cell-entry, replication, and infectious-carrier milestones form the trunk; the player selects between mutually exclusive transmission skills to begin spreading beyond the first host. The resource sidebar, planetary systems, tabs, objectives, and prestige controls are deliberately withheld until the transition. This reveal is not a timer-only cosmetic animation: a discrete within-carrier simulation drives it and survives save/reload/offline progress. Its biological figures are deliberately abstracted game tuning, not epidemiological claims.

## Skill tree as the progression language

Advancement should feel like biological evolution, not pressing a Continue button. A prerequisite-based, data-driven skill tree is the primary interaction pattern for new capabilities. Progression milestones can complete automatically when the swarm reaches them. Decision nodes should create genuine alternative strategies with downstream mechanical consequences. In WI-01, the first two branches are **Silent Shedding** (20% slower passive spread, 50% lower vigilance response) and **Viral Surge** (50% faster spread, 50% higher vigilance response). They are exclusive and local to the first planet; later-world inheritance and deeper tree branches remain future design work.

The existing planetary upgrade list is an interim prototype mechanism, not the long-term interaction model. Future milestones should migrate important biological progression to unlockable tree nodes and preserve the original incremental feel with automatic processes.

The spatial Evolution Tree presentation adapts the [Crystal Craft Study Tree](https://github.com/Wisteria-Psychological-Services/crystal-craft/blob/main/docs/design/study-tree-ui.md): rings and connected learned/available nodes lead to an inspector. A node click selects and reveals consequences, while Evolve is a distinct commitment. Pan, zoom, keyboard navigation, and list browsing do not trigger gameplay purchases.
