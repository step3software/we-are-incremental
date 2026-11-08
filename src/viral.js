// Simplified, intentionally fictionalized within-carrier viral replication.
// Deterministic second-by-second simulation; no player click generates particles.
export const VIRAL_CELLS = 1200;
export const VIRAL_LATENCY_SECONDS = 10;
export const VIRAL_TRANSMISSION_VIRIONS = 400;
export const VIRAL_TRANSMISSION_CELLS = 40;

const CONTACTS_PER_VIRION = 0.16;
const PRODUCTION_PER_CELL = 2.1;
const FREE_VIRION_CLEARANCE = 0.02;
const PRODUCER_LOSS = 0.012;
const TISSUE_RENEWAL = 0.002;

export function createViralState() {
  return {
    virions: 1,
    latent: Array(VIRAL_LATENCY_SECONDS).fill(0),
    producingCells: 0,
    exhaustedCells: 0,
    contactCredit: 0,
    productionCredit: 0,
    clearanceCredit: 0,
    lossCredit: 0,
    repairCredit: 0,
    transmissionReady: false,
    remainder: 0
  };
}

export function infectedCells(viral) {
  return viral.producingCells + viral.latent.reduce((total, count) => total + count, 0);
}

export function healthyCells(viral) {
  return Math.max(0, VIRAL_CELLS - infectedCells(viral) - viral.exhaustedCells);
}

export function canTransmit(viral) {
  return viral.transmissionReady === true ||
    (viral.virions >= VIRAL_TRANSMISSION_VIRIONS &&
    infectedCells(viral) >= VIRAL_TRANSMISSION_CELLS);
}

export function advanceViral(current, seconds) {
  const next = { ...current, latent: [...current.latent],
    repairCredit: current.repairCredit ?? 0,
    transmissionReady: current.transmissionReady === true };
  if (!Number.isFinite(seconds) || seconds <= 0) return next;
  const time = current.remainder + Math.min(6 * 60 * 60, seconds);
  const ticks = Math.floor(time);
  next.remainder = time - ticks;

  for (let i = 0; i < ticks; i++) {
    // Previously infected cells become productive only after an incubation delay.
    const matured = next.latent.shift();
    next.producingCells += matured;

    // Each successful infection consumes one free virion and one healthy cell.
    next.contactCredit += next.virions * CONTACTS_PER_VIRION;
    const contacts = Math.floor(next.contactCredit);
    const entering = Math.min(contacts, next.virions, healthyCells(next));
    next.virions -= entering;
    next.latent.push(entering);
    next.contactCredit = healthyCells(next) === 0 ? 0 :
      Math.min(0.999999, next.contactCredit - entering);

    // Active infected cells synthesize particles; free particles may be cleared.
    next.productionCredit += next.producingCells * PRODUCTION_PER_CELL;
    const released = Math.floor(next.productionCredit);
    next.productionCredit -= released;
    next.virions += released;

    next.clearanceCredit += next.virions * FREE_VIRION_CLEARANCE;
    const cleared = Math.min(next.virions, Math.floor(next.clearanceCredit));
    next.virions -= cleared;
    next.clearanceCredit -= cleared;

    // Eventually, infected cells are spent and cannot be reinfected.
    next.lossCredit += next.producingCells * PRODUCER_LOSS;
    const lost = Math.min(next.producingCells, Math.floor(next.lossCredit));
    next.producingCells -= lost;
    next.exhaustedCells += lost;
    next.lossCredit -= lost;

    // Living tissue replenishes: a chronic infection must not permanently
    // exhaust every available cell and lock the first run.
    next.repairCredit += next.exhaustedCells * TISSUE_RENEWAL;
    const renewed = Math.min(next.exhaustedCells, Math.floor(next.repairCredit));
    next.exhaustedCells -= renewed;
    next.repairCredit -= renewed;

    // Once transmission has been established, the player may always advance,
    // including after a long offline interval or a temporary dip in viral load.
    if (next.virions >= VIRAL_TRANSMISSION_VIRIONS &&
        infectedCells(next) >= VIRAL_TRANSMISSION_CELLS) {
      next.transmissionReady = true;
    }
  }
  return next;
}

export function validViralState(v) {
  if (!v || typeof v !== "object" || !Array.isArray(v.latent) ||
      v.latent.length !== VIRAL_LATENCY_SECONDS) return false;
  const boundedInt = number => Number.isSafeInteger(number) && number >= 0 && number <= 1_000_000_000;
  const fraction = number => Number.isFinite(number) && number >= 0 && number < 1;
  if (![v.virions, v.producingCells, v.exhaustedCells, ...v.latent].every(boundedInt)) return false;
  if (![v.contactCredit, v.productionCredit, v.clearanceCredit, v.lossCredit, v.remainder,
    v.repairCredit ?? 0].every(fraction)) return false;
  if (v.transmissionReady !== undefined && typeof v.transmissionReady !== "boolean") return false;
  return infectedCells(v) + v.exhaustedCells <= VIRAL_CELLS;
}
