import test from "node:test";
import assert from "node:assert/strict";
import {
  advance, assimilate, availableDirectives, availableGenes, buildLauncher, buyUpgrade,
  canLaunch, createGame, getPlanet, getStats, launcherCost, launchScout, takeover, upgradeCost
} from "../src/game.js";
import { restore } from "../src/storage.js";

test("first world begins with one host, no biomass, and a larger population", () => {
  const state = createGame(1000);
  assert.equal(state.hosts, 1);
  assert.equal(state.biomass, 0);
  assert.ok(getPlanet(state).population > 1000);
});

test("assimilation produces hosts and biomass without exceeding planet population", () => {
  let state = createGame();
  state = assimilate(state);
  assert.equal(state.hosts, 2);
  assert.ok(state.biomass > 0);
  state.hosts = getPlanet(state).population;
  assert.equal(assimilate(state).hosts, state.hosts);
});

test("passive simulation grows even with no clicks and never exceeds planet population", () => {
  const state = createGame();
  const next = advance(state, 1800);
  assert.ok(next.hosts > state.hosts);
  assert.ok(next.biomass > 0);
  assert.ok(next.hosts <= getPlanet(state).population);
  assert.equal(state.hosts, 1, "simulation must not mutate its input");
});

test("purchasing an upgrade spends biomass and increases output", () => {
  const state = createGame();
  state.biomass = 100;
  const price = upgradeCost(state, "vectors");
  const next = buyUpgrade(state, "vectors");
  assert.equal(next.biomass, 100 - price);
  assert.equal(next.upgrades.vectors, 1);
  assert.ok(getStats(next).spreadPerSecond > getStats(state).spreadPerSecond);
});

test("launcher is gated on conquest and its resource cost", () => {
  const state = createGame();
  state.biomass = 10000;
  assert.equal(buildLauncher(state).launcherBuilt, false);
  state.hosts = Math.ceil(getPlanet(state).population * 0.7);
  state.biomass = launcherCost(state);
  const built = buildLauncher(state);
  assert.equal(built.launcherBuilt, true);
  assert.equal(built.biomass, 0);
  assert.equal(canLaunch(built), false);
});

test("a launch preserves genome, changes planet and applies a selected scout directive", () => {
  const state = createGame(1000);
  state.hosts = getPlanet(state).population;
  state.launcherBuilt = true;
  const next = launchScout(state, "whisper", "seedfall", 2000);
  assert.equal(next.planetIndex, 1);
  assert.equal(next.lineage.worlds, 1);
  assert.equal(next.lineage.genes.whisper, 1);
  assert.equal(next.hosts, 13);
  assert.equal(next.biomass, 0);
  assert.equal(next.launcherBuilt, false);
  assert.equal(next.updatedAt, 2000);
});

test("further evolution and scout options become available after later worlds", () => {
  const state = createGame();
  assert.ok(!availableGenes(state).some(gene => gene.id === "mimic"));
  assert.ok(!availableDirectives(state).some(item => item.id === "siege"));
  state.lineage.worlds = 3;
  assert.ok(availableGenes(state).some(gene => gene.id === "archive"));
  assert.ok(availableDirectives(state).some(item => item.id === "siege"));
});

test("invalid prestige choices cannot bypass prerequisites", () => {
  const state = createGame();
  state.hosts = getPlanet(state).population;
  state.launcherBuilt = true;
  assert.equal(launchScout(state, "archive", "siege"), state);
});

test("offline advancement has a six-hour cap", () => {
  const state = createGame(1000);
  const result = restore(JSON.stringify(state), 1000 + 24 * 60 * 60 * 1000);
  assert.equal(result.offlineSeconds, 6 * 60 * 60);
  assert.equal(result.state.updatedAt, 1000 + 24 * 60 * 60 * 1000);
  assert.ok(result.state.hosts <= getPlanet(state).population);
});

test("malformed saved data recovers to a fresh game", () => {
  const result = restore('{"version":1,"hosts":"oops"}', 7000);
  assert.equal(result.recovered, true);
  assert.equal(result.state.hosts, 1);
  assert.equal(result.state.updatedAt, 7000);
});

test("planet takeover is capped at 100 percent", () => {
  const state = createGame();
  state.hosts = getPlanet(state).population * 2;
  assert.equal(takeover(state), 1);
});
