import * as express from 'express';
import * as fs from 'fs-extra';
import { constants } from './constants';
/**
 * Initiate remote server to fetch various static data like notificaitons or features configs
 */
export const initRemoteServer = async () => {
  await fs.ensureDir(constants.TEST_REMOTE_STATIC_PATH);

  const app = express();
  app.use(
    constants.TEST_REMOTE_STATIC_URI,
    express.static(constants.TEST_REMOTE_STATIC_PATH, { etag: false }),
  );
  await app.listen(5551);
};
