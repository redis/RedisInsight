export const withTimeout = (
  promise: Promise<any>,
  delay: number,
  error: Error,
): Promise<any> => {
  let timer = null;

  return Promise.race([
    new Promise((resolve, reject) => {
      timer = setTimeout(reject, delay, error);
      return timer;
    }),
    promise.then((value) => {
      clearTimeout(timer);
      return value;
    }),
  ]);
};
