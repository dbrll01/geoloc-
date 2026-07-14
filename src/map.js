// Camada de mapa: inicializa o Leaflet, mantém as camadas base (claro/escuro),
// e redesenha marcadores, traçado e mapa térmico reagindo ao estado.

import { CONFIG } from './config.js';
import { isClosedPolygon } from './geo.js';
import {
  getState,
  subscribe,
  updatePoint,
  removePoint,
  setOrigin,
} from './state.js';

export function createMap() {
  const map = L.map('map').setView(CONFIG.defaultCenter, CONFIG.defaultZoom);

  const camadaClara = L.tileLayer(CONFIG.tiles.light.url, CONFIG.tiles.light.options);
  const camadaEscura = L.tileLayer(CONFIG.tiles.dark.url, CONFIG.tiles.dark.options);
  camadaClara.addTo(map);

  const overlay = L.layerGroup().addTo(map);   // linha / polígono
  const marcadores = L.layerGroup().addTo(map); // pinos
  let heat = null;

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

    const btnExcluir = document.createElement('button');
    btnExcluir.textContent = 'Excluir ponto';
    btnExcluir.onclick = () => removePoint(index);

    div.append(btnOrigem, btnExcluir);
    return div;
  }

  function desenharHeatmap(points, ligado) {
    if (heat) {
      map.removeLayer(heat);
      heat = null;
    }
    if (!ligado || points.length === 0) return;
    heat = L.heatLayer(
      points.map((p) => [p.lat, p.lng, 1]),
      CONFIG.heatmap,
    ).addTo(map);
  }

  // Um único ponto de renderização reagindo ao estado.
  subscribe((state) => {
    desenharMarcadores(state.points, state.originIndex);
    desenharTracado(state.points);
    desenharHeatmap(state.points, state.heatmapOn);
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
