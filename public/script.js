let map = L.map('map').setView([17.385044, 78.486671], 17);

L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
  attribution: '© OpenStreetMap contributors'
}).addTo(map);

let marker = null;
let polyline = null;
let pathPoints = [];
let currentIndex = 0;
let isPlaying = false;

// Helper to compute angle in degrees between two coordinates
function getBearing(from, to) {
  const lat1 = from.lat * Math.PI / 180;
  const lat2 = to.lat * Math.PI / 180;
  const dLon = (to.lng - from.lng) * Math.PI / 180;

  const y = Math.sin(dLon) * Math.cos(lat2);
  const x =
    Math.cos(lat1) * Math.sin(lat2) -
    Math.sin(lat1) * Math.cos(lat2) * Math.cos(dLon);

  const bearing = Math.atan2(y, x);
  return (bearing * 180 / Math.PI + 360) % 360;
}


// Helper to create a rotated marker using a divIcon
function createRotatedMarker(lat, lng, angle) {
  const icon = L.divIcon({
    className: 'rotated-icon',
    html: `
      <div style="transform: rotate(${angle}deg);">
        <img src="https://cdn-icons-png.flaticon.com/512/744/744465.png" style="width: 40px;">
      </div>
    `,
    iconSize: [40, 40],
    iconAnchor: [20, 20]
  });

  return L.marker([lat, lng], { icon });
}


// Fetch location data and initialize route
fetch('http://localhost:3000/api/location')
  .then(res => res.json())
  .then(data => {
    pathPoints = data.map(p => [p.latitude, p.longitude]);

    polyline = L.polyline(pathPoints, { color: 'blue' }).addTo(map);
    map.fitBounds(polyline.getBounds());

    marker = createRotatedMarker(pathPoints[0][0], pathPoints[0][1], 0).addTo(map);
  });

// Animate vehicle movement
function moveCar(speed = 1) {
  if (currentIndex >= pathPoints.length - 1) {
    isPlaying = false;
    return;
  }

  const from = L.latLng(pathPoints[currentIndex]);
  const to = L.latLng(pathPoints[currentIndex + 1]);
  const angle = getBearing(from, to);
  const duration = 2000 / speed;
  let start;

  function step(timestamp) {
    if (!isPlaying) return;
    if (!start) start = timestamp;

    const progress = timestamp - start;
    const factor = progress / duration;
    if (factor >= 1) {
      currentIndex++;
      marker.remove();
      marker = createRotatedMarker(to.lat, to.lng, angle).addTo(map);
      moveCar(speed);
    } else {
      const lat = from.lat + (to.lat - from.lat) * factor;
      const lng = from.lng + (to.lng - from.lng) * factor;
      marker.setLatLng([lat, lng]);
      requestAnimationFrame(step);
    }
  }

  requestAnimationFrame(step);
}

// Controls
document.getElementById('play').addEventListener('click', () => {
  if (isPlaying) return;
  isPlaying = true;
  const speed = parseInt(document.getElementById('speed').value);
  moveCar(speed);
});

document.getElementById('stop').addEventListener('click', () => {
  isPlaying = false;
});



