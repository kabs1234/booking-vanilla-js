import { CENTRE_OF_TOKYO } from './constants.js';


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

export const sortByDistance = (locations) => {
  for ( const location of locations ) {
    location.distanceFromOrigin = getDistance( location.lat, location.lng, CENTRE_OF_TOKYO[0], CENTRE_OF_TOKYO[1] );
  }

  locations.sort( ( a, b ) => a.distanceFromOrigin - b.distanceFromOrigin );
};

export const debounce = (callback, timeoutDelay) => {
  let timeoutId;
  return (...rest) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => callback.apply(this, rest), timeoutDelay);
  };
};
