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
  for (const id of ["assimilate", "upgrade-list", "build-launcher", "open-launch",
    "scout-form", "gene-choices", "directive-choices", "reset-game"]) {
    assert.ok(html.includes('id="' + id + '"'));
  }
});
