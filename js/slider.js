const slider = document.querySelector('.ad-form__slider');
const priceInput = document.querySelector('#price');

const setPriceFromSlider = (values) => {
  priceInput.value = Number(values[0]).toFixed(0);
};

const setSliderFromPrice = () => {
  slider.noUiSlider.set(priceInput.value);
};

const initSlider = () => {
  noUiSlider.create(slider, {
    start: [0],
    connect: true,
    range: {
      'min': 0,
      'max': 100000
    }
  });
  slider.noUiSlider.on('update', setPriceFromSlider);
  priceInput.addEventListener('change', setSliderFromPrice);
};

export const resetSlider = () => {
  slider.noUiSlider.set(0);
};

export const disabledSlider = () => {
  slider.noUiSlider.disable();
};

export const enableSlider = () => {
  slider.noUiSlider.enable();
};

initSlider();
