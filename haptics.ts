export const vibrate = (pattern: number | number[] = 10) => {
  if (typeof navigator !== 'undefined' && navigator.vibrate) {
    navigator.vibrate(pattern);
  }
};

export const hapticSuccess = () => vibrate([10, 30, 10]);
export const hapticError = () => vibrate([50, 30, 50, 30, 50]);
export const hapticClick = () => vibrate(10);
