// Spatial geometry adapted to a small biological tree from Crystal Craft's
// Study Tree (studyTreeLayout.ts / studyTreeAdapter.ts). Pure presentation data.
import { ORIGIN_MILESTONES, TRANSMISSION_SKILLS } from "./skills.js";
import { canTransmit, infectedCells } from "./viral.js";

const definitions = [
  { id: "origin", kind: "origin", name: "First Virion", description: "One virion in one carrier.", mark: "◉", radius: 0, angle: 0 },
  { ...ORIGIN_MILESTONES[0], kind: "milestone", mark: "◌", radius: 146, angle: 0 },
  { ...ORIGIN_MILESTONES[1], kind: "milestone", mark: "✣", radius: 286, angle: 0 },
  { ...ORIGIN_MILESTONES[2], kind: "milestone", mark: "◎", radius: 426, angle: 0 },
  { ...TRANSMISSION_SKILLS[0], kind: "choice", mark: "◐", radius: 588, angle: -24 },
  { ...TRANSMISSION_SKILLS[1], kind: "choice", mark: "✺", radius: 588, angle: 24 }
];

export const EVOLUTION_NODES = Object.freeze(definitions.map(node => Object.freeze(node)));
export const EVOLUTION_LINKS = Object.freeze([
  ["origin", "entry"],
  ["entry", "replication"],
  ["replication", "infectious"],
  ["infectious", "covert"],
  ["infectious", "surge"]
]);

export function nodeCenter(node) {
  const radians = (node.angle * Math.PI) / 180;
  return {
    x: Math.cos(radians) * node.radius + (node.offset?.x ?? 0),
    y: Math.sin(radians) * node.radius + (node.offset?.y ?? 0)
  };
}

export function nodeDimensions(node) {
  if (node.kind === "origin") return { width: 96, height: 96, round: true };
  if (node.kind === "milestone") return { width: 106, height: 106, round: true };
  return { width: 166, height: 88, round: false };
}

// Connections stop at node rims rather than passing through content.
export function edgeEndpoint(center, toward, footprint) {
  const dx = toward.x - center.x;
  const dy = toward.y - center.y;
  if (!dx && !dy) return center;
  const rx = footprint.width / 2;
  const ry = footprint.height / 2;
  const scale = footprint.round
    ? 1 / Math.hypot(dx / rx, dy / ry)
    : Math.min(dx ? rx / Math.abs(dx) : Infinity, dy ? ry / Math.abs(dy) : Infinity);
  return { x: center.x + dx * scale, y: center.y + dy * scale };
}

export function treeBounds(nodes = EVOLUTION_NODES) {
  if (!nodes.length) return { left: 0, right: 0, top: 0, bottom: 0 };
  let left = Infinity, right = -Infinity, top = Infinity, bottom = -Infinity;
  for (const node of nodes) {
    const center = nodeCenter(node);
    const size = nodeDimensions(node);
    left = Math.min(left, center.x - size.width / 2);
    right = Math.max(right, center.x + size.width / 2);
    top = Math.min(top, center.y - size.height / 2);
    bottom = Math.max(bottom, center.y + size.height / 2);
  }
  return { left, right, top, bottom };
}

export function fitTreeCamera(viewportWidth, viewportHeight, padding = 28) {
  const bounds = treeBounds();
  const usableWidth = Math.max(1, viewportWidth - 2 * padding);
  const usableHeight = Math.max(1, viewportHeight - 2 * padding);
  const zoom = Math.min(1.2,
    usableWidth / Math.max(1, bounds.right - bounds.left),
    usableHeight / Math.max(1, bounds.bottom - bounds.top));
  return {
    zoom,
    x: -(bounds.left + bounds.right) * zoom / 2,
    y: -(bounds.top + bounds.bottom) * zoom / 2
  };
}

export function evolutionTreeModel(viral) {
  const infected = infectedCells(viral) > 0 || viral.exhaustedCells > 0;
  const replicating = viral.producingCells > 0 || canTransmit(viral);
  const infectious = canTransmit(viral);
  const milestones = { origin: true, entry: infected, replication: replicating, infectious };
  const nodes = EVOLUTION_NODES.map(definition => ({
    ...definition,
    center: nodeCenter(definition),
    footprint: nodeDimensions(definition),
    state: definition.kind === "choice"
      ? infectious ? "available" : "locked"
      : milestones[definition.id] ? "learned" : "locked"
  }));
  const byId = new Map(nodes.map(node => [node.id, node]));
  const edges = EVOLUTION_LINKS.map(([source, target]) => {
    const start = byId.get(source);
    const end = byId.get(target);
    return {
      source, target,
      from: edgeEndpoint(start.center, end.center, start.footprint),
      to: edgeEndpoint(end.center, start.center, end.footprint),
      state: start.state === "learned" && end.state === "learned"
        ? "learned" : start.state === "learned" && end.state === "available"
          ? "available" : "locked"
    };
  });
  return { nodes, edges };
}

export function directionalNeighbor(id, direction, nodes = EVOLUTION_NODES) {
  const origin = nodes.find(node => node.id === id);
  if (!origin) return null;
  const connected = new Set(EVOLUTION_LINKS
    .filter(([source, target]) => source === id || target === id)
    .map(([source, target]) => source === id ? target : source));
  const vector = {
    ArrowUp: { x: 0, y: -1 }, ArrowDown: { x: 0, y: 1 },
    ArrowLeft: { x: -1, y: 0 }, ArrowRight: { x: 1, y: 0 }
  }[direction];
  if (!vector) return null;
  const point = nodeCenter(origin);
  const ranked = nodes.filter(node => connected.has(node.id)).map(node => {
    const center = nodeCenter(node);
    const dx = center.x - point.x, dy = center.y - point.y;
    return { id: node.id, score: (dx * vector.x + dy * vector.y) / Math.hypot(dx, dy) };
  }).filter(candidate => candidate.score > 0.1).sort((a, b) => b.score - a.score);
  return ranked[0]?.id ?? null;
}
