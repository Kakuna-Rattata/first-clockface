// Add zero in front of numbers < 10
export const zeroPad = value => {
  if (value < 10) {
    value = '0' + value;
  }

  return value;
};

// Add commas to numeric string values
export const formatNumericStrings = value =>
  value && `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
