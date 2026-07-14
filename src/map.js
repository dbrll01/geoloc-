// Camada de mapa: inicializa o Leaflet, mantém as camadas base (claro/escuro)
// e redesenha marcadores e traçado reagindo ao estado.

import { CONFIG } from './config.js';
import { isClosedPolygon } from './geo.js';
import {
  getState,
  subscribe,
  updatePoint,
  removePoint,
  setOrigin,
  closePolygon,
} from './state.js';

export function createMap() {
  // zoomAnimation desativada: em alguns ambientes o evento transitionend
  // não dispara e o zoom animado trava, deixando os controles +/− mortos.
  // O zoom instantâneo funciona em qualquer ambiente.
  const map = L.map('map', { zoomAnimation: false })
    .setView(CONFIG.defaultCenter, CONFIG.defaultZoom);

  const camadaClara = L.tileLayer(CONFIG.tiles.light.url, CONFIG.tiles.light.options);
  const camadaEscura = L.tileLayer(CONFIG.tiles.dark.url, CONFIG.tiles.dark.options);
  camadaClara.addTo(map);

  const overlay = L.layerGroup().addTo(map);   // linha / polígono
  const marcadores = L.layerGroup().addTo(map); // pinos

  function desenharTracado(points) {
    overlay.clearLayers();
    const coords = points.map((p) => [p.lat, p.lng]);
    if (isClosedPolygon(points)) {
      L.polygon(coords, {
        color: 'green',
        fillColor: '#90ee90',
        fillOpacity: 0.4,
      }).addTo(overlay);
    } else if (points.length > 1) {
      L.polyline(coords, { color: '#2196F3', weight: 3 }).addTo(overlay);
    }
  }

  function desenharMarcadores(points, originIndex) {
    marcadores.clearLayers();
    points.forEach((p, index) => {
      const marker = L.marker([p.lat, p.lng], { draggable: true }).addTo(marcadores);

      marker.on('dragend', () => {
        const pos = marker.getLatLng();
        updatePoint(index, pos.lat, pos.lng);
      });

      marker.bindPopup(criarPopup(index, index === originIndex));
    });
  }

  function criarPopup(index, isOrigem) {
    const div = document.createElement('div');

    const btnOrigem = document.createElement('button');
    btnOrigem.textContent = isOrigem ? '★ É a origem' : 'Definir como origem';
    btnOrigem.disabled = isOrigem;
    btnOrigem.onclick = () => setOrigin(index);

    div.append(btnOrigem);

    // No 1º ponto, com 3+ pontos e traçado aberto, oferece fechar o polígono.
    const { points } = getState();
    if (index === 0 && points.length >= 3 && !isClosedPolygon(points)) {
      const btnFechar = document.createElement('button');
      btnFechar.textContent = '⬠ Fechar polígono';
      btnFechar.onclick = () => closePolygon();
      div.append(btnFechar);
    }

    const btnExcluir = document.createElement('button');
    btnExcluir.textContent = 'Excluir ponto';
    btnExcluir.onclick = () => removePoint(index);

    div.append(btnExcluir);
    return div;
  }

  // Um único ponto de renderização reagindo ao estado (pontos).
  subscribe((state) => {
    desenharMarcadores(state.points, state.originIndex);
    desenharTracado(state.points);
  });

  return {
    map,

    setDark(on) {
      if (on) {
        map.removeLayer(camadaClara);
        camadaEscura.addTo(map);
      } else {
        map.removeLayer(camadaEscura);
        camadaClara.addTo(map);
      }
    },

    /** True se o clique caiu perto o bastante do 1º ponto para fechar o polígono. */
    perturbaFechamento(latlng) {
      const { points } = getState();
      if (points.length < 3 || isClosedPolygon(points)) return false;
      const pInicial = map.latLngToContainerPoint([points[0].lat, points[0].lng]);
      const pClique = map.latLngToContainerPoint(latlng);
      return pInicial.distanceTo(pClique) < CONFIG.closePolygonPx;
    },

    flyTo(lat, lng, zoom = 15) {
      map.setView([lat, lng], zoom);
    },
  };
}
