const mapCanvas = document.querySelector('.map__canvas');
const addressInput = document.querySelector('#address');
addressInput.value = '35.68832, 139.75438';


const map = L.map(mapCanvas).setView([35.68832, 139.75438], 13);
const marker = L.marker([35.688, 139.754], {draggable: true}).addTo(map);
marker.addTo(map);
L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
  maxZoom: 19,
  attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
}).addTo(map);
marker.addEventListener('move', () => {
  const [lat, lng] = [marker.getLatLng().lat, marker.getLatLng().lng];
  addressInput.value = `${lat.toFixed(5)}, ${lng.toFixed(5)}`;
});
