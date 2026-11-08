// Crystal Craft Study Tree interaction model adapted to this lightweight
// dependency-free client: authored radial layout, SVG links, selection inspector,
// independent evolve action, pan/zoom/fit, keyboard navigation and a browse list.
// Gameplay authority remains in game.js and skills.js.
import { evolutionTreeModel, EVOLUTION_NODES, directionalNeighbor, fitTreeCamera } from "./evolutionTreeLayout.js";

const svgNS = "http://www.w3.org/2000/svg";
const clamp = (value, min, max) => Math.max(min, Math.min(max, value));
const stateLabel = { learned: "Learned", available: "Available", locked: "Locked" };

function svgElement(tag, attributes = {}) {
  const element = document.createElementNS(svgNS, tag);
  for (const [key, value] of Object.entries(attributes)) element.setAttribute(key, String(value));
  return element;
}

export function createEvolutionTreeView(root, onAcquire) {
  const viewport = root.querySelector("#evolution-viewport");
  const world = root.querySelector("#evolution-world");
  const lines = root.querySelector("#evolution-edges");
  const nodeLayer = root.querySelector("#evolution-nodes");
  const title = root.querySelector("#evolution-detail-title");
  const description = root.querySelector("#evolution-detail-description");
  const stateText = root.querySelector("#evolution-detail-state");
  const action = root.querySelector("#evolution-action");
  const browse = root.querySelector("#evolution-node-list");
  const list = root.querySelector("#evolution-browse-list");
  const nodeButtons = new Map();
  const lineElements = [];
  const camera = { x: 0, y: 0, zoom: 1 };
  const pointers = new Map();
  let selected = "infectious";
  let model = null;
  let initiallyFitted = false;
  let fitScheduled = false;

  // Quiet circular sector guides sit behind actual progression connections.
  for (const radius of [146, 286, 426, 588]) {
    lines.append(svgElement("circle", { cx: 0, cy: 0, r: radius, class: "evolution-guide" }));
  }
  const projection = evolutionTreeModel({
    virions: 0, latent: [], producingCells: 0, exhaustedCells: 0, transmissionReady: false
  });
  for (const edge of projection.edges) {
    const line = svgElement("line", {
      x1: edge.from.x, y1: edge.from.y, x2: edge.to.x, y2: edge.to.y,
      class: "evolution-link"
    });
    lines.append(line);
    lineElements.push(line);
  }
  for (const node of EVOLUTION_NODES) {
    const button = document.createElement("button");
    const kind = node.kind;
    button.type = "button";
    button.id = "evolution-node-" + node.id;
    button.dataset.nodeId = node.id;
    button.className = "evolution-node evolution-node--" + kind;
    button.style.left = nodeCenterX(node) + "px";
    button.style.top = nodeCenterY(node) + "px";
    const mark = document.createElement("span");
    mark.className = "evolution-node-mark";
    mark.textContent = node.mark;
    mark.setAttribute("aria-hidden", "true");
    const name = document.createElement("strong");
    name.textContent = node.name;
    button.append(mark, name);
    button.title = node.name + ": " + node.description;
    button.addEventListener("click", () => select(node.id));
    button.addEventListener("keydown", event => {
      const next = directionalNeighbor(node.id, event.key);
      if (!next) return;
      event.preventDefault();
      event.stopPropagation();
      select(next, true, true);
    });
    nodeLayer.append(button);
    nodeButtons.set(node.id, button);
  }

  function nodeCenterX(node) {
    return Math.cos(node.angle * Math.PI / 180) * node.radius + (node.offset?.x ?? 0);
  }
  function nodeCenterY(node) {
    return Math.sin(node.angle * Math.PI / 180) * node.radius + (node.offset?.y ?? 0);
  }
  function applyCamera() {
    world.style.transform = "translate(" + camera.x + "px," + camera.y +
      "px) scale(" + camera.zoom + ")";
  }
  function fit() {
    if (!viewport.clientWidth || !viewport.clientHeight) return;
    Object.assign(camera, fitTreeCamera(viewport.clientWidth, viewport.clientHeight));
    initiallyFitted = true;
    applyCamera();
  }
  function scheduleFit() {
    if (initiallyFitted || fitScheduled) return;
    fitScheduled = true;
    requestAnimationFrame(() => {
      fitScheduled = false;
      if (!initiallyFitted) fit();
    });
  }
  function zoomAt(factor, clientX, clientY) {
    const rect = viewport.getBoundingClientRect();
    const x = clientX === undefined ? 0 : clientX - rect.left - rect.width / 2;
    const y = clientY === undefined ? 0 : clientY - rect.top - rect.height / 2;
    const newZoom = clamp(camera.zoom * factor, 0.22, 2.4);
    const ratio = newZoom / camera.zoom;
    camera.x = x - (x - camera.x) * ratio;
    camera.y = y - (y - camera.y) * ratio;
    camera.zoom = newZoom;
    applyCamera();
  }
  function centerOn(id) {
    const node = model?.nodes.find(item => item.id === id);
    if (!node) return;
    camera.x = -node.center.x * camera.zoom;
    camera.y = -node.center.y * camera.zoom;
    applyCamera();
  }
  function renderInspector() {
    const node = model?.nodes.find(item => item.id === selected);
    if (!node) {
      title.textContent = "Select an adaptation";
      description.textContent = "Choose a node to inspect its effects.";
      stateText.textContent = "";
      action.hidden = true;
      return;
    }
    title.textContent = node.name;
    description.textContent = node.description;
    stateText.textContent = stateLabel[node.state];
    stateText.dataset.state = node.state;
    const selectable = node.kind === "choice" && node.state === "available";
    action.hidden = !selectable;
    if (selectable) {
      action.textContent = "Evolve: " + node.name;
      action.dataset.skill = node.id;
    } else {
      action.removeAttribute("data-skill");
    }
  }
  function renderSelection() {
    for (const [id, button] of nodeButtons) {
      const active = id === selected;
      button.classList.toggle("selected", active);
      button.setAttribute("aria-pressed", String(active));
    }
    renderInspector();
  }
  function select(id, focus = false, center = false) {
    if (!nodeButtons.has(id)) return;
    selected = id;
    renderSelection();
    if (center) centerOn(id);
    if (focus) nodeButtons.get(id).focus({ preventScroll: true });
  }
  function refresh(viral) {
    model = evolutionTreeModel(viral);
    for (const node of model.nodes) {
      const button = nodeButtons.get(node.id);
      button.dataset.state = node.state;
      button.setAttribute("aria-label",
        node.name + ", " + stateLabel[node.state] + ", " + node.description + ". Select to inspect.");
      button.classList.toggle("selected", selected === node.id);
    }
    model.edges.forEach((edge, index) => {
      lineElements[index].dataset.state = edge.state;
    });
    renderInspector();
    scheduleFit();
  }
  function openList() {
    if (!browse || !list) return;
    list.replaceChildren();
    for (const node of model?.nodes ?? []) {
      const button = document.createElement("button");
      button.type = "button";
      button.className = "evolution-list-choice";
      const label = document.createElement("strong");
      label.textContent = node.name;
      const status = document.createElement("small");
      status.textContent = stateLabel[node.state];
      button.append(label, status);
      button.addEventListener("click", () => {
        browse.close();
        select(node.id, true, true);
      });
      list.append(button);
    }
    browse.showModal();
  }

  root.querySelector("#evolution-zoom-in").addEventListener("click", () => zoomAt(1.2));
  root.querySelector("#evolution-zoom-out").addEventListener("click", () => zoomAt(1 / 1.2));
  root.querySelector("#evolution-fit").addEventListener("click", fit);
  root.querySelector("#evolution-center").addEventListener("click", () => {
    camera.zoom = 0.8;
    centerOn("origin");
  });
  root.querySelector("#evolution-browse").addEventListener("click", openList);
  root.querySelector("#evolution-close-list").addEventListener("click", () => browse.close());
  action.addEventListener("click", () => {
    const node = model?.nodes.find(item => item.id === action.dataset.skill);
    if (node?.kind === "choice" && node.state === "available") onAcquire(node.id);
  });

  viewport.addEventListener("wheel", event => {
    event.preventDefault();
    zoomAt(event.deltaY < 0 ? 1.12 : 1 / 1.12, event.clientX, event.clientY);
  }, { passive: false });

  // Pointer gestures work on the blank canvas; selecting nodes never pans it.
  viewport.addEventListener("pointerdown", event => {
    if (event.target.closest("button")) return;
    pointers.set(event.pointerId, { x: event.clientX, y: event.clientY });
    viewport.setPointerCapture(event.pointerId);
  });
  viewport.addEventListener("pointermove", event => {
    if (!pointers.has(event.pointerId)) return;
    const previous = new Map(pointers);
    pointers.set(event.pointerId, { x: event.clientX, y: event.clientY });
    if (pointers.size === 1) {
      const old = previous.get(event.pointerId);
      camera.x += event.clientX - old.x;
      camera.y += event.clientY - old.y;
    } else if (pointers.size === 2) {
      const previousPair = [...previous.values()];
      const nextPair = [...pointers.values()];
      const distance = points => Math.hypot(points[0].x - points[1].x, points[0].y - points[1].y);
      const midpoint = points => ({ x: (points[0].x + points[1].x) / 2, y: (points[0].y + points[1].y) / 2 });
      const before = midpoint(previousPair);
      const after = midpoint(nextPair);
      zoomAt(distance(nextPair) / Math.max(1, distance(previousPair)), after.x, after.y);
      camera.x += after.x - before.x;
      camera.y += after.y - before.y;
    }
    applyCamera();
  });
  const removePointer = event => pointers.delete(event.pointerId);
  viewport.addEventListener("pointerup", removePointer);
  viewport.addEventListener("pointercancel", removePointer);
  viewport.addEventListener("lostpointercapture", removePointer);
  viewport.addEventListener("click", event => {
    if (event.target.closest("button")) return;
    selected = null;
    renderSelection();
  });

  if (typeof ResizeObserver !== "undefined") {
    const observer = new ResizeObserver(() => scheduleFit());
    observer.observe(viewport);
  }

  return {
    show(viral) { refresh(viral); },
    reset() {
      selected = "infectious";
      initiallyFitted = false;
      pointers.clear();
      scheduleFit();
    }
  };
}
