import { resetMapAndForms } from './map.js';
import { resetSlider } from './slider.js';

const HOUSING_TYPES = {
  bungalow: 0,
  flat: 1000,
  hotel: 3000,
  house: 5000,
  palace: 10000,
};

const FILE_TYPES = ['gif', 'jpg', 'jpeg', 'png'];

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
const adFormHousingPhotosInput = document.querySelector('#images');
const adFormHousingPhotosContainer = document.querySelector('.ad-form__photo-container');
const adFormResetButton = document.querySelector('.ad-form__reset');

const successfulSubmit = document.querySelector('#success').content.firstElementChild.cloneNode(true);
const failedSubmit = document.querySelector('#error').content.firstElementChild.cloneNode(true);
const trySubmitFormButton = failedSubmit.lastElementChild;

const defaultPristineConfig = {
  classTo: 'ad-form__element',
  errorTextParent: 'ad-form__element',
  errorTextTag: 'div',
  errorTextClass: 'text-help',
};

const pristineForm = new Pristine(adForm, defaultPristineConfig);

let formSendStateElement;

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
  }

  return false;
};

const validateFormRoomCapacity = (value) => {
  const roomNumber = Number(adFormRoomNumber.value);
  const intValue = Number(value);

  if (intValue <= roomNumber && intValue !== 0 && roomNumber !== 100) {
    return true;
  } else if (intValue === 0 && roomNumber === 100) {
    return true;
  }

  return false;
};

const synchronizeTimeFields = (source, target) => {
  target.value = source.value;
};

const isExtentionCorrect = (file) => {
  const fileName = file.name.toLowerCase();
  const matches = FILE_TYPES.some((it) => fileName.endsWith(it));

  return matches;
};

const addPhoto = (evt) => {
  if (!isExtentionCorrect(evt.target.files[0])) {
    return;
  }

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
    adFormHousingPhotosContainer.append(houseImageWrapper);
    houseImageWrapper.append(houseImage);
  }
};

const onOutsideClick = (evt) => {
  if (!formSendStateElement.firstElementChild.contains(evt.target)) {
    formSendStateElement.remove();
    removeEventListeners();
  }
};

const onEscapeKeyDown = (evt) => {
  if (evt.key === 'Escape' || evt.key === 'Esc') {
    formSendStateElement.remove();
    removeEventListeners();
  }
};

const onRetryButtonClick = () => {
  failedSubmit.remove();
  removeEventListeners();
};

function removeEventListeners () {
  document.removeEventListener('mouseup', onOutsideClick);
  document.removeEventListener('keydown', onEscapeKeyDown);
  trySubmitFormButton.removeEventListener('click', onRetryButtonClick);
}

const addFailedSubmit = () => {
  formSendStateElement = failedSubmit;
  document.body.append(failedSubmit);
  document.addEventListener('keydown', onEscapeKeyDown);
  document.addEventListener('mouseup', onOutsideClick);
  trySubmitFormButton.addEventListener('click', onRetryButtonClick);
};

const addSuccessfulSubmit = () => {
  formSendStateElement = successfulSubmit;
  document.body.append(successfulSubmit);
  document.addEventListener('keydown', onEscapeKeyDown);
  document.addEventListener('mouseup', onOutsideClick);
};

const submitForm = async () => {
  const formData = new FormData(adForm);
  adFormSubmitButton.textContent = 'Публикуем...';
  adFormSubmitButton.disabled = true;

  try {
    const response = await fetch('https://25.javascript.htmlacademy.pro/keksobooking', {method: 'POST', body: formData});
    if (response.ok) {
      addSuccessfulSubmit();
      resetMapAndForms();
      resetSlider();
    } else {
      addFailedSubmit();
    }
  } catch (err) {
    addFailedSubmit();
  } finally {
    adFormSubmitButton.textContent = 'Опубликовать';
    adFormSubmitButton.disabled = false;
  }
};

const showPriceMessage = () => {
  const minHousingTypePrice = HOUSING_TYPES[adFormHousingType.value];

  return `Минимальная цена - ${minHousingTypePrice} Максимальная цена - 100 000`;
};

export const resetHousingImages = () => {
  const housingPhotos = adFormHousingPhotosContainer.querySelectorAll('.ad-form__photo');

  housingPhotos.forEach((photo) => photo.remove());

  const photoContainer = document.createElement('div');
  photoContainer.classList.add('ad-form__photo');
  adFormHousingPhotosContainer.append(photoContainer);
};

export const resetUserImage = () => {
  adFormAvatar.src = 'img/muffin-grey.svg';
};

export const setupForm = () => {
  pristineForm.addValidator(adFormHeadline, validateFormHeadline, 'Длина сообщения должна быть не менее 30 символов');
  pristineForm.addValidator(adFormPrice, validateFormPrice, showPriceMessage);
  pristineForm.addValidator(adFormRoomNumber, validateFormRoomNumber, 'Количество комнат должно соответстовать количеству мест');
  pristineForm.addValidator(adFormRoomCapacity, validateFormRoomCapacity, 'Количество мест должно соответстовать количеству комнат или быть меньше');

  adFormHousingPhotosInput.addEventListener('change', addPhoto);

  adFormCheckInTime.addEventListener('change', () => synchronizeTimeFields(adFormCheckInTime, adFormCheckOutTime));
  adFormCheckOutTime.addEventListener('change', () => synchronizeTimeFields(adFormCheckOutTime, adFormCheckInTime));

  adFormAvatarInput.addEventListener('change', (evt) => {
    if (isExtentionCorrect(evt.target.files[0])) {
      adFormAvatar.src = URL.createObjectURL(evt.target.files[0]);
    }
  });

  adForm.addEventListener('submit', (evt) => {
    evt.preventDefault();
    if (pristineForm.validate()) {
      submitForm();
    }
  });

  adFormResetButton.addEventListener('click', resetMapAndForms);
};

