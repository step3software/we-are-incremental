# UI design authority — Evolve-inspired incremental controls

**Reference:** [Evolve Incremental](https://pmotschmann.github.io/Evolve/) by pmotschmann / Demagorddon.

The project's user-selected UI inspiration is Evolve's **information-dense, text-first incremental management interface**, not a cinematic planet dashboard. This is a design reference for interaction and information hierarchy, **not a request to copy Evolve's source, branding, screenshots, art, copy, or exact styling**.

## Layout principles

1. **Progressively revealed resource ledger.** On first load, show **only one virion** in a nearly empty view; keep other systems hidden until infectious transmission unlocks them. Once planetary gameplay begins, keep hosts, capacity, recruitment rate, biomass, production rate, vigilance, and lineage progression visible during navigation. Put numerical stock and per-second rates in aligned columns.
2. **Compact, actionable workspace.** Use small grouped sections and obvious buttons with costs, levels, and disabled/available states. Prioritize buying, deploying, and evolving over decorative art.
3. **Top-level systems navigation.** Tabs provide access to the current invasion, lineage evolution, and planet intelligence while resources remain visible; keyboard users can switch tabs with arrow keys.
4. **Separate objectives and feedback.** Surface the next strategic gates and recent significant actions alongside the workspace. Don't bury important progression in modal dialogs.
5. **Progressive complexity.** Reveal meaningful new systems as the swarm develops. A future phase may add sub-tabs for brood roles, host castes, planetary defenses, research, and scouting without overcrowding the first screen.
6. **Useful tooltips or concise descriptions.** Every purchase should explain its effect, cost, rank and availability. Future bulk-buy functionality should clearly report what it buys; never hide costs behind hover-only UI.
7. **Small visual footprint.** Prefer readable lists, row labels, subtle status color, and consistent spacing over a giant planet illustration, oversized counters, or gradient-heavy cards. Biological character should come from language and restrained accent colors.
8. **Responsive by reflow, not lost controls.** Stack the always-visible ledger, workspace, and events on narrow screens. Preserve all actions, context, and keyboard interactions.
9. **Accessibility.** Keep clear focus indicators, semantic tabs, live-value labels, adequate contrast, and reduced-motion support; do not make status depend solely on color.
10. **Performance and reliability.** Real-time values should update efficiently without stealing focus or recreating interactive controls; game state stays independent of layout.

## Implementation choices for WI-01

- Initial virus stage: one centrally aligned **virion** count, no planetary panel, menus, buttons, upgrades, tabs, or resource bars. Infected-cell information appears only after the first cell is infected; the first actionable controls are **transmission skill nodes** revealed only when the carrier is infectious. There must be no separate Continue button.
- After the infectious-carrier milestone, display a minimal branching skill tree: completed cellular milestones lead to two exclusive transmission adaptations, each with distinct consequences. Selecting one opens the later management interface; there is no generic transition button.
- After selecting a transmission adaptation, three-column layout at desktop width: **Resources | Game Systems | Objectives/Activity**.
- Dark neutral background with modest green biological accents, but not Evolve's specific theme.
- Tabs for **Invasion**, **Lineage**, and **Planet Intel**; no pseudo-tabs that don't change content.
- Compact resource rows show current/cap and production rate; a single slim bar conveys planetary control.
- Invasion tab groups passive transmission, local prototype upgrades, and scout launch controls. Future replacement of stand-alone upgrades with evolutionary nodes belongs to later milestones.
- Lineage tab previews durable genes, locked choices, and directives, giving prestige an understandable context.
- Planet Intel tab offers compact facts about progression and vigilance.
- Right column summarizes launch prerequisites and recent meaningful actions.
- No gameplay balance or progression rules should change merely to achieve the UI redesign.

## Future constraints

Follow Evolve's strengths—many useful choices in little space and numbers that explain themselves—while improving discoverability, touch usability, and accessible navigation. Do not imitate Evolve so closely that players mistake the game for a fork or adaptation. All visual assets and text must be original.
