import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const html = await readFile(new URL("../index.html", import.meta.url), "utf8");
const js = await readFile(new URL("../src/main.js", import.meta.url), "utf8");

test("every literal UI element reference exists in the markup", () => {
  const ids = new Set([...html.matchAll(/\bid="([^"]+)"/g)].map(match => match[1]));
  const references = new Set([...js.matchAll(/element\("([^"]+)"\)/g)].map(match => match[1]));
  for (const id of references) assert.ok(ids.has(id), "Missing HTML element id: " + id);
});

test("the Evolve-inspired resource ledger stays outside tab panels", () => {
  const sidebar = html.indexOf('class="resources"');
  const firstTab = html.indexOf('id="tab-invasion"');
  const ledger = html.indexOf('id="host-count"');
  assert.ok(sidebar >= 0 && ledger > sidebar && ledger < firstTab);
  assert.match(html, /id="biomass-rate"/);
  assert.match(html, /id="spread-rate"/);
  assert.match(html, /id="resistance-label"/);
});

test("all functional tabs have labelled matching panels", () => {
  for (const name of ["invasion", "lineage", "intel"]) {
    assert.ok(html.includes('id="tab-' + name + '-button"'));
    assert.ok(html.includes('id="tab-' + name + '" role="tabpanel"'));
    assert.ok(html.includes('aria-labelledby="tab-' + name + '-button"'));
    assert.ok(html.includes('data-tab="' + name + '"'));
  }
  assert.match(js, /ArrowRight/);
  assert.match(js, /ArrowLeft/);
});

test("scout choice controls and all gameplay actions remain available", () => {
  for (const id of ["origin-screen", "origin-virions", "origin-skill-tree", "evolution-viewport", "evolution-nodes", "evolution-detail-title", "evolution-action", "upgrade-list", "build-launcher", "open-launch",
    "scout-form", "gene-choices", "directive-choices", "reset-game"]) {
    assert.ok(html.includes('id="' + id + '"'));
  }
});


test("first infection view is minimal and planetary controls remain hidden", () => {
  assert.match(html, /id="origin-screen"[^>]* hidden/);
  assert.match(html, /id="management-screen" hidden/);
  assert.match(html, /id="origin-virions"[^>]*>1<\/output>/);
  assert.match(html, /id="origin-virion-label">virion<\/h1>/);
  assert.match(html, /id="origin-cells"[^>]* hidden/);
  assert.match(html, /id="origin-skill-tree"[^>]* hidden/);
  assert.doesNotMatch(html, /id="origin-continue"/);
  assert.doesNotMatch(html, /Continue spreading/);
  assert.match(js, /createEvolutionTreeView/);
  assert.match(js, /canTransmit\(viral\)/);
  assert.doesNotMatch(html, /id="assimilate"/);
  assert.doesNotMatch(js, /act\(assimilate\)/);
  assert.match(js, /beginTransmission/);
  assert.match(js, /beginTransmission\(current, skillId\)/);
  assert.match(html, /id="intel-transmission-skill"/);
});


test("spatial skill tree separates graph selection from learning", () => {
  const markup = html.slice(html.indexOf('id="origin-skill-tree"'), html.indexOf('id="management-screen"'));
  assert.match(markup, /id="evolution-viewport"/);
  assert.match(markup, /id="evolution-edges"/);
  assert.match(markup, /id="evolution-detail-title"/);
  assert.match(markup, /id="evolution-action"[^>]* hidden/);
  assert.match(markup, /id="evolution-zoom-in"/);
  assert.match(markup, /id="evolution-zoom-out"/);
  assert.match(markup, /id="evolution-fit"/);
  assert.match(markup, /id="evolution-center"/);
  assert.match(markup, /id="evolution-browse"/);
  assert.match(markup, /id="evolution-node-list"/);
});


test("skill tree sits alongside the virus resource panel without surrounding copy", () => {
  const opening = html.slice(html.indexOf('<main id="origin-screen"'), html.indexOf('id="management-screen"'));
  const resourceStart = opening.indexOf('class="origin-resource-panel"');
  const treeStart = opening.indexOf('id="origin-skill-tree"');
  assert.ok(resourceStart >= 0 && treeStart > resourceStart);
  assert.match(opening, /class="origin-layout"/);
  assert.match(opening, /id="origin-virion-resource"/);
  assert.match(opening, /id="evolution-inspector"[^>]* hidden/);
  for (const removed of [
    "Infected cells are producing new virions.",
    "The virus has entered a cell.",
    "One carrier. Two paths.",
    "Selection never purchases.",
    'id="origin-message"',
    'id="origin-skill-title"',
    'class="evolution-heading"',
    "Select an adaptation",
    "Inspect a skill before evolving."
  ]) assert.ok(!opening.includes(removed), removed + " must not appear on the screen");
});

test("all resource rows have focusable production/consumption explanations", () => {
  for (const id of ["hosts", "biomass", "vigilance", "worlds", "genes"]) {
    assert.match(html, new RegExp('data-resource="' + id + '"[^>]*tabindex="0"'));
    assert.match(html, new RegExp('id="resource-' + id + '-help"'));
  }
  assert.match(html, /id="origin-virion-resource"[^>]*tabindex="0"[^>]*aria-describedby="origin-virion-help"/);
  assert.match(html, /id="origin-cells"[^>]*tabindex="0"[^>]*aria-describedby="origin-cells-help"/);
  assert.match(js, /viralResourceFlows\(viral\)/);
  assert.match(js, /dataset\.tooltip = text/);
  assert.match(js, /planetaryResourceTooltips\(stats\)/);
});

test("tree panels are visually transparent and borderless", async () => {
  const css = await readFile(new URL("../src/styles.css", import.meta.url), "utf8");
  const workspace = css.match(/\.evolution-workspace\s*\{([^}]+)\}/)?.[1] || "";
  const viewport = css.match(/\.evolution-viewport\s*\{([^}]+)\}/)?.[1] || "";
  const inspector = css.match(/\.evolution-inspector\s*\{([^}]+)\}/)?.[1] || "";
  for (const [name, rules] of [["workspace", workspace], ["viewport", viewport], ["inspector", inspector]]) {
    assert.match(rules, /background:\s*transparent/, name);
  }
  assert.match(workspace, /border:\s*0/, "tree workspace should have no border");
  assert.match(inspector, /border:\s*0/, "tree inspector should have no border");
  assert.match(css, /\.origin-screen\.has-tree\s+\.origin-layout[\s\S]*?grid-template-columns:\s*minmax\(200px,\s*245px\)\s+minmax\(0,\s*1fr\)/);
  assert.match(css, /\.origin-resource:where\(:hover,:focus-visible\)::after/);
});
