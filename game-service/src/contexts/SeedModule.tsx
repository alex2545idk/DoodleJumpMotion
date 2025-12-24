// src/contexts/SeedModule.tss  (или просто модуль)
export const GAME_SEED =
  (typeof window !== "undefined" ? (window as any).GAME_SEED : 0) ?? 0;

export const USER_ID =
  (typeof window !== "undefined" ? (window as any).USER_ID : 0) ?? 0;

const PARENT_ORIGIN =
  process.env.EXPO_PUBLIC_PARENT_ORIGIN || "http://localhost:3000";

// когда счёт изменился
export function publishScore(score: number) {
  window.parent.postMessage({ type: "score", value: score }, PARENT_ORIGIN);
}

export function publishDeath(userId: number) {
  window.parent.postMessage({ type: "death", value: userId }, PARENT_ORIGIN);
}
