import config from 'src/utils/config';

const cloudConfig = config.get('cloud');

export const isValidToken = (token?: string) => {
  if (!token) {
    return false;
  }

  const { exp } = JSON.parse(
    Buffer.from(token.split('.')[1], 'base64').toString(),
  );

  const expiresIn = exp * 1_000 - Date.now();

  return expiresIn > cloudConfig.renewTokensBeforeExpire;
};
