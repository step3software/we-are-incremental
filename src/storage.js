import { advance, createGame, MAX_OFFLINE_SECONDS, validSave } from "./game.js";

export const SAVE_KEY = "we-are-incremental:v1";

export function restore(serialized, now = Date.now()) {
  if (!serialized) return { state: createGame(now), offlineSeconds: 0, recovered: false };
  try {
    const parsed = JSON.parse(serialized);
    if (!validSave(parsed)) throw new Error("Invalid or incompatible save");
    const elapsed = Math.min(MAX_OFFLINE_SECONDS, Math.max(0, (now - parsed.updatedAt) / 1000));
    return { state: { ...advance(parsed, elapsed), updatedAt: now }, offlineSeconds: elapsed, recovered: false };
  } catch {
    return { state: createGame(now), offlineSeconds: 0, recovered: true };
  }
}

export function loadGame(now = Date.now()) {
  try {
    return restore(window.localStorage.getItem(SAVE_KEY), now);
  } catch {
    return { state: createGame(now), offlineSeconds: 0, recovered: true };
  }
}

export function saveGame(state, now = Date.now()) {
  try {
    window.localStorage.setItem(SAVE_KEY, JSON.stringify({ ...state, updatedAt: now }));
    return true;
  } catch {
    return false;
  }
}

export function deleteSave() {
  try {
    window.localStorage.removeItem(SAVE_KEY);
    return true;
  } catch {
    return false;
  }
}
