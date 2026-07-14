// Funções geográficas puras (sem dependência do DOM ou do mapa).
// A única dependência externa é o Turf.js (global `turf`) para cálculo de área.

/** Arredonda para 6 casas decimais (~0,11 m de precisão). */
export const round6 = (n) => Number(n.toFixed(6));

/**
 * Distância em metros entre dois pontos {lat, lng} pela fórmula de Haversine.
 */
export function haversine(a, b) {
  const R = 6371e3; // raio médio da Terra, em metros
  const rad = Math.PI / 180;
  const f1 = a.lat * rad;
  const f2 = b.lat * rad;
  const df = (b.lat - a.lat) * rad;
  const dl = (b.lng - a.lng) * rad;
  const h =
    Math.sin(df / 2) ** 2 +
    Math.cos(f1) * Math.cos(f2) * Math.sin(dl / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(h), Math.sqrt(1 - h));
}

/** Soma das distâncias ao longo da sequência de pontos, em metros. */
export function pathDistance(points) {
  let total = 0;
  for (let i = 0; i < points.length - 1; i++) {
    total += haversine(points[i], points[i + 1]);
  }
  return total;
}

/** True quando o traçado forma um polígono fechado (1º ponto == último). */
export function isClosedPolygon(points) {
  if (points.length < 4) return false;
  const first = points[0];
  const last = points[points.length - 1];
  return first.lat === last.lat && first.lng === last.lng;
}

/** Área do polígono em m² e hectares, via Turf.js. */
export function polygonArea(points) {
  const ring = points.map((p) => [p.lng, p.lat]);
  const m2 = turf.area(turf.polygon([ring]));
  return { m2, ha: m2 / 10000 };
}

/**
 * Interpreta uma string "lat,lng" e devolve {lat, lng} válido, ou null.
 */
export function parseCoord(texto) {
  const partes = texto.split(',').map((s) => parseFloat(s.trim()));
  if (partes.length !== 2 || partes.some(Number.isNaN)) return null;
  const [lat, lng] = partes;
  if (Math.abs(lat) > 90 || Math.abs(lng) > 180) return null;
  return { lat, lng };
}
