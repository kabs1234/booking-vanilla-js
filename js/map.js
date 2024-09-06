const MAX_MARKERS = 10;
const mapCanvas = document.querySelector('.map__canvas');
const mapFilters = document.querySelector('.map__filters');
const housingType = mapFilters.querySelector('#housing-type');
const housingPrice = mapFilters.querySelector('#housing-price');
const housingRooms = mapFilters.querySelector('#housing-rooms');
const housingGuests = mapFilters.querySelector('#housing-guests');
const housingFeatures = mapFilters.querySelector('#housing-features');
const addressInput = document.querySelector('#address');
addressInput.value = '35.68832, 139.75438';


const map = L.map(mapCanvas).setView([35.68832, 139.75438], 13);
const marker = L.marker([35.688, 139.754], {draggable: true});
marker.addTo(map);
const userMarkersLayer = L.layerGroup();
L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
  maxZoom: 19,
  attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
}).addTo(map);
marker.addEventListener('move', () => {
  const [lat, lng] = [marker.getLatLng().lat, marker.getLatLng().lng];
  addressInput.value = `${lat.toFixed(5)}, ${lng.toFixed(5)}`;
});

const filterHousingType = (houseType, allOffers) => {
  if (houseType === 'any') {
    return allOffers;
  }

  return allOffers.filter((ad) => ad.offer.type === houseType);
};

const makePopupFeatureList = (features) => {
  const list = features.map((feature) => `<li class="popup__feature popup__feature--${feature}"></li>`);
  return list.join('\n');
};

const makePopupPhotos = (photos) => {
  const housePhotos = photos.map((photo) => `<img src="${photo}" class="popup__photo" width="45" height="40" alt="Фотография жилья">`);
  return housePhotos.join('\n');
};

const translateHouseType = (houseType) => {
  switch (houseType) {
    case 'bungalow':
      return 'Бунгало';
    case 'flat':
      return 'Квартира';
    case 'hotel':
      return 'Отель';
    case 'house':
      return 'Дом';
    case 'palace':
      return 'Дворец';
  }
};

const makeOfferPopup = (offerData) => {
  const parser = new DOMParser();
  const offerCard = `
    <article class="popup">
      <img src="${offerData.avatar}" class="popup__avatar" width="70" height="70" alt="Аватар пользователя">
      <h3 class="popup__title">${offerData.title}</h3>
      <p class="popup__text popup__text--address">${offerData.address}</p>
      <p class="popup__text popup__text--price">${offerData.price} <span>₽/ночь</span></p>
      <h4 class="popup__type">${translateHouseType(offerData.type)}</h4>
      <p class="popup__text popup__text--capacity">${offerData.rooms} комнаты для ${offerData.guests} гостей</p>
      <p class="popup__text popup__text--time">Заезд после ${offerData.checkin}, выезд до ${offerData.checkout}</p>
      ${offerData.features ? `<ul class="popup__features">${makePopupFeatureList(offerData.features)}</ul>` : ''}
      ${offerData.description ? `<p class="popup__description">${offerData.description}</p>` : ''}
      ${offerData.photos ? `<div class="popup__photos">${makePopupPhotos(offerData.photos)}</div>` : ''}
    </article>
  `;
  const offerElement = parser.parseFromString(offerCard, 'text/html');
  return offerElement.body.firstChild;
};


const placeUserMarker = (offerLocation, offerData) => {
  const [lat, lng] = [offerLocation.lat, offerLocation.lng];
  const card = makeOfferPopup(offerData);
  const userMarker = L.marker([lat, lng]).bindPopup(card).openPopup();
  userMarker.addTo(userMarkersLayer);
  userMarkersLayer.addTo(map);
};


const getOffers = async () => {
  try {
    const offersFetch = await fetch('https://25.javascript.htmlacademy.pro/keksobooking/data');
    const offersInfo = await offersFetch.json();
    return offersInfo;
  } catch (err) {
    const errorElement = document.createElement('p');
    errorElement.style = 'position: fixed; top: 0; left: 0; right: 0; margin: 0 auto; font-size: 20px; color: #ff0000; text-align: center; z-index: 1000;';
    errorElement.innerText = 'Похожие объявления не были загружены';
    document.body.append(errorElement);
    setTimeout(() => errorElement.remove(), 5000);
    console.log(err);
  }
};

getOffers().then((offersInfo) => {
  const offersLocations = offersInfo.map((offer) => offer.location);
  const offersData = offersInfo.map((offer) => ({...offer.author, ...offer.offer}));
  for (let i = 0; i < MAX_MARKERS; i++) {
    placeUserMarker(offersLocations[i], offersData[i]);
  }
  housingType.addEventListener('change', (evt) => {
    const filteredByHousingOffers = filterHousingType(evt.target.value, offersInfo);
    const filteredByHousingLocations = filteredByHousingOffers.map((offer) => offer.location);
    const filteredByHousingData = filteredByHousingOffers.map((offer) => ({...offer.author, ...offer.offer}));
    const filteredUserMarkersQuantity = filteredByHousingOffers.length >= 10 ? 10 : filteredByHousingOffers.length;
    userMarkersLayer.clearLayers();
    console.log(filteredByHousingOffers);

    for (let i = 0; i < filteredUserMarkersQuantity; i++) {
      placeUserMarker(filteredByHousingLocations[i], filteredByHousingData[i]);
    }
  });
});


