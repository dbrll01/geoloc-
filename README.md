# GEOLOC — Interactive Map & Weather Tool

An interactive web application to measure distances and areas directly on a map using precise geographic coordinates (up to 6 decimal places). It also shows the current temperature, weather conditions and an hourly forecast for the clicked location — **no API key required**.

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![Stack](https://img.shields.io/badge/stack-Vanilla%20JS%20(ES%20Modules)-f7df1e.svg)

## Features

- Click anywhere on the map to place a marker (drag to reposition)
- Measure the total distance / perimeter between points
- Draw polygons — click the first marker and choose "Fechar polígono" (or click near it) — and measure area (m² and hectares)
- Real-time temperature, conditions and hourly forecast for the clicked spot
- Automatic city name via reverse geocoding
- Jump to any coordinate by typing `lat,lng`
- Night mode (dark map tiles)
- Undo the last point with `Ctrl+Z` or `Delete`
- Responsive layout

## Architecture

Plain HTML/CSS/JS, no build step. The app logic is split into ES modules by responsibility:

```
geoloc/
├── index.html          # markup + CDN libraries
├── css/
│   └── styles.css
└── src/
    ├── config.js       # constants, tile URLs, weather-code table
    ├── geo.js          # pure geo math (haversine, area, coord parsing)
    ├── state.js        # central state + publish/subscribe
    ├── map.js          # Leaflet map, base layers, markers
    ├── weather.js      # Open-Meteo current + hourly forecast
    ├── geocode.js      # Nominatim forward + reverse geocoding
    ├── ui.js           # point list, results, weather panel
    └── main.js         # wires everything together
```

State lives in `state.js`; the map and the UI **subscribe** to it and re-render on change, so there's a single source of truth and no manual index juggling.

## Technologies

- [Leaflet.js](https://leafletjs.com/) – interactive maps
- [OpenStreetMap](https://www.openstreetmap.org/) / [CARTO](https://carto.com/) – map tiles (light / dark)
- [Turf.js](https://turfjs.org/) – area calculation
- [Open-Meteo](https://open-meteo.com/) – weather & hourly forecast (free, no key)
- [Nominatim](https://nominatim.org/) – forward & reverse geocoding

## Running Locally

Because it uses ES modules, open it through a local server (not `file://`):

```bash
git clone <your-repo-url>
cd geoloc
npx serve .
```

Then open the printed URL (e.g. `http://localhost:3000`).

## Usage

1. **Mark points** — click on the map; each point appears in the sidebar.
2. **Measure distance** — add 2+ points and press **📏 Distância**.
3. **Measure area** — add 3+ points, click the first marker and choose **"Fechar polígono"** (clicking near the first point also closes it), then press **⬠ Área**.
4. **Check the weather** — the sidebar updates on every click with city, temperature and the next hours.
5. **Move a point** — drag its marker. **Delete** a point from its popup or the list.

## License

Licensed under the [MIT License](LICENSE).
