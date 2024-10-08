export const getOffers = async (onErrorFunction) => {
  try {
    const offersFetch = await fetch('https://25.javascript.htmlacademy.pro/keksobooking/data');

    if (offersFetch.ok) {
      const offersInfo = await offersFetch.json();
      return offersInfo;
    } else {
      onErrorFunction();
    }
  } catch (err) {
    onErrorFunction();
  }
};
