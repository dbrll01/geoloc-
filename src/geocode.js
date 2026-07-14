// Geocodificação via Nominatim (OpenStreetMap), gratuita e sem chave.
//  - buscarEndereco: texto/endereço -> coordenada  (forward)
//  - nomeDaCidade:   coordenada     -> nome         (reverse)

/**
 * Converte um endereço ou nome de lugar em coordenada.
 * @returns {Promise<{ lat, lng, nome } | null>} null se nada for encontrado.
 */
export async function buscarEndereco(query, signal) {
  const url =
    'https://nominatim.openstreetmap.org/search?format=jsonv2&limit=1' +
    `&accept-language=pt-BR&q=${encodeURIComponent(query)}`;

  const resp = await fetch(url, { signal });
  if (!resp.ok) throw new Error(`Nominatim respondeu ${resp.status}`);

  const resultados = await resp.json();
  if (!resultados.length) return null;

  const r = resultados[0];
  return {
    lat: parseFloat(r.lat),
    lng: parseFloat(r.lon),
    nome: r.display_name,
  };
}

/**
 * Geocodificação reversa: coordenada -> nome de cidade.
 * Falhas não devem derrubar quem chama; devolve as coordenadas formatadas.
 */
export async function nomeDaCidade(lat, lng, signal) {
  const fallback = `${lat.toFixed(4)}, ${lng.toFixed(4)}`;
  try {
    const url =
      'https://nominatim.openstreetmap.org/reverse?format=jsonv2' +
      `&lat=${lat}&lon=${lng}&zoom=10&accept-language=pt-BR`;
    const resp = await fetch(url, { signal });
    if (!resp.ok) return fallback;
    const lugar = await resp.json();
    const a = lugar.address || {};
    return a.city || a.town || a.village || a.municipality || lugar.name || fallback;
  } catch (err) {
    if (err.name === 'AbortError') throw err;
    return fallback;
  }
}
