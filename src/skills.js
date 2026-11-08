// First-generation evolution. Transmission paths are mutually exclusive,
// planet-local adaptations that change autonomous spread, not click rewards.
import { canTransmit } from "./viral.js";

export const ORIGIN_MILESTONES = Object.freeze([
  { id: "entry", name: "Cell Entry", description: "The first cell was infected." },
  { id: "replication", name: "Replication", description: "Infected cells produce virions." },
  { id: "infectious", name: "Infectious Carrier", description: "The first host can transmit." }
]);

export const TRANSMISSION_SKILLS = Object.freeze([
  {
    id: "covert",
    name: "Silent Shedding",
    description: "Spread 20% slower, but provoke 50% less vigilance.",
    spreadMultiplier: 0.8,
    vigilanceMultiplier: 0.5,
    requires: "infectious"
  },
  {
    id: "surge",
    name: "Viral Surge",
    description: "Spread 50% faster, but provoke 50% more vigilance.",
    spreadMultiplier: 1.5,
    vigilanceMultiplier: 1.5,
    requires: "infectious"
  }
]);

export function getTransmissionSkill(id) {
  return TRANSMISSION_SKILLS.find(skill => skill.id === id) ?? null;
}

export function canAcquireTransmissionSkill(state, id) {
  return state.stage === "viral" &&
    canTransmit(state.viral) &&
    getTransmissionSkill(id) !== null;
}
