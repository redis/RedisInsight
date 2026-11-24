import { CorsOptions } from '@nestjs/common/interfaces/external/cors-options.interface';
import { BuildType } from 'src/modules/server/models/server';

interface CorsConfig {
  origin?: string;
  credentials?: boolean;
}

// The Docker API has no login, so cross-origin browser access stays off unless an origin is configured.
// The other builds load the UI from a different origin than the API, so they keep allowing any origin.
export const getCorsOptions = (
  { origin, credentials }: CorsConfig,
  buildType?: string,
): CorsOptions => {
  if (origin) {
    return { origin, credentials };
  }

  return {
    origin: buildType === BuildType.DockerOnPremise ? false : '*',
    credentials,
  };
};
