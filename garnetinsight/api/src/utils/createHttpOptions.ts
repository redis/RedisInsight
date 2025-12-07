import { readFile } from 'fs/promises';
import { Config } from '.';

export const createHttpOptions = async (serverConfig: Config['server']) => {
  const { tlsKey, tlsCert } = serverConfig;

  try {
    const [key, cert] = await Promise.all([
      readFile(tlsKey, { encoding: 'utf-8' }),
      readFile(tlsCert, { encoding: 'utf-8' }),
    ]);
    return {
      key,
      cert,
    };
  } catch (e) {
    /* if this throws, it could mean
        1. the tlsKey and tlsCert provided by the config were actually certificates in PEM format, not file paths or
        2. there were issues reading the files (wrong path, permissions, etc.)

       nothing to do in this case except assume PEM format and let the calling code throw if that doesn't work either */
  }

  // for docker and perhaps other environments, multi-line env vars are problematic, so if there are escaped new-lines
  // in the key or cert, replace them with proper newlines
  const key = tlsKey.replace(/\\n/g, '\n');
  const cert = tlsCert.replace(/\\n/g, '\n');

  return {
    key,
    cert,
  };
};
