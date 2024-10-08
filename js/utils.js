export const debounce = (callback, timeoutDelay) => {
  let timeoutId;
  return (...rest) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => callback.apply(this, rest), timeoutDelay);
  };
};

export const addErrorMessage = () => {
  const errorElement = document.createElement('p');
  errorElement.style = 'position: fixed; top: 0; left: 0; right: 0; margin: 0 auto; font-size: 20px; color: #ff0000; text-align: center; z-index: 1000;';
  errorElement.innerText = 'Похожие объявления не были загружены';
  document.body.append(errorElement);
};
