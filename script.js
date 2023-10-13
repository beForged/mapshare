// Define the Garmin KML URL
const garminKMLUrl = 'https://share.garmin.com/Feed/ShareLoader/44RUF';

// Create a Leaflet map centered at a specific location
const map = L.map('map').setView([51.505, -0.09], 13);

// Add the OpenStreetMap tile layer to the map
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '© OpenStreetMap contributors'
}).addTo(map);

// Fetch the Garmin KML data and add it to the map
fetch(garminKMLUrl)
    .then(response => response.text())
    .then(kmlText => {
        const parser = new DOMParser();
        const kmlDoc = parser.parseFromString(kmlText, 'text/xml');
        
        const trackCoordinates = kmlDoc.querySelectorAll('coordinates')[0].textContent.trim().split(' ');
        const latlngs = trackCoordinates.map(coord => {
            console.log(coord)
            const [lng, lat] = coord.split(',').map(parseFloat);
            return L.latLng(lat, lng);
        });
        
        // Create a polyline from the coordinates and add it to the map
        const polyline = L.polyline(latlngs, { color: 'red' }).addTo(map);
        
        // Fit the map to the polyline bounds
        map.fitBounds(polyline.getBounds());
    });
