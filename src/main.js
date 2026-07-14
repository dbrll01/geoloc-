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
import { buscarEndereco } from './geocode.js';

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

// Marca o local buscado no mapa, define como origem e carrega o clima.
function irPara(lat, lng) {
  mapa.flyTo(lat, lng);
  addPoint(lat, lng);
  setOrigin(getState().points.length - 1);
  carregarClima(lat, lng);
}

// "Ir": aceita uma coordenada "lat,lng" OU um endereço / nome de lugar.
async function buscar() {
  const texto = document.getElementById('inputOrigem').value.trim();
  if (!texto) return;

  // 1) Tenta interpretar como coordenada direta.
  const coord = parseCoord(texto);
  if (coord) {
    irPara(coord.lat, coord.lng);
    return;
  }

  // 2) Caso contrário, trata como endereço e geocodifica.
  ui.setResultado('Buscando endereço…');
  try {
    const lugar = await buscarEndereco(texto);
    if (!lugar) {
      ui.setResultado('Endereço não encontrado. Tente ser mais específico.');
      return;
    }
    ui.setResultado(lugar.nome);
    irPara(lugar.lat, lugar.lng);
  } catch (err) {
    ui.setResultado('Falha na busca de endereço. Tente novamente.');
  }
}

document.getElementById('btnIrOrigem').addEventListener('click', buscar);

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
