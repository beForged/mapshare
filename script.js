// Define the Garmin KML URL
const garminKMLUrl = 'https://share.garmin.com/Feed/Share/44RUF?d1=2023-01-01T00:00Z';

// Create a Leaflet map centered at a specific location
const map = L.map('map').setView([51.505, -0.09], 13);

// Add the OpenStreetMap tile layer to the map
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '© OpenStreetMap contributors'
}).addTo(map);

// Fetch the Garmin KML data and add it to the map via proxy
fetch('/api/proxy', {
    method: 'POST',
    headers: {
        'Content-Type': 'application/json'
    },
    body: JSON.stringify({
        url: garminKMLUrl, 
        method: 'GET', // or 'POST', 'PUT', etc. depending on the desired HTTP method
    })
})
    .then(response => response.text())
    .then(kmlText => {
        const parser = new DOMParser();
        const kmlDoc = parser.parseFromString(kmlText, 'text/xml');
        console.log(kmlDoc);
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
    })
    .catch(error => {
        console.error(error);
    });

