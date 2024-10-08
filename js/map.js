import { MAX_MARKERS, CENTRE_OF_TOKYO, RERENDER_DELAY } from './constants.js';
import { resetHousingImages, resetUserImage } from './form.js';
import { enableSlider, resetSlider } from './slider.js';
import { debounce } from './utils.js';

const mapCanvas = document.querySelector('.map__canvas');
const mapFilters = document.querySelector('.map__filters');
const addressInput = document.querySelector('#address');
const adForm = document.querySelector('.ad-form');
const allFormElementsInForm = [...adForm.querySelectorAll('.ad-form__element')];
const avatarInput = adForm.querySelector('.ad-form-header');
const allFiltersInMap = [...mapFilters.querySelectorAll('.map__filter')];
const mapFeatures = mapFilters.querySelector('.map__features');

const tileLayer = L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
  maxZoom: 19,
  attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
});
const usersMarkersLayer = L.layerGroup();

let isMapInitialized = false;
let map;
let savedUserOffers;

const enableMapFilters = () => {
  mapFilters.classList.remove('map__filters--disabled');

  mapFeatures.disabled = false;
  allFiltersInMap.forEach((filter) => {
    filter.disabled = false;
  });
};

const enableUserForm = () => {
  adForm.classList.remove('ad-form--disabled');

  avatarInput.disabled = false;
  allFormElementsInForm.forEach((fieldset) => {
    fieldset.disabled = false;
  });
};

const getDistance = (lat1, lon1, lat2, lon2) => {
  const radlat1 = (Math.PI * lat1) / 180;
  const radlat2 = (Math.PI * lat2) / 180;

  const theta = lon1 - lon2;
  const radtheta = (Math.PI * theta) / 180;

  let dist =
        Math.sin(radlat1) * Math.sin(radlat2) +
        Math.cos(radlat1) * Math.cos(radlat2) * Math.cos(radtheta);
  dist = Math.acos(dist);
  dist = (dist * 180) / Math.PI;
  dist = dist * 60 * 1.1515;
  dist = dist * 1.609344;

  return dist;
};

const sortByDistance = (locations) => {
  for ( const location of locations ) {
    location.distanceFromOrigin = getDistance( location.lat, location.lng, CENTRE_OF_TOKYO[0], CENTRE_OF_TOKYO[1] );
  }

  locations.sort( ( a, b ) => a.distanceFromOrigin - b.distanceFromOrigin );
};

const initalizeDraggableMarker = () => {
  const markerIcon = L.icon({
    iconUrl: './img/markers/marker-52.png',
    iconSize: [52, 52],
    iconAnchor: [26, 52],
  });
  const marker = L.marker(CENTRE_OF_TOKYO, {icon: markerIcon, draggable: true});

  marker.addEventListener('move', () => {
    const [lat, lng] = [marker.getLatLng().lat, marker.getLatLng().lng];
    addressInput.value = `${lat.toFixed(5)}, ${lng.toFixed(5)}`;
  });

  marker.addTo(map);
};

const filterByHousingType = (houseType, allOffers) => {
  if (houseType === 'any') {
    return allOffers;
  }

  return allOffers.filter((ad) => ad.offer.type === houseType);
};

const filterByPrice = (price, allOffers) => {
  if (price === 'any') {
    return allOffers;
  }

  switch (price) {
    case 'low':
      return allOffers.filter((ad) => ad.offer.price < 10000);
    case 'middle':
      return allOffers.filter((ad) => ad.offer.price >= 10000 && ad.offer.price < 50000);
    case 'high':
      return allOffers.filter((ad) => ad.offer.price >= 50000);
  }
};

const filterByRooms = (rooms, allOffers) => {
  if (rooms === 'any') {
    return allOffers;
  }

  return allOffers.filter((ad) => Number(ad.offer.rooms) === Number(rooms));
};

const filterByGuests = (guests, allOffers) => {
  if (guests === 'any') {
    return allOffers;
  }

  return allOffers.filter((ad) => Number(ad.offer.guests) === Number(guests));
};

const filterByFeatures = (features, allOffers) => {
  if (features.length === 0) {
    return allOffers;
  }

  const includedFeaturesOffers = allOffers.filter((ad) => ad.offer.features);
  const allIncludedFeaturesOffers = includedFeaturesOffers.filter((element) => features.every((value) => element.offer.features.includes(value)));

  return allIncludedFeaturesOffers;
};

const applyAllFilters = (allOffers) => {
  const housingType = mapFilters.querySelector('#housing-type');
  const housingPrice = mapFilters.querySelector('#housing-price');
  const housingRooms = mapFilters.querySelector('#housing-rooms');
  const housingGuests = mapFilters.querySelector('#housing-guests');
  const housingFeatures = [...mapFilters.querySelectorAll('.map__checkbox ')].filter((element) => element.checked).map((element) => element.value);

  let allOffersCopy = [...allOffers];

  allOffersCopy = filterByHousingType(housingType.value, allOffersCopy);
  allOffersCopy = filterByPrice(housingPrice.value, allOffersCopy);
  allOffersCopy = filterByRooms(housingRooms.value, allOffersCopy);
  allOffersCopy = filterByGuests(housingGuests.value, allOffersCopy);
  allOffersCopy = filterByFeatures(housingFeatures, allOffersCopy);

  return allOffersCopy;
};

const makePopupFeatureList = (features) => {
  const featureList = features.map((feature) => `<li class="popup__feature popup__feature--${feature}"></li>`);
  return featureList.join('\n');
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
  const userMarkerIcon = L.icon({
    iconUrl: './img/markers/marker-40.png',
    iconSize: [40, 40],
    iconAnchor: [20, 40],
  });
  const userMarker = L.marker([lat, lng], {icon: userMarkerIcon}).bindPopup(card).openPopup();
  userMarker.addTo(usersMarkersLayer);
  usersMarkersLayer.addTo(map);
};

const placeUsersOffersOnMap = (offersInfo) => {
  const offersLocations = offersInfo.map((offer) => offer.location);
  sortByDistance(offersLocations);
  const offersData = offersInfo.map((offer) => ({...offer.author, ...offer.offer}));

  for (let i = 0; i < MAX_MARKERS; i++) {
    placeUserMarker(offersLocations[i], offersData[i]);
  }
  mapFilters.addEventListener('change', debounce(() => {
    const filteredOffers = applyAllFilters(offersInfo);

    const filteredOffersLocations = filteredOffers.map((offer) => offer.location);
    sortByDistance(filteredOffersLocations);
    const filteredOffersData = filteredOffers.map((offer) => ({...offer.author, ...offer.offer}));

    const filteredUserMarkersQuantity = filteredOffers.length >= MAX_MARKERS ? MAX_MARKERS : filteredOffers.length;
    usersMarkersLayer.clearLayers();

    for (let i = 0; i < filteredUserMarkersQuantity; i++) {
      placeUserMarker(filteredOffersLocations[i], filteredOffersData[i]);
    }
  }, RERENDER_DELAY));
};

const initalizeActiveState = () => {
  if (!isMapInitialized) {
    enableUserForm();
    enableSlider();
    enableMapFilters();
    initalizeDraggableMarker();

    placeUsersOffersOnMap(savedUserOffers);
    tileLayer.removeEventListener('load', initalizeActiveState);
  } else {
    initalizeDraggableMarker();
    placeUsersOffersOnMap(savedUserOffers);
  }

  isMapInitialized = true;
};

export const initalizeMap = (offersInfo) => {
  map = L.map(mapCanvas).setView(CENTRE_OF_TOKYO, 13);
  tileLayer.addTo(map);
  savedUserOffers = [...offersInfo];

  if (!isMapInitialized) {
    tileLayer.addEventListener('load', initalizeActiveState);
  } else {
    initalizeActiveState();
  }
};

export const resetMapAndForms = () => {
  mapFilters.reset();
  resetUserImage();
  resetHousingImages();
  resetSlider();
  adForm.reset();
  map.off();
  map.remove();
  usersMarkersLayer.clearLayers();
  initalizeMap(savedUserOffers);
};
