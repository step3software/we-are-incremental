import {
  UPGRADES, GENES, DIRECTIVES, advance, beginTransmission, availableDirectives, availableGenes,
  buildLauncher, buyUpgrade, canLaunch, createGame, getPlanet, getStats,
  launchScout, launcherCost, takeover, upgradeCost, TAKEOVER_TO_BUILD, TAKEOVER_TO_LAUNCH
} from "./game.js";
import { deleteSave, loadGame, saveGame } from "./storage.js";
import { canTransmit, infectedCells } from "./viral.js";

const element = id => document.getElementById(id);
const compact = new Intl.NumberFormat("en-US", { notation: "compact", maximumFractionDigits: 1 });
const whole = new Intl.NumberFormat("en-US", { maximumFractionDigits: 0 });
const initial = loadGame();
let state = initial.state;
let lastSaved = Date.now();
let lastLineageRender = "";
let lastObjectiveRender = "";
const upgradeButtons = new Map();
const events = [];
const tabs = [...document.querySelectorAll('[role="tab"][data-tab]')];

function count(number) {
  return number < 10000 ? whole.format(Math.floor(number)) : compact.format(Math.floor(number));
}

function rate(number) {
  return number < 10 ? number.toFixed(2) : count(number);
}

function notice(message) {
  element("notice").textContent = message;
  element("notice").hidden = !message;
}

function recordEvent(message) {
  events.unshift(message);
  if (events.length > 7) events.pop();
  const list = element("event-log");
  list.replaceChildren();
  for (const entry of events) {
    const row = document.createElement("li");
    row.textContent = entry;
    list.append(row);
  }
}

function selectTab(tabName, focus = false) {
  for (const tab of tabs) {
    const selected = tab.dataset.tab === tabName;
    tab.setAttribute("aria-selected", String(selected));
    tab.tabIndex = selected ? 0 : -1;
    tab.classList.toggle("active", selected);
    const panel = element("tab-" + tab.dataset.tab);
    panel.hidden = !selected;
    if (selected && focus) tab.focus();
  }
}

for (let index = 0; index < tabs.length; index++) {
  const tab = tabs[index];
  tab.addEventListener("click", () => selectTab(tab.dataset.tab));
  tab.addEventListener("keydown", event => {
    let target = index;
    if (event.key === "ArrowRight") target = (index + 1) % tabs.length;
    else if (event.key === "ArrowLeft") target = (index - 1 + tabs.length) % tabs.length;
    else if (event.key === "Home") target = 0;
    else if (event.key === "End") target = tabs.length - 1;
    else return;
    event.preventDefault();
    selectTab(tabs[target].dataset.tab, true);
  });
}

function synchronize() {
  const now = Date.now();
  state = { ...advance(state, Math.max(0, (now - state.updatedAt) / 1000)), updatedAt: now };
}

function persist() {
  if (!saveGame(state)) notice("Progress could not be saved in this browser.");
  lastSaved = Date.now();
}

function act(transform, description) {
  synchronize();
  const next = transform(state);
  if (next !== state) {
    state = next;
    if (description) recordEvent(typeof description === "function" ? description(state) : description);
    persist();
  }
  render();
}

function createUpgradeButtons() {
  for (const upgrade of UPGRADES) {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "upgrade";
    const content = document.createElement("span");
    content.className = "upgrade-copy";
    const name = document.createElement("strong");
    name.textContent = upgrade.name;
    const description = document.createElement("small");
    description.textContent = upgrade.description;
    content.append(name, description);
    const value = document.createElement("span");
    value.className = "upgrade-value";
    const level = document.createElement("small");
    const price = document.createElement("strong");
    value.append(level, price);
    button.append(content, value);
    button.addEventListener("click", () => act(
      current => buyUpgrade(current, upgrade.id),
      current => upgrade.name + " advanced to level " + current.upgrades[upgrade.id] + "."
    ));
    element("upgrade-list").append(button);
    upgradeButtons.set(upgrade.id, { button, level, price });
  }
}

function makeLedgerRow(name, description, status, locked) {
  const row = document.createElement("div");
  row.className = "ledger-row" + (locked ? " locked" : "");
  const text = document.createElement("div");
  const title = document.createElement("strong");
  title.textContent = name;
  const explanation = document.createElement("small");
  explanation.textContent = description;
  const counter = document.createElement("span");
  counter.textContent = status;
  text.append(title, explanation);
  row.append(text, counter);
  return row;
}

function renderLineage() {
  const signature = [state.lineage.worlds, JSON.stringify(state.lineage.genes), state.directive].join("|");
  if (signature === lastLineageRender) return;
  lastLineageRender = signature;

  const owned = GENES.filter(gene => (state.lineage.genes[gene.id] || 0) > 0);
  element("genome-list").textContent = owned.length
    ? owned.map(gene => gene.name + " " + state.lineage.genes[gene.id]).join(" · ")
    : "No inherited adaptations yet.";

  const geneLedger = element("gene-ledger");
  geneLedger.replaceChildren();
  for (const gene of GENES) {
    const rank = state.lineage.genes[gene.id] || 0;
    const unlocked = state.lineage.worlds >= gene.unlockAfterWorlds;
    const status = !unlocked
      ? "AFTER " + gene.unlockAfterWorlds + " WORLDS"
      : rank ? "RANK " + rank : "AVAILABLE";
    geneLedger.append(makeLedgerRow(gene.name, gene.description, status, !unlocked));
  }

  const directiveLedger = element("directive-ledger");
  directiveLedger.replaceChildren();
  for (const directive of DIRECTIVES) {
    const unlocked = state.lineage.worlds >= directive.unlockAfterWorlds;
    directiveLedger.append(makeLedgerRow(
      directive.name,
      directive.description,
      unlocked ? "AVAILABLE" : "AFTER " + directive.unlockAfterWorlds + " WORLDS",
      !unlocked
    ));
  }
  element("current-directive").textContent =
    DIRECTIVES.find(directive => directive.id === state.directive)?.name || "Pioneer scout";
}

function renderObjectives(portion) {
  const objectives = [
    { label: "Establish the first 10 hosts", done: state.hosts >= 10 },
    { label: "Assimilate 70% of the planet", done: portion >= TAKEOVER_TO_BUILD },
    { label: "Grow the scout launch organism", done: state.launcherBuilt },
    { label: "Control 95% to launch a scout", done: portion >= TAKEOVER_TO_LAUNCH }
  ];
  const signature = objectives.map(objective => String(objective.done)).join("");
  if (signature === lastObjectiveRender) return;
  lastObjectiveRender = signature;
  const list = element("objective-list");
  list.replaceChildren();
  for (const objective of objectives) {
    const row = document.createElement("li");
    if (objective.done) row.classList.add("done");
    const marker = document.createElement("span");
    marker.className = "check";
    marker.textContent = objective.done ? "✓" : "○";
    marker.setAttribute("aria-hidden", "true");
    const label = document.createElement("span");
    label.textContent = (objective.done ? "Completed: " : "Pending: ") + objective.label;
    row.append(marker, label);
    list.append(row);
  }
}

function renderOrigin() {
  const viral = state.viral;
  const occupied = infectedCells(viral);
  element("origin-virions").textContent = count(viral.virions);
  element("origin-virion-label").textContent = viral.virions === 1 ? "virion" : "virions";

  // Only the initial virion is visible on first load; details emerge naturally.
  const hasInfected = occupied > 0 || viral.exhaustedCells > 0;
  element("origin-cells").hidden = !hasInfected;
  if (hasInfected) {
    element("origin-infected-cells").textContent = count(occupied);
    element("origin-message").textContent = viral.producingCells > 0
      ? "Infected cells are producing new virions."
      : "The virus has entered a cell.";
  }
  element("origin-ready").hidden = !canTransmit(viral);
}

function render() {
  const isViral = state.stage === "viral";
  element("origin-screen").hidden = !isViral;
  element("management-screen").hidden = isViral;
  if (isViral) {
    renderOrigin();
    return;
  }
  const planet = getPlanet(state);
  const stats = getStats(state);
  const portion = takeover(state);
  const remaining = Math.max(0, planet.population - state.hosts);
  const percent = (portion * 100).toFixed(1);
  const vigilance = Math.round(state.vigilance);
  const phase = portion < 0.1 ? "Infiltrating" :
    portion < TAKEOVER_TO_BUILD ? "Spreading" :
    portion < TAKEOVER_TO_LAUNCH ? "Dominating" : "Conquered";

  element("world-number").textContent = String(state.planetIndex + 1).padStart(2, "0");
  element("worlds-completed").textContent = count(state.lineage.worlds);
  element("world-phase").textContent = phase;
  element("world-name").textContent = planet.name;
  element("world-epithet").textContent = planet.epithet;
  element("world-description").textContent = planet.description;
  element("takeover-percent").textContent = percent + "%";
  element("takeover-progress").setAttribute("aria-valuenow", String(Math.round(portion * 100)));
  element("takeover-fill").style.width = String(portion * 100) + "%";
  element("host-count").textContent = count(state.hosts) + " / " + count(planet.population);
  element("resistance-label").textContent = vigilance + "%";
  element("biomass-count").textContent = count(state.biomass);
  element("biomass-rate").textContent = "+" + rate(stats.biomassPerSecond) + "/s";
  element("spread-rate").textContent = "+" + rate(stats.spreadPerSecond) + "/s";
  element("lineage-worlds").textContent = count(state.lineage.worlds);
  element("lineage-ranks").textContent = count(
    Object.values(state.lineage.genes).reduce((sum, rank) => sum + rank, 0)
  );
  element("planet-population").textContent = count(planet.population);
  element("planet-remaining").textContent = count(remaining) + " unassimilated";
  element("passive-recruitment").textContent = "+" + rate(stats.spreadPerSecond) + " hosts / s";
  element("local-vigilance").textContent = vigilance + "% alert";

  element("intel-world").textContent = planet.name;
  element("intel-population").textContent = count(planet.population);
  element("intel-remaining").textContent = count(remaining);
  element("intel-vigilance").textContent = vigilance + "%";
  element("intel-phase").textContent = phase;
  element("intel-launcher").textContent = state.launcherBuilt ? "Fully grown" : "Not grown";

  for (const upgrade of UPGRADES) {
    const ui = upgradeButtons.get(upgrade.id);
    const cost = upgradeCost(state, upgrade.id);
    ui.level.textContent = "LVL " + state.upgrades[upgrade.id];
    ui.price.textContent = count(cost) + " BIO";
    ui.button.disabled = state.biomass < cost;
    ui.button.setAttribute("aria-label",
      "Purchase " + upgrade.name + " level " + (state.upgrades[upgrade.id] + 1) +
      " for " + count(cost) + " biomass");
  }

  const ready = canLaunch(state);
  const build = element("build-launcher");
  build.hidden = state.launcherBuilt;
  build.disabled = state.launcherBuilt || portion < TAKEOVER_TO_BUILD || state.biomass < launcherCost(state);
  build.textContent = "GROW ORGAN · " + count(launcherCost(state)) + " BIO";
  element("open-launch").disabled = !ready;
  if (ready) {
    element("launch-status").textContent = "The planet is yours. Choose what survives into the next generation.";
  } else if (state.launcherBuilt) {
    element("launch-status").textContent = "Launcher grown. Assimilate 95% of the world to deploy a scout.";
  } else if (portion < TAKEOVER_TO_BUILD) {
    element("launch-status").textContent = "Assimilate 70% of this world to grow a scout launcher.";
  } else {
    element("launch-status").textContent = "Feed the launch organism " + count(launcherCost(state)) + " biomass.";
  }

  renderLineage();
  renderObjectives(portion);
}

function addChoice(container, group, choice, checked) {
  const label = document.createElement("label");
  label.className = "choice";
  const input = document.createElement("input");
  input.type = "radio";
  input.name = group;
  input.value = choice.id;
  input.checked = checked;
  input.required = true;
  const description = document.createElement("span");
  description.className = "choice-description";
  const title = document.createElement("strong");
  title.textContent = choice.name;
  const explanation = document.createElement("small");
  explanation.textContent = choice.description;
  description.append(title, explanation);
  label.append(input, description);
  container.append(label);
}

function openScout() {
  synchronize();
  if (!canLaunch(state)) return;
  const genes = availableGenes(state);
  const directives = availableDirectives(state);
  const geneContainer = element("gene-choices");
  const directiveContainer = element("directive-choices");
  geneContainer.replaceChildren();
  directiveContainer.replaceChildren();
  genes.forEach((gene, index) => {
    const rank = state.lineage.genes[gene.id] || 0;
    addChoice(geneContainer, "gene",
      { ...gene, description: "Rank " + (rank + 1) + " · " + gene.description }, index === 0);
  });
  directives.forEach((directive, index) =>
    addChoice(directiveContainer, "directive", directive, index === 0));
  element("scout-dialog").showModal();
}

element("origin-continue").addEventListener("click", () => {
  act(beginTransmission, "The first carrier can now transmit to others.");
  if (state.stage === "planetary") selectTab("invasion");
});
element("build-launcher").addEventListener("click",
  () => act(buildLauncher, "The planetary launch organism has been grown."));
element("open-launch").addEventListener("click", openScout);
element("cancel-scout").addEventListener("click", () => element("scout-dialog").close());
element("scout-form").addEventListener("submit", event => {
  event.preventDefault();
  synchronize();
  const form = new FormData(event.currentTarget);
  const evolved = launchScout(state, form.get("gene"), form.get("directive"), Date.now());
  if (evolved === state) {
    notice("The scout cannot launch until this planet is secured.");
    return;
  }
  state = evolved;
  element("scout-dialog").close();
  selectTab("invasion");
  recordEvent("A scout landed on " + getPlanet(state).name + ". The collective evolves.");
  notice("Scout deployed. Your lineage remembers the world it conquered.");
  persist();
  render();
});
element("reset-game").addEventListener("click", () => {
  if (!window.confirm("Erase every conquered world and all inherited evolution? This cannot be undone.")) return;
  if (!deleteSave()) {
    notice("Unable to clear this browser's saved game.");
    return;
  }
  state = createGame(Date.now());
  lastLineageRender = "";
  lastObjectiveRender = "";
  events.length = 0;
  recordEvent("A solitary scout has landed on " + getPlanet(state).name + ".");
  selectTab("invasion");
  notice("Lineage erased. A new scout has landed.");
  persist();
  render();
});
window.addEventListener("pagehide", () => { synchronize(); persist(); });
document.addEventListener("visibilitychange", () => {
  if (document.visibilityState === "hidden") { synchronize(); persist(); }
});

createUpgradeButtons();
selectTab("invasion");
recordEvent("A scout has landed on " + getPlanet(state).name + ".");
render();
if (initial.recovered) notice("The saved game was incompatible or unreadable; a new lineage has begun.");
else if (initial.offlineSeconds >= 10) {
  notice("Your swarm continued spreading during " +
    Math.round(initial.offlineSeconds / 60) + " minutes away (up to six hours).");
}
setInterval(() => {
  synchronize();
  render();
  if (Date.now() - lastSaved >= 5000) persist();
}, 1000);
