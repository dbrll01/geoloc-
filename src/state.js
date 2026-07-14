// Estado central da aplicação com um padrão publish/subscribe simples.
// Quem desenha (mapa) e quem exibe a lista (ui) se inscrevem e reagem
// automaticamente a qualquer mudança nos pontos.

import { round6 } from './geo.js';

const listeners = new Set();

const state = {
  points: [],       // Array<{ lat, lng }>
  originIndex: null, // índice do ponto marcado como origem, ou null
  heatmapOn: false,
};

/** Registra um callback para mudanças de estado. Devolve função de cancelamento. */
export function subscribe(fn) {
  listeners.add(fn);
  return () => listeners.delete(fn);
}

function emit() {
  for (const fn of listeners) fn(state);
}

/** Snapshot somente-leitura do estado atual. */
export function getState() {
  return state;
}

export function addPoint(lat, lng) {
  state.points.push({ lat: round6(lat), lng: round6(lng) });
  emit();
}

export function updatePoint(index, lat, lng) {
  if (!state.points[index]) return;
  state.points[index] = { lat: round6(lat), lng: round6(lng) };
  emit();
}

export function removePoint(index) {
  if (index < 0 || index >= state.points.length) return;
  state.points.splice(index, 1);

  if (state.originIndex === index) state.originIndex = null;
  else if (state.originIndex !== null && index < state.originIndex) {
    state.originIndex--;
  }
  emit();
}

export function removeLast() {
  if (state.points.length > 0) removePoint(state.points.length - 1);
}

export function setOrigin(index) {
  state.originIndex = index;
  emit();
}

export function clearPoints() {
  state.points = [];
  state.originIndex = null;
  emit();
}

export function setHeatmap(on) {
  state.heatmapOn = on;
  emit();
}
