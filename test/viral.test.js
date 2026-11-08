import test from "node:test";
import assert from "node:assert/strict";
import {
  VIRAL_CELLS, VIRAL_LATENCY_SECONDS, advanceViral, canTransmit,
  createViralState, healthyCells, infectedCells, viralResourceFlows, validViralState
} from "../src/viral.js";
import { advance, beginTransmission, createGame, getStats } from "../src/game.js";
import { restore } from "../src/storage.js";

test("first generation begins with exactly one free virion inside one carrier", () => {
  const game = createGame(1000);
  assert.equal(game.stage, "viral");
  assert.equal(game.hosts, 1);
  assert.equal(game.viral.virions, 1);
  assert.equal(infectedCells(game.viral), 0);
  assert.equal(healthyCells(game.viral), VIRAL_CELLS);
  assert.equal(game.viral.latent.length, VIRAL_LATENCY_SECONDS);
});

test("initial virion infects a cell without any player action", () => {
  const game = advance(createGame(), 7);
  assert.equal(game.stage, "viral");
  assert.equal(game.viral.virions, 0);
  assert.equal(infectedCells(game.viral), 1);
  assert.equal(game.viral.producingCells, 0);
});

test("the cell incubates before producing new free virions", () => {
  const entered = advanceViral(createViralState(), 7);
  const waiting = advanceViral(entered, 8);
  assert.equal(waiting.virions, 0);
  assert.equal(waiting.producingCells, 0);
  const replicating = advanceViral(waiting, 2);
  assert.equal(replicating.producingCells, 1);
  assert.ok(replicating.virions > 0);
});

test("virus expands autonomously to an infectious carrier", () => {
  const game = advance(createGame(), 240);
  assert.equal(game.stage, "viral", "player should not be forced out of minimal opening");
  assert.ok(canTransmit(game.viral));
  assert.ok(game.viral.virions >= 400);
  assert.ok(infectedCells(game.viral) >= 40);
  assert.equal(game.hosts, 1, "viral replication alone cannot create another carrier");
});

test("viral states conserve the finite cell pool", () => {
  const original = createViralState();
  const simulated = advanceViral(original, 1000);
  assert.ok(healthyCells(simulated) >= 0);
  assert.ok(infectedCells(simulated) + simulated.exhaustedCells <= VIRAL_CELLS);
  assert.ok(validViralState(simulated));
  assert.equal(original.virions, 1, "simulation must not mutate its input");
});

test("the model is deterministic across multiple timer increments", () => {
  const original = createViralState();
  const once = advanceViral(original, 90.25);
  let chunks = original;
  for (let i = 0; i < 361; i++) chunks = advanceViral(chunks, 0.25);
  assert.deepEqual(once, chunks);
});

test("transmission requires a mature carrier and a valid skill tree branch", () => {
  const game = createGame();
  assert.equal(beginTransmission(game, "covert"), game);
  const ready = advance(game, 240);
  assert.equal(beginTransmission(ready), ready, "no generic continue action");
  assert.equal(beginTransmission(ready, "unknown"), ready);
  const next = beginTransmission(ready, "covert");
  assert.equal(next.stage, "planetary");
  assert.equal(next.viral, null);
  assert.equal(next.transmissionSkill, "covert");
  assert.equal(next.hosts, 1);
  assert.equal(next.biomass, 0);
});

test("a viral save resumes capped offline replication", () => {
  const game = createGame(1000);
  const loaded = restore(JSON.stringify(game), 1000 + 24 * 60 * 60 * 1000);
  assert.equal(loaded.offlineSeconds, 6 * 60 * 60);
  assert.equal(loaded.state.stage, "viral");
  assert.ok(canTransmit(loaded.state.viral));
  assert.ok(validViralState(loaded.state.viral));
  assert.equal(loaded.state.updatedAt, 1000 + 24 * 60 * 60 * 1000);
});

test("old version-1 saves migrate to the planetary stage without losing progress", () => {
  const old = createGame(1000, 1);
  const legacy = { ...old, version: 1 };
  delete legacy.stage;
  delete legacy.viral;
  const loaded = restore(JSON.stringify(legacy), 2000);
  assert.equal(loaded.recovered, false);
  assert.equal(loaded.migrated, true);
  assert.equal(loaded.state.version, 3);
  assert.equal(loaded.state.transmissionSkill, null);
  assert.equal(loaded.state.stage, "planetary");
  assert.equal(loaded.state.planetIndex, 1);
});

test("invalid or impossible viral saves recover rather than corrupting the simulation", () => {
  const bad = createGame(1000);
  bad.viral.producingCells = VIRAL_CELLS * 3;
  const loaded = restore(JSON.stringify(bad), 2000);
  assert.equal(loaded.recovered, true);
  assert.equal(loaded.state.viral.virions, 1);
});

test("fractional and negative elapsed time are safe", () => {
  const state = createViralState();
  assert.deepEqual(advanceViral(state, -5), state);
  const part = advanceViral(state, 0.8);
  assert.equal(part.virions, 1);
  assert.equal(part.remainder, 0.8);
  const full = advanceViral(part, 0.2);
  assert.equal(full.remainder, 0);
  assert.equal(full.virions, 1);
});


test("transmission branches produce meaningful alternative planetary strategies", () => {
  const infectious = advance(createGame(), 240);
  const covert = beginTransmission(infectious, "covert");
  const surge = beginTransmission(infectious, "surge");
  const statsCovert = getStats(covert);
  const statsSurge = getStats(surge);
  assert.ok(statsCovert.spreadPerSecond < statsSurge.spreadPerSecond);
  assert.ok(statsCovert.vigilanceMultiplier < statsSurge.vigilanceMultiplier);
  const exposedCovert = advance(covert, 90);
  const exposedSurge = advance(surge, 90);
  assert.ok(exposedCovert.hosts < exposedSurge.hosts);
  assert.ok(exposedCovert.vigilance < exposedSurge.vigilance);
  assert.equal(covert.transmissionSkill, "covert");
  assert.equal(surge.transmissionSkill, "surge");
});

test("existing version 2 viral saves migrate with the skill tree still available", () => {
  const existing = advance(createGame(1000), 240);
  const v2 = { ...existing, version: 2 };
  delete v2.transmissionSkill;
  const loaded = restore(JSON.stringify(v2), 1000 + 241000);
  assert.equal(loaded.migrated, true);
  assert.equal(loaded.state.stage, "viral");
  assert.equal(loaded.state.transmissionSkill, null);
  assert.ok(canTransmit(loaded.state.viral));
  assert.equal(beginTransmission(loaded.state, "surge").stage, "planetary");
});

test("skill choice persists in the new save and is reset on the next world", () => {
  const infectious = advance(createGame(1000), 240);
  const chosen = beginTransmission(infectious, "surge");
  const restored = restore(JSON.stringify(chosen), 1000 + 241000);
  assert.equal(restored.recovered, false);
  assert.equal(restored.state.transmissionSkill, "surge");
  const nextWorld = createGame(1000, 1, { worlds: 1, genes: {} });
  assert.equal(nextWorld.transmissionSkill, null);
});

test("tampered saved transmission skills are rejected", () => {
  const bad = beginTransmission(advance(createGame(), 240), "covert");
  bad.transmissionSkill = "unknown";
  assert.equal(restore(JSON.stringify(bad)).recovered, true);
});


test("viral resource production and consumption rates are derived without mutating state", () => {
  const original = createViralState();
  const initial = viralResourceFlows(original);
  assert.ok(initial.cellInfections > 0 && initial.cellInfections < 1);
  assert.equal(initial.virionProduction, 0);
  assert.ok(initial.virionClearance > 0);
  assert.equal(initial.cellExhaustion, 0);
  const developed = advanceViral(original, 40);
  const flows = viralResourceFlows(developed);
  assert.ok(flows.virionProduction > 0);
  assert.ok(flows.cellExhaustion > 0);
  assert.deepEqual(original, createViralState());
});
