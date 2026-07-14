// Configurações e constantes da aplicação.

export const CONFIG = {
  // Centro e zoom iniciais do mapa (São Paulo).
  defaultCenter: [-23.5505, -46.6333],
  defaultZoom: 13,

  // Distância (em pixels) do 1º ponto para considerar que o polígono foi fechado.
  closePolygonPx: 15,

  // Quantas horas de previsão exibir no painel.
  forecastHours: 6,

  tiles: {
    light: {
      url: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
      options: { attribution: '© OpenStreetMap', maxZoom: 19 },
    },
    dark: {
      url: 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png',
      options: { attribution: '© OpenStreetMap © CARTO', maxZoom: 19 },
    },
  },
};

// Código WMO -> descrição legível (usado pela API Open-Meteo).
export const WEATHER_CODES = {
  0: '☀️ Céu limpo',
  1: '🌤 Predomínio de sol',
  2: '⛅ Parcialmente nublado',
  3: '☁️ Nublado',
  45: '🌫 Nevoeiro',
  48: '🌫 Nevoeiro com geada',
  51: '🌦 Garoa fraca',
  53: '🌦 Garoa',
  55: '🌧 Garoa intensa',
  56: '🌧 Garoa congelante',
  57: '🌧 Garoa congelante intensa',
  61: '🌧 Chuva fraca',
  63: '🌧 Chuva',
  65: '🌧 Chuva forte',
  66: '🌧 Chuva congelante',
  67: '🌧 Chuva congelante forte',
  71: '🌨 Neve fraca',
  73: '🌨 Neve',
  75: '❄️ Neve forte',
  77: '❄️ Granizo de neve',
  80: '🌦 Pancadas fracas',
  81: '🌧 Pancadas de chuva',
  82: '⛈ Pancadas fortes',
  85: '🌨 Pancadas de neve',
  86: '🌨 Pancadas de neve fortes',
  95: '⛈ Tempestade',
  96: '⛈ Tempestade com granizo',
  99: '⛈ Tempestade com granizo forte',
};

export function descreverClima(codigo) {
  return WEATHER_CODES[codigo] ?? '—';
}
