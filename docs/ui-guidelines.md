# UI design authority — Evolve-inspired incremental controls

**Reference:** [Evolve Incremental](https://pmotschmann.github.io/Evolve/) by pmotschmann / Demagorddon.

The project's user-selected UI inspiration is Evolve's **information-dense, text-first incremental management interface**, not a cinematic planet dashboard. This is a design reference for interaction and information hierarchy, **not a request to copy Evolve's source, branding, screenshots, art, copy, or exact styling**.

## Layout principles

1. **Progressively revealed resource ledger.** On first load, show **only one virion** in a nearly empty view; keep other systems hidden until infectious transmission unlocks them. Once planetary gameplay begins, keep hosts, capacity, recruitment rate, biomass, production rate, vigilance, and lineage progression visible during navigation. Put numerical stock and per-second rates in aligned columns.
2. **Compact, actionable workspace.** Use small grouped sections and obvious buttons with costs, levels, and disabled/available states. Prioritize buying, deploying, and evolving over decorative art.
3. **Top-level systems navigation.** Tabs provide access to the current invasion, lineage evolution, and planet intelligence while resources remain visible; keyboard users can switch tabs with arrow keys.
4. **Separate objectives and feedback.** Surface the next strategic gates and recent significant actions alongside the workspace. Don't bury important progression in modal dialogs.
5. **Progressive complexity.** Reveal meaningful new systems as the swarm develops. A future phase may add sub-tabs for brood roles, host castes, planetary defenses, research, and scouting without overcrowding the first screen.
6. **Hover/focus explanations instead of visible prose.** Keep resource names, numbers, and essential action labels visible; explain what a resource produces, what consumes it, and approximate rates via mouse-hover and keyboard-focus tooltips. Purchases must still reveal effects and costs before commitment through deliberate inspection, not hover alone. No extra helper sentences by default.
7. **Small visual footprint.** Prefer readable lists, row labels, subtle status color, and consistent spacing over a giant planet illustration, oversized counters, or gradient-heavy cards. Biological character should come from language and restrained accent colors.
8. **Responsive by reflow, not lost controls.** Stack the always-visible ledger, workspace, and events on narrow screens. Preserve all actions, context, and keyboard interactions.
9. **Accessibility.** Keep clear focus indicators, semantic tabs, live-value labels, adequate contrast, and reduced-motion support; do not make status depend solely on color.
10. **Performance and reliability.** Real-time values should update efficiently without stealing focus or recreating interactive controls; game state stays independent of layout.

## Implementation choices for WI-01

- Initial virus stage: one centered **virion** count, without menus, instructions, headers, labels beyond resource identity, upgrades, tabs, or other visible prose. Show an infected-cell number only after infection begins. When infectious, display the evolution tree **right of the virion resource panel** on desktop and below it on narrow screens; reveal no extra heading or explanatory paragraph. There must be no Continue button.
- After the infectious-carrier milestone, display a **spatial skill tree** adapting [Crystal Craft's Study Tree](https://github.com/Wisteria-Psychological-Services/crystal-craft/blob/main/docs/design/study-tree-ui.md): quiet radial guide rings, authored nodes and perimeter-truncated edges, selected-node inspector, status rims, pan/zoom/fit/center controls, arrow-key navigation, and an accessible list of nodes. Cellular milestones form the learned trunk; exclusive transmission nodes branch from it. Selecting only inspects. The separate Evolve action commits the choice and opens planetary management; there is no generic Continue button.
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

## Evolution Tree adaptation from Crystal Craft

**Inspected source:** Crystal Craft main branch at Wisteria-Psychological-Services/crystal-craft/src/components/study-tree/ (StudyTree.vue, StudyTreeNode.vue, StudyNodeDetail.vue, studyTreeLayout.ts, studyTreeAdapter.ts) and docs/design/study-tree-ui.md.

- Stable polar node geometry and SVG links terminate at the actual node rim; quiet rings sit behind the real graph.
- Learned (brass-like rim), available (bright steel), locked (dashed muted), selection (separate white outline), and keyboard focus (separate warm outline) have both visual and text indications.
- Selection by click/keyboard never commits a skill; an enabled **Evolve** button in the inspector is the only commit command.
- Drag empty canvas to pan, use wheel/pinch or toolbar to zoom, Fit to frame the graph, Center to return to Origin; browse nodes through an accessible alternative list. Node positions never change based on simulation time.
- Camera fits once when the viewport becomes measurable; learning and periodic updates must not unexpectedly recenter the graph. Narrow screens put the scrollable inspector beneath the canvas.
- The source uses Vue Flow, Vue and Quasar plus workshop art. This project ports the **interaction model and geometry** into dependency-free DOM/SVG, not Crystal Craft-specific assets or the framework.

## Minimal-copy layout policy (owner direction, Nov 2026)

- **Default to no added text.** Never create ornamental headings, status sentences, second-line instructions, narrative feedback, or explanatory paragraphs merely to fill available space. Show short names, counts, node labels and essential action names only.
- **First-generation composition:** before an infectious carrier, center the virion resource alone and reveal infected cells only when real. After infection matures, use a two-column arrangement: a narrow virus resource panel on the left and a substantially larger spatial skill-tree panel on the right. Stack only when the viewport is narrow.
- **No panel chrome:** tree workspace, graph backdrop, and inspector inherit the page background without colored fills or enclosing borders. Node rims still encode progress and selection states.
- **Resource economics on demand:** hover or focus on virions, infected cells, hosts, biomass, vigilance and permanent resources displays sources, outputs, and consumption. Use actual model-derived rates where meaningful; disclose non-rate spenders as such.
- **Inspect to reveal:** tree nodes expose more details on hover/focus; selecting opens the optional inspector, and only an explicit Evolve action changes state. The inspector starts hidden with no placeholder text. Essential pre-commit effects may be shown when a node is intentionally selected.
- Preserve keyboard focus, readable tooltips, screen-reader descriptions, and accessible alternatives so minimal visible copy does not conceal functionality.
