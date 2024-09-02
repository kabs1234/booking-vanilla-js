const adForm = document.querySelector('.ad-form');
const adFormHeadline = document.querySelector('#title');
const adFormPrice = document.querySelector('#price');
const adFormHousingType = document.querySelector('#type');
const adFormCheckInTime = document.querySelector('#timein');
const adFormCheckOutTime = document.querySelector('#timeout');
const adFormRoomNumber = document.querySelector('#room_number');
const adFormRoomCapacity = document.querySelector('#capacity');
// const adFormSubmitButton = adForm.querySelector('.ad-form__submit');
const pristineForm = new Pristine(adForm);
const HOUSING_TYPES = {
  bungalow: 0,
  flat: 1000,
  hotel: 3000,
  house: 5000,
  palace: 10000,
};

const minHousingTypePrice = HOUSING_TYPES[adFormHousingType.value];

const validateFormHeadline = (value) => value.length >= 30 && value.length <= 100;

const validateFormPrice = (value) => Number(value) <= 100000 && Number(value) >= minHousingTypePrice;

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

// pristineForm.addValidator(adFormHeadline, validateFormHeadline, 'Длина сообщения должна быть не менее 30');
pristineForm.addValidator(adFormPrice, validateFormPrice, `Минимальная цена - ${minHousingTypePrice}. Максимальная цена - 100 000 руб!`);
// pristineForm.addValidator(adFormRoomNumber, validateFormRoomNumber, 'Недоступное количество мест!');
// pristineForm.addValidator(adFormRoomCapacity, validateFormRoomCapacity, 'Недоступное количество комнат!');

adFormCheckInTime.addEventListener('change', onChangingCheckingIn);
adFormCheckOutTime.addEventListener('change', onChangingCheckingOut);
adForm.addEventListener('submit', (evt) => {
  evt.preventDefault();
  console.log(pristineForm.validate());
});
