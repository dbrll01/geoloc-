const map = L.map('map').setView([-23.5505, -46.6333], 13);
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
  attribution: '© OpenStreetMap'
}).addTo(map);

const pontos = [];
const marcadores = [];
let linha = null;
let poligono = null;
let origemIndex = null;

const listaCoords = document.getElementById("coord-list");
const resultadoDiv = document.getElementById("resultado");

function atualizarVisualizacao() {
  if (linha) map.removeLayer(linha);
  if (poligono) map.removeLayer(poligono);

  if (pontos.length > 1) {
    linha = L.polyline(pontos.map(p => [p.lat, p.lng]), { color: 'blue', weight: 3 }).addTo(map);
  }

  const primeiro = pontos[0];
  const ultimo = pontos[pontos.length - 1];
  if (pontos.length >= 4 && primeiro.lat === ultimo.lat && primeiro.lng === ultimo.lng) {
    poligono = L.polygon(pontos.map(p => [p.lat, p.lng]), {
      color: 'green',
      fillColor: '#90ee90',
      fillOpacity: 0.4
    }).addTo(map);
  }
}

function adicionarCoordenada(lat, lng, isFechamento = false) {
  const coord = { lat: Number(lat.toFixed(6)), lng: Number(lng.toFixed(6)) };
  const index = pontos.length;
  pontos.push(coord);

  const marcador = L.marker([coord.lat, coord.lng], { draggable: false }).addTo(map);

  marcador.on('click', () => {
    const popupContent = document.createElement("div");

    const btnOrigem = document.createElement("button");
    btnOrigem.textContent = "Marcar como Origem";
    btnOrigem.onclick = () => {
      origemIndex = index;
      atualizarMarcadores();
      marcador.closePopup();
    };

    const btnMover = document.createElement("button");
    btnMover.textContent = "Mover Marcador";
    btnMover.onclick = () => {
      marcador.dragging.enable();
      marcador.closePopup();
    };

    popupContent.appendChild(btnOrigem);
    popupContent.appendChild(document.createElement("br"));
    popupContent.appendChild(btnMover);
    marcador.bindPopup(popupContent).openPopup();
  });

  marcador.on('dragend', () => {
    const pos = marcador.getLatLng();
    pontos[index] = { lat: pos.lat, lng: pos.lng };
    atualizarVisualizacao();
    atualizarLista();
  });

  marcadores.push(marcador);
  atualizarLista();
  atualizarVisualizacao();
}

function atualizarMarcadores() {
  marcadores.forEach((m, idx) => {
    if (idx === origemIndex) {
      m.bindPopup("Origem").openPopup();
    }
  });
}

function atualizarLista() {
  listaCoords.innerHTML = "";
  pontos.forEach((p, i) => {
    const li = document.createElement("li");
    const label = (i === origemIndex) ? " (origem)" : "";
    li.textContent = `Ponto ${i + 1}: ${p.lat}, ${p.lng}${label} `;

    const btnDel = document.createElement("button");
    btnDel.textContent = "Excluir";
    btnDel.onclick = () => removerPonto(i);

    li.appendChild(btnDel);
    listaCoords.appendChild(li);
  });
}

function removerPonto(index) {
  if (index < 0 || index >= pontos.length) return;
  pontos.splice(index, 1);
  map.removeLayer(marcadores[index]);
  marcadores.splice(index, 1);

  if (origemIndex === index) origemIndex = null;
  else if (index < origemIndex) origemIndex--;

  atualizarLista();
  atualizarVisualizacao();
}

function limparPontos() {
  pontos.length = 0;
  listaCoords.innerHTML = "";
  resultadoDiv.textContent = "";
  origemIndex = null;
  marcadores.forEach(m => map.removeLayer(m));
  marcadores.length = 0;
  if (linha) map.removeLayer(linha);
  if (poligono) map.removeLayer(poligono);
  linha = null;
  poligono = null;
}

function distanciaHaversine(lat1, lon1, lat2, lon2) {
  const R = 6371e3;
  const φ1 = lat1 * Math.PI / 180;
  const φ2 = lat2 * Math.PI / 180;
  const Δφ = (lat2 - lat1) * Math.PI / 180;
  const Δλ = (lon2 - lon1) * Math.PI / 180;
  const a = Math.sin(Δφ/2)**2 + Math.cos(φ1)*Math.cos(φ2)*Math.sin(Δλ/2)**2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
}

function calcularDistancia() {
  if (pontos.length < 2) {
    resultadoDiv.textContent = "Adicione ao menos dois pontos.";
    return;
  }
  let total = 0;
  for (let i = 0; i < pontos.length - 1; i++) {
    total += distanciaHaversine(pontos[i].lat, pontos[i].lng, pontos[i+1].lat, pontos[i+1].lng);
  }
  const km = (total / 1000).toFixed(3);
  const m = total.toFixed(2);
  resultadoDiv.textContent = `Distância total: ${km} km (${m} metros)`;
}

function calcularArea() {
  if (pontos.length < 4) {
    resultadoDiv.textContent = "Feche o polígono com pelo menos 3 lados (4 pontos).";
    return;
  }
  const turfCoords = pontos.map(p => [p.lng, p.lat]);
  const polygon = turf.polygon([turfCoords]);
  const area_m2 = turf.area(polygon);
  const area_ha = area_m2 / 10000;
  resultadoDiv.textContent = `Área do polígono: ${area_m2.toFixed(2)} m² (${area_ha.toFixed(4)} ha)`;
}

document.addEventListener('keydown', (event) => {
  const isCtrlZ = (event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'z';
  const isDelete = event.key === 'Delete';
  if ((isCtrlZ || isDelete) && pontos.length > 0) {
    removerPonto(pontos.length - 1);
    event.preventDefault();
  }
});

map.on("click", (e) => {
  const novaLat = Number(e.latlng.lat.toFixed(6));
  const novaLng = Number(e.latlng.lng.toFixed(6));
  const novoPonto = { lat: novaLat, lng: novaLng };
  if (pontos.length >= 3) {
    const pontoInicial = pontos[0];
    const dist = distanciaHaversine(pontoInicial.lat, pontoInicial.lng, novoPonto.lat, novoPonto.lng);
    if (dist < 5) {
      adicionarCoordenada(pontoInicial.lat, pontoInicial.lng, true);
      return;
    }
  }
  adicionarCoordenada(novaLat, novaLng);
});
