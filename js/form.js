const adForm = document.querySelector('.ad-form');
const adFormHeadline = document.querySelector('#title');
const adFormPrice = document.querySelector('#price');
const adFormHousingType = document.querySelector('#type');
const adFormCheckInTime = document.querySelector('#timein');
const adFormCheckOutTime = document.querySelector('#timeout');
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
const validateFormPrice = (value) => value <= 100000 && value >= minHousingTypePrice;
const onChangingCheckingTime = () => {
  [adFormCheckInTime.value, adFormCheckOutTime.value] = [adFormCheckOutTime.value, adFormCheckInTime.value];
};


pristineForm.addValidator(adFormHeadline, validateFormHeadline, 'Длина сообщения должна быть не менее 30');
pristineForm.addValidator(adFormPrice, validateFormPrice, `Минимальная цена - ${minHousingTypePrice}. Максимальная цена - 100 000 руб!`);


adFormCheckInTime.addEventListener('change', onChangingCheckingTime);
adFormCheckOutTime.addEventListener('change', onChangingCheckingTime);
adForm.addEventListener('submit', (evt) => {
  evt.preventDefault();
  pristineForm.validate();
  console.log(pristineForm.validate());
});
