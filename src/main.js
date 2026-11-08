import {
  UPGRADES, GENES, advance, assimilate, availableDirectives, availableGenes,
  buildLauncher, buyUpgrade, canLaunch, createGame, getPlanet, getStats,
  launchScout, launcherCost, takeover, upgradeCost, TAKEOVER_TO_BUILD, TAKEOVER_TO_LAUNCH
} from "./game.js";
import { deleteSave, loadGame, saveGame } from "./storage.js";

const element = id => document.getElementById(id);
const compact = new Intl.NumberFormat("en-US", { notation: "compact", maximumFractionDigits: 1 });
const whole = new Intl.NumberFormat("en-US", { maximumFractionDigits: 0 });
const initial = loadGame();
let state = initial.state;
let lastSaved = Date.now();
const upgradeButtons = new Map();

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

function synchronize() {
  const now = Date.now();
  state = { ...advance(state, Math.max(0, (now - state.updatedAt) / 1000)), updatedAt: now };
}

function persist() {
  if (!saveGame(state)) notice("Progress could not be saved in this browser.");
  lastSaved = Date.now();
}

function act(transform) {
  synchronize();
  const next = transform(state);
  if (next !== state) {
    state = next;
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
    button.addEventListener("click", () => act(current => buyUpgrade(current, upgrade.id)));
    element("upgrade-list").append(button);
    upgradeButtons.set(upgrade.id, { button, level, price });
  }
}

function render() {
  const planet = getPlanet(state);
  const stats = getStats(state);
  const portion = takeover(state);
  const percent = (portion * 100).toFixed(1);
  element("world-number").textContent = String(state.planetIndex + 1).padStart(2, "0");
  element("worlds-completed").textContent = count(state.lineage.worlds);
  element("world-name").textContent = planet.name;
  element("world-epithet").textContent = planet.epithet;
  element("world-description").textContent = planet.description;
  element("takeover-percent").textContent = percent + "%";
  element("takeover-progress").setAttribute("aria-valuenow", String(Math.round(portion * 100)));
  element("takeover-fill").style.width = String(portion * 100) + "%";
  element("host-count").textContent = count(state.hosts) + " / " + count(planet.population) + " hosts";
  element("resistance-label").textContent = "Vigilance " + Math.round(state.vigilance) + "%";
  element("biomass-count").textContent = count(state.biomass);
  element("biomass-rate").textContent = "+" + rate(stats.biomassPerSecond) + " / second";
  element("spread-rate").textContent = rate(stats.spreadPerSecond) + " /s";
  element("assimilate-power").textContent = "+" + count(Math.min(stats.clickHosts, planet.population - state.hosts));
  element("assimilate").disabled = portion >= 1;

  for (const upgrade of UPGRADES) {
    const ui = upgradeButtons.get(upgrade.id);
    const cost = upgradeCost(state, upgrade.id);
    ui.level.textContent = "LEVEL " + state.upgrades[upgrade.id];
    ui.price.textContent = count(cost) + " BIO";
    ui.button.disabled = state.biomass < cost;
  }

  const ready = canLaunch(state);
  const build = element("build-launcher");
  build.hidden = state.launcherBuilt;
  build.disabled = state.launcherBuilt || portion < TAKEOVER_TO_BUILD || state.biomass < launcherCost(state);
  build.textContent = "GROW LAUNCH ORGAN · " + count(launcherCost(state)) + " BIO";
  element("open-launch").disabled = !ready;
  if (ready) {
    element("launch-status").textContent = "The planet is yours. Choose what survives into the next generation.";
  } else if (state.launcherBuilt) {
    element("launch-status").textContent = "Launcher ready. Assimilate " + Math.round(TAKEOVER_TO_LAUNCH * 100) + "% of the world to fire the scout.";
  } else if (portion < TAKEOVER_TO_BUILD) {
    element("launch-status").textContent = "Assimilate " + Math.round(TAKEOVER_TO_BUILD * 100) + "% of the world to grow a spore launcher.";
  } else {
    element("launch-status").textContent = "You control enough of this world. Feed your launch organism " + count(launcherCost(state)) + " biomass.";
  }

  const legacy = GENES.filter(gene => (state.lineage.genes[gene.id] || 0) > 0);
  element("genome-list").textContent = legacy.length ?
    legacy.map(gene => gene.name + " " + state.lineage.genes[gene.id]).join(" · ") :
    "No inherited adaptations. The first conquest will change that.";
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
    addChoice(geneContainer, "gene", { ...gene, description: "Rank " + (rank + 1) + " · " + gene.description }, index === 0);
  });
  directives.forEach((directive, index) => addChoice(directiveContainer, "directive", directive, index === 0));
  element("scout-dialog").showModal();
}

element("assimilate").addEventListener("click", () => act(assimilate));
element("build-launcher").addEventListener("click", () => act(buildLauncher));
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
  notice("Lineage erased. A new scout has landed.");
  persist();
  render();
});
window.addEventListener("pagehide", () => { synchronize(); persist(); });
document.addEventListener("visibilitychange", () => {
  if (document.visibilityState === "hidden") { synchronize(); persist(); }
});

createUpgradeButtons();
render();
if (initial.recovered) notice("The saved game was incompatible or unreadable; a new lineage has begun.");
else if (initial.offlineSeconds >= 10) notice("Your swarm continued spreading during " + Math.round(initial.offlineSeconds / 60) + " minutes away (up to six hours).");
setInterval(() => {
  synchronize();
  render();
  if (Date.now() - lastSaved >= 5000) persist();
}, 1000);
