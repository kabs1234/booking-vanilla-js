import { initalizeMap } from './map.js';
import { initalizeSlider } from './slider.js';
import { setupForm } from './form.js';
import { getOffers } from './api.js';
import { addErrorMessage } from './utils.js';


getOffers(addErrorMessage).then((offers) => {
  if (offers) {
    initalizeMap(offers);
    initalizeSlider();
    setupForm();
  }
});

