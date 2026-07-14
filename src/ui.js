// Camada de interface: renderiza a lista de pontos e o painel de clima,
// e liga os botões/eventos às ações. Não conhece o Leaflet diretamente.

import { subscribe, getState, removePoint } from './state.js';
import { pathDistance, polygonArea, isClosedPolygon } from './geo.js';

const $ = (id) => document.getElementById(id);

export function createUI({ onLimpar }) {
  const listaEl = $('coord-list');
  const resultadoEl = $('resultado');

  // Renderiza a lista de pontos a cada mudança de estado.
  subscribe((state) => {
    listaEl.innerHTML = '';
    state.points.forEach((p, i) => {
      const li = document.createElement('li');
      const estrela = i === state.originIndex ? ' ★' : '';
      li.append(document.createTextNode(`${i + 1}: ${p.lat}, ${p.lng}${estrela} `));

      const btn = document.createElement('button');
      btn.textContent = '✕';
      btn.title = 'Excluir ponto';
      btn.onclick = () => removePoint(i);

      li.append(btn);
      listaEl.append(li);
    });
  });

  const setResultado = (texto) => { resultadoEl.textContent = texto; };

  $('btnDistancia').addEventListener('click', () => {
    const { points } = getState();
    if (points.length < 2) return setResultado('Adicione ao menos dois pontos.');
    const metros = pathDistance(points);
    const rotulo = isClosedPolygon(points) ? 'Perímetro' : 'Distância total';
    setResultado(`${rotulo}: ${(metros / 1000).toFixed(3)} km (${metros.toFixed(2)} m)`);
  });

  $('btnArea').addEventListener('click', () => {
    const { points } = getState();
    if (!isClosedPolygon(points)) {
      return setResultado('Feche o polígono clicando perto do 1º ponto (mín. 3 lados).');
    }
    const { m2, ha } = polygonArea(points);
    setResultado(`Área: ${m2.toFixed(2)} m² (${ha.toFixed(4)} ha)`);
  });

  $('btnLimpar').addEventListener('click', () => {
    onLimpar();
    setResultado('');
  });

  return { setResultado };
}

// ----- Painel de clima -----
export function mostrarClimaCarregando() {
  $('infoClima').hidden = false;
  $('climaCidade').textContent = 'Carregando…';
  $('climaTemp').textContent = '—';
  $('climaDesc').textContent = '';
  $('previsaoHoras').innerHTML = '';
}

export function mostrarClima({ cidade, temperatura, descricao, horas }) {
  $('infoClima').hidden = false;
  $('climaCidade').textContent = cidade;
  $('climaTemp').textContent = `${temperatura}°C`;
  $('climaDesc').textContent = descricao;

  const previsao = $('previsaoHoras');
  previsao.innerHTML = '';
  horas.forEach((h) => {
    const div = document.createElement('div');
    div.className = 'hora-item';
    div.innerHTML = `<span>${h.hora}h</span><strong>${h.temp}°</strong>`;
    previsao.append(div);
  });
}

export function mostrarClimaErro() {
  $('infoClima').hidden = false;
  $('climaCidade').textContent = 'Clima indisponível';
  $('climaTemp').textContent = '—';
  $('climaDesc').textContent = '';
  $('previsaoHoras').innerHTML = '';
}
