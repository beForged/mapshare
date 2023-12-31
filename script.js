// Define the Garmin KML URL
const garminKMLUrl = 'https://share.garmin.com/Feed/Share/44RUF?d1=2023-01-01T00:00Z';

// Create a Leaflet map centered at a specific location
const map = L.map('map').setView([51.505, -115.6], 13);

// Add the OpenStreetMap tile layer to the map
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '© OpenStreetMap contributors'
}).addTo(map);

let data;
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

        data = parseKML(kmlDoc); 

        const latlngs = data
            .filter((record) => record.latitude !== null && 
                record.longitude !== null &&
                record >= record.time !== null && 
                filterDate(record.time))
            .map(record => L.latLng(record.latitude, record.longitude))

        // Create a polyline from the coordinates and add it to the map
        const polyline = L.polyline(latlngs, { color: 'red' }).addTo(map);

        // Fit the map to the polyline bounds
        map.fitBounds(polyline.getBounds());
})
    .catch(error => {
        console.error(error);
    });


var markers = [];


// ---------------------

const parseKML = (kmlXML) => {
    const placemarks = kmlXML.querySelectorAll('Placemark');
     const records = [];

    placemarks.forEach(placemark => {
        const timeElement = placemark.querySelector('ExtendedData > Data[name="Time UTC"] > value');
        const latElement = placemark.querySelector('ExtendedData > Data[name="Latitude"] > value');
        const lonElement = placemark.querySelector('ExtendedData > Data[name="Longitude"] > value');
        const eleElement = placemark.querySelector('ExtendedData > Data[name="Elevation"] > value');
        const velocityElement = placemark.querySelector('ExtendedData > Data[name="velocity"] > value');

        const time = timeElement ? timeElement.textContent : null;
        const lat = latElement ? parseFloat(latElement.textContent) : null;
        const lon = lonElement ? parseFloat(lonElement.textContent) : null;
        const ele = eleElement ? parseFloat(eleElement.textContent) : null;
        const velocity = velocityElement ? parseFloat(velocityElement.textContent) : null;

        const record = {
            time: time,
            latitude: lat,
            longitude: lon,
            elevation: ele,
            velocity: velocity
        };

        records.push(record);
    });

    return records;
};

const start1 = new Date('2023-06-01T00:00:00Z');
const end1 = new Date('2023-07-02T00:00:00Z');
const start2 = new Date('2023-12-01T00:00:00Z');

const filterDate = (date) => {
    const recordDate = new Date(date);

    const ret = (recordDate >= start1 && recordDate <= end1) || (recordDate >= start2);
    return ret;
};
