import { advance, createGame, MAX_OFFLINE_SECONDS, migrateLegacyGame, validSave } from "./game.js";

export const SAVE_KEY = "we-are-incremental:v3";
export const PREVIOUS_SAVE_KEY = "we-are-incremental:v2";
export const LEGACY_SAVE_KEY = "we-are-incremental:v1";

export function restore(serialized, now = Date.now()) {
  if (!serialized) return { state: createGame(now), offlineSeconds: 0, recovered: false };
  try {
    const parsed = JSON.parse(serialized);
    const migrated = migrateLegacyGame(parsed);
    const saved = migrated || parsed;
    if (!validSave(saved)) throw new Error("Invalid or incompatible save");
    const elapsed = Math.min(MAX_OFFLINE_SECONDS, Math.max(0, (now - saved.updatedAt) / 1000));
    return { state: { ...advance(saved, elapsed), updatedAt: now }, offlineSeconds: elapsed, recovered: false, migrated: !!migrated };
  } catch {
    return { state: createGame(now), offlineSeconds: 0, recovered: true };
  }
}

export function loadGame(now = Date.now()) {
  try {
    const saved = window.localStorage.getItem(SAVE_KEY) ??
      window.localStorage.getItem(PREVIOUS_SAVE_KEY) ??
      window.localStorage.getItem(LEGACY_SAVE_KEY);
    return restore(saved, now);
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
    window.localStorage.removeItem(PREVIOUS_SAVE_KEY);
    window.localStorage.removeItem(LEGACY_SAVE_KEY);
    return true;
  } catch {
    return false;
  }
}
