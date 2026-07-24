import config from 'src/utils/config';

const cloudConfig = config.get('cloud');

const getTokenExp = (token: string): number => {
  const { exp } = JSON.parse(
    Buffer.from(token.split('.')[1], 'base64').toString(),
  );

  return exp * 1_000;
};

export const isValidToken = (token?: string) => {
  if (!token) {
    return false;
  }

  const expiresIn = getTokenExp(token) - Date.now();

  return expiresIn > cloudConfig.renewTokensBeforeExpire;
};

// Actual expiry, ignoring the proactive-renewal buffer. A token can be past the
// renewal buffer (isValidToken === false) while still usable for a request.
export const isTokenExpired = (token?: string): boolean => {
  if (!token) {
    return true;
  }

  try {
    return getTokenExp(token) <= Date.now();
  } catch {
    return true;
  }
};
