// Ponto de entrada: conecta mapa, estado, interface e clima.

import { createMap } from './map.js';
import {
  createUI,
  mostrarClima,
  mostrarClimaCarregando,
  mostrarClimaErro,
} from './ui.js';
import {
  getState,
  addPoint,
  setOrigin,
  clearPoints,
  removeLast,
  setHeatmap,
} from './state.js';
import { parseCoord } from './geo.js';
import { buscarClima } from './weather.js';

const mapa = createMap();
const ui = createUI({ onLimpar: clearPoints });

async function carregarClima(lat, lng) {
  mostrarClimaCarregando();
  try {
    const dados = await buscarClima(Number(lat.toFixed(4)), Number(lng.toFixed(4)));
    mostrarClima(dados);
  } catch (err) {
    if (err.name !== 'AbortError') mostrarClimaErro();
  }
}

// Clique no mapa: fecha o polígono se estiver perto do início, senão marca ponto.
mapa.map.on('click', (e) => {
  const { lat, lng } = e.latlng;
  if (mapa.perturbaFechamento(e.latlng)) {
    const inicial = getState().points[0];
    addPoint(inicial.lat, inicial.lng);
    return;
  }
  addPoint(lat, lng);
  carregarClima(lat, lng);
});

// "Ir" para uma coordenada digitada.
document.getElementById('btnIrOrigem').addEventListener('click', () => {
  const coord = parseCoord(document.getElementById('inputOrigem').value);
  if (!coord) {
    ui.setResultado('Coordenada inválida. Use o formato: -23.5505,-46.6333');
    return;
  }
  mapa.flyTo(coord.lat, coord.lng);
  addPoint(coord.lat, coord.lng);
  setOrigin(getState().points.length - 1);
  carregarClima(coord.lat, coord.lng);
});

// Permite pressionar Enter no campo de coordenada.
document.getElementById('inputOrigem').addEventListener('keydown', (e) => {
  if (e.key === 'Enter') document.getElementById('btnIrOrigem').click();
});

// Modo noturno e mapa térmico.
document.getElementById('modoNoturno').addEventListener('change', (e) => {
  mapa.setDark(e.target.checked);
});
document.getElementById('heatmapToggle').addEventListener('change', (e) => {
  setHeatmap(e.target.checked);
});

// Ctrl+Z / Delete desfaz o último ponto.
document.addEventListener('keydown', (e) => {
  const desfazer = (e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'z';
  const apagar = e.key === 'Delete';
  if ((desfazer || apagar) && getState().points.length > 0) {
    removeLast();
    e.preventDefault();
  }
});
