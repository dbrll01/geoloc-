// Consulta clima (Open-Meteo) e nome da cidade (Nominatim).
// Ambas as APIs são gratuitas e não exigem chave.

import { CONFIG, descreverClima } from './config.js';
import { nomeDaCidade } from './geocode.js';

let controladorAtual = null;

/**
 * Busca clima atual + previsão horária e o nome da cidade de uma coordenada.
 * Cancela automaticamente a requisição anterior ainda pendente.
 *
 * @returns {Promise<{ cidade, temperatura, descricao, horas: Array<{hora, temp}> }>}
 */
export async function buscarClima(lat, lng) {
  if (controladorAtual) controladorAtual.abort();
  controladorAtual = new AbortController();
  const { signal } = controladorAtual;

  const urlClima =
    `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lng}` +
    '&current=temperature_2m,weather_code&hourly=temperature_2m' +
    '&forecast_days=2&timezone=auto';

  const respClima = await fetch(urlClima, { signal });
  if (!respClima.ok) throw new Error(`Open-Meteo respondeu ${respClima.status}`);
  const clima = await respClima.json();

  return {
    cidade: await nomeDaCidade(lat, lng, signal),
    temperatura: Math.round(clima.current.temperature_2m),
    descricao: descreverClima(clima.current.weather_code),
    horas: proximasHoras(clima.hourly),
  };
}

/** Extrai as próximas N horas de previsão a partir de agora. */
function proximasHoras(hourly) {
  const agora = new Date();
  return hourly.time
    .map((t, i) => ({ hora: new Date(t), temp: hourly.temperature_2m[i] }))
    .filter((h) => h.hora >= agora)
    .slice(0, CONFIG.forecastHours)
    .map((h) => ({
      hora: String(h.hora.getHours()).padStart(2, '0'),
      temp: Math.round(h.temp),
    }));
}
