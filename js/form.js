import { resetMapAndForms } from './map.js';
import { resetSlider } from './slider.js';

const adForm = document.querySelector('.ad-form');
const adFormHeadline = document.querySelector('#title');
const adFormPrice = document.querySelector('#price');
const adFormHousingType = document.querySelector('#type');
const adFormCheckInTime = document.querySelector('#timein');
const adFormCheckOutTime = document.querySelector('#timeout');
const adFormRoomNumber = document.querySelector('#room_number');
const adFormRoomCapacity = document.querySelector('#capacity');
const adFormSubmitButton = document.querySelector('.ad-form__submit');
const adFormAvatarInput = document.querySelector('#avatar');
const adFormAvatar = document.querySelector('.ad-form-header__preview img');
const adFormHousePhotosInput = document.querySelector('#images');
const adFormHousePhotosContainer = document.querySelector('.ad-form__photo-container');
const adFormResetButton = document.querySelector('.ad-form__reset');

const successfulSubmitElement = document.querySelector('#success').content.firstElementChild.cloneNode(true);
const successfulSubmitMessage = successfulSubmitElement.firstElementChild;
const failedSubmitElement = document.querySelector('#error').content.firstElementChild.cloneNode(true);
const failedSubmitMessage = failedSubmitElement.firstElementChild;
const trySubmitFormButton = failedSubmitElement.lastElementChild;

const defaultConfig = {
  classTo: 'ad-form__element',
  errorClass: 'has-danger',
  successClass: 'has-success',
  errorTextParent: 'ad-form__element',
  errorTextTag: 'div',
  errorTextClass: 'text-help',
};
const pristineForm = new Pristine(adForm, defaultConfig);

const HOUSING_TYPES = {
  bungalow: 0,
  flat: 1000,
  hotel: 3000,
  house: 5000,
  palace: 10000,
};

const validateFormHeadline = (value) => value.length >= 30 && value.length <= 100;

const validateFormPrice = (value) => {
  const minHousingTypePrice = HOUSING_TYPES[adFormHousingType.value];
  return Number(value) <= 100000 && Number(value) >= minHousingTypePrice;
};

const validateFormRoomNumber = (value) => {
  const roomCapacity = Number(adFormRoomCapacity.value);
  const intValue = Number(value);

  if (intValue >= roomCapacity && intValue !== 100 && roomCapacity !== 0) {
    return true;
  } else if (intValue === 100 && roomCapacity === 0) {
    return true;
  } else {
    return false;
  }
};

const validateFormRoomCapacity = (value) => {
  const roomNumber = Number(adFormRoomNumber.value);
  const intValue = Number(value);

  if (intValue <= roomNumber && intValue !== 0 && roomNumber !== 100) {
    return true;
  } else if (intValue === 0 && roomNumber === 100) {
    return true;
  } else {
    return false;
  }
};

const onChangingCheckingIn = () => {
  adFormCheckOutTime.value = adFormCheckInTime.value;
};

const onChangingCheckingOut = () => {
  adFormCheckInTime.value = adFormCheckOutTime.value;
};

const removeOnClickOutside = (evt, firstRemovingElement, secondRemovingElement = '') => {
  const firstContainer = firstRemovingElement;
  const secondContainer = secondRemovingElement;

  if (firstContainer && secondContainer) {
    if (!firstContainer.contains(evt.target) && !secondContainer.contains(evt.target)) {
      firstContainer.parentElement.remove();
      document.removeEventListener('mouseup', removeOnClickOutside);
    }
  } else {
    if (!firstContainer.contains(evt.target)) {
      firstContainer.parentElement.remove();
      document.removeEventListener('mouseup', removeOnClickOutside);
    }
  }

};

const removeOnEscapePressing = (evt, removingElement) => {
  if (evt.keyCode === 27 || evt.key === 'Escape' || evt.key === 'Esc') {
    removingElement.remove();
  }
};

const removeOnClick = (removingElement) => {
  removingElement.remove();
};

pristineForm.addValidator(adFormHeadline, validateFormHeadline, 'Длина сообщения должна быть не менее 30 символов');
pristineForm.addValidator(adFormPrice, validateFormPrice, 'Мин цена Бунгало - 0 руб, Квартира - 1000, Отель - 3000, Дом - 5000, Дворец - 10000. Макс цена для всех 100 000 руб');
pristineForm.addValidator(adFormRoomNumber, validateFormRoomNumber, 'Количество комнат должно соответстовать количеству гостей');
pristineForm.addValidator(adFormRoomCapacity, validateFormRoomCapacity, 'Количество мест должно соответстовать количеству комнат или быть меньше');

adFormCheckInTime.addEventListener('change', onChangingCheckingIn);
adFormCheckOutTime.addEventListener('change', onChangingCheckingOut);
adFormAvatarInput.addEventListener('change', (evt) => {
  adFormAvatar.src = URL.createObjectURL(evt.target.files[0]);
});

adFormHousePhotosInput.addEventListener('change', (evt) => {
  const allHousePhotos = document.querySelectorAll('.ad-form__photo img');
  const houseImage = document.createElement('img');
  houseImage.width = 70;
  houseImage.height = 70;
  houseImage.src = URL.createObjectURL(evt.target.files[0]);

  if (allHousePhotos.length === 0) {
    const singleHousePhoto = document.querySelector('.ad-form__photo');
    singleHousePhoto.append(houseImage);
  } else if (allHousePhotos.length >= 1) {
    const houseImageWrapper = document.createElement('div');
    houseImageWrapper.classList.add('ad-form__photo');
    adFormHousePhotosContainer.append(houseImageWrapper);
    houseImageWrapper.append(houseImage);
  }
});

const addFailedSubmitElement = () => {
  document.body.append(failedSubmitElement);
  document.addEventListener('keydown', (evt) => {removeOnEscapePressing(evt, failedSubmitElement);});
  document.addEventListener('mouseup', (evt) => {removeOnClickOutside(evt, failedSubmitMessage, trySubmitFormButton);});
  trySubmitFormButton.addEventListener('click', () => {removeOnClick(failedSubmitElement);});
};

const addSuccessfulSubmitElement = () => {
  document.body.append(successfulSubmitElement);
  document.addEventListener('keydown', (evt) => {removeOnEscapePressing(evt, successfulSubmitElement);});
  document.addEventListener('mouseup', (evt) => {removeOnClickOutside(evt, successfulSubmitMessage);});
};

const submitForm = async () => {
  const formData = new FormData(adForm);
  adFormSubmitButton.textContent = 'Публикуем...';
  adFormSubmitButton.disabled = true;
  try {
    const response = await fetch('https://25.javascript.htmlacademy.pro/keksobooking', {method: 'POST', body: formData});
    if (response.ok) {
      addSuccessfulSubmitElement();
      resetMapAndForms();
      resetSlider();
    } else {
      addFailedSubmitElement();
    }
  } catch (err) {
    addFailedSubmitElement();
  }

  document.removeEventListener('keydown', removeOnEscapePressing);
  document.removeEventListener('mouseup', removeOnClickOutside);
  trySubmitFormButton.removeEventListener('click', removeOnClick);
  adFormSubmitButton.textContent = 'Опубликовать';
  adFormSubmitButton.disabled = false;
};

adForm.addEventListener('submit', (evt) => {
  evt.preventDefault();
  if (pristineForm.validate()) {
    submitForm();
  }
});

adFormResetButton.addEventListener('click', resetMapAndForms);
