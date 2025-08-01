# GeoMap Weather Tool

An interactive web application to calculate distances and areas directly on a map using precise geographic coordinates (up to 6 decimal places). It also shows the current temperature and provides hourly weather forecasts based on the clicked location.

---

## 🌐 Features

- Click anywhere on the map to place a marker.
- Calculate distance between multiple points.
- Calculate area of polygons drawn on the map.
- Display real-time temperature at the selected location.
- Show hourly weather forecast (optional).
- High precision with 6-digit latitude/longitude.
- Fully interactive map using Leaflet.js and OpenStreetMap.

# Technologies Used

- [Leaflet.js](https://leafletjs.com/) – interactive maps
- [OpenStreetMap](https://www.openstreetmap.org/) – map tiles
- [Turf.js](https://turfjs.org/) – geospatial calculations (distance/area)
- [OpenWeatherMap API](https://openweathermap.org/) – real-time weather
- [Nominatim API](https://nominatim.org/release-docs/develop/api/Reverse/) – reverse geocoding (get city name from coordinates)

#How to Run Locally

1. Clone this repository:

   ```bash
   git clone https://github.com/<your_username>/geo-map-weather-tool.git
   cd geo-map-weather-tool
