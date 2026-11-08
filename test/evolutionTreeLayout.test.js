import test from "node:test";
import assert from "node:assert/strict";
import { advance, createGame } from "../src/game.js";
import { createViralState } from "../src/viral.js";
import {
  EVOLUTION_NODES, EVOLUTION_LINKS, nodeCenter, nodeDimensions, edgeEndpoint,
  treeBounds, fitTreeCamera, evolutionTreeModel, directionalNeighbor
} from "../src/evolutionTreeLayout.js";

test("Crystal Craft-derived spatial layout has stable authored centers and link targets", () => {
  assert.equal(EVOLUTION_NODES.length, 6);
  assert.equal(EVOLUTION_LINKS.length, 5);
  for (const node of EVOLUTION_NODES) {
    const center = nodeCenter(node);
    const footprint = nodeDimensions(node);
    assert.ok(Number.isFinite(center.x) && Number.isFinite(center.y));
    assert.ok(footprint.width >= 88 && footprint.height >= 88);
  }
  assert.deepEqual(nodeCenter(EVOLUTION_NODES[0]), { x: 0, y: 0 });
  assert.ok(nodeCenter(EVOLUTION_NODES[4]).y < 0);
  assert.ok(nodeCenter(EVOLUTION_NODES[5]).y > 0);
});

test("edges terminate on actual node boundaries, not their centers", () => {
  const origin = { x: 0, y: 0 }, destination = { x: 300, y: 400 };
  const circle = edgeEndpoint(origin, destination, { width: 100, height: 100, round: true });
  assert.ok(Math.abs(Math.hypot(circle.x, circle.y) - 50) < 1e-8);
  const rectangle = edgeEndpoint(origin, destination, { width: 168, height: 80, round: false });
  assert.deepEqual(rectangle, { x: 30, y: 40 });
  assert.deepEqual(edgeEndpoint(origin, origin, { width: 100, height: 100, round: true }), origin);
});

test("fit camera encompasses the whole graph without inventing node motion", () => {
  const bounds = treeBounds();
  const fitted = fitTreeCamera(800, 500);
  assert.ok(fitted.zoom > 0 && fitted.zoom <= 1.2);
  const xMin = bounds.left * fitted.zoom + fitted.x;
  const xMax = bounds.right * fitted.zoom + fitted.x;
  const yMin = bounds.top * fitted.zoom + fitted.y;
  const yMax = bounds.bottom * fitted.zoom + fitted.y;
  assert.ok(xMin >= -400 + 27);
  assert.ok(xMax <= 400 - 27);
  assert.ok(yMin >= -250 + 27);
  assert.ok(yMax <= 250 - 27);
  assert.ok(fitTreeCamera(320, 280).zoom < fitted.zoom);
});

test("infectious threshold reveals two available paths while milestones are learned", () => {
  const first = evolutionTreeModel(createViralState());
  const byId = model => new Map(model.nodes.map(node => [node.id, node]));
  assert.equal(byId(first).get("origin").state, "learned");
  assert.equal(byId(first).get("entry").state, "locked");
  assert.equal(byId(first).get("covert").state, "locked");
  assert.equal(first.edges.find(edge => edge.target === "covert").state, "locked");

  const mid = advance(createGame(), 7);
  assert.equal(byId(evolutionTreeModel(mid.viral)).get("entry").state, "learned");

  const ready = advance(createGame(), 240);
  const map = byId(evolutionTreeModel(ready.viral));
  for (const id of ["origin", "entry", "replication", "infectious"])
    assert.equal(map.get(id).state, "learned");
  for (const id of ["covert", "surge"]) assert.equal(map.get(id).state, "available");
  assert.equal(evolutionTreeModel(ready.viral).edges.find(edge => edge.target === "covert").state, "available");
});

test("keyboard graph navigation follows real links in a spatial direction", () => {
  assert.equal(directionalNeighbor("infectious", "ArrowUp"), "covert");
  assert.equal(directionalNeighbor("infectious", "ArrowDown"), "surge");
  assert.equal(directionalNeighbor("covert", "ArrowLeft"), "infectious");
  assert.equal(directionalNeighbor("origin", "ArrowRight"), "entry");
  assert.equal(directionalNeighbor("origin", "ArrowUp"), null);
});
