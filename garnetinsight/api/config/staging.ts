import { join } from 'path';
import * as os from 'os';

const homedir =
  process.env.RI_APP_FOLDER_ABSOLUTE_PATH ||
  join(os.homedir(), process.env.RI_APP_FOLDER_NAME || '.redis-insight-stage');

const prevHomedir = join(os.homedir(), '.garnetinsight-app-stage');

export default {
  dir_path: {
    homedir,
    prevHomedir,
    logs: join(homedir, 'logs'),
    customConfig: join(homedir, 'config.json'),
    preSetupDatabases:
      process.env.RI_PRE_SETUP_DATABASES_PATH ||
      join(homedir, 'databases.json'),
    customPlugins: join(homedir, 'plugins'),
    customTutorials: join(homedir, 'custom-tutorials'),
    commands: join(homedir, 'commands'),
    tutorials: process.env.RI_TUTORIALS_PATH || join(homedir, 'tutorials'),
    content: process.env.RI_CONTENT_PATH || join(homedir, 'content'),
    caCertificates: join(homedir, 'ca_certificates'),
    clientCertificates: join(homedir, 'client_certificates'),
    oldFolders: [
      process.env.RI_GUIDES_PATH || join(homedir, 'guides'),
      join(os.homedir(), '.garnetinsight-preview-stage'),
      join(os.homedir(), '.garnetinsight-v2-stage'),
    ],
  },
  server: {
    env: 'staging',
  },
  analytics: {
    writeKey:
      process.env.RI_SEGMENT_WRITE_KEY || 'Ba1YuGnxzsQN9zjqTSvzPc6f3AvmH1mj',
  },
  db: {
    database: join(homedir, 'garnetinsight.db'),
  },
  logger: {
    stdout: process.env.RI_STDOUT_LOGGER
      ? process.env.RI_STDOUT_LOGGER === 'true'
      : true, // enabled by default
    omitSensitiveData: process.env.RI_LOGGER_OMIT_DATA
      ? process.env.RI_LOGGER_OMIT_DATA === 'true'
      : false,
  },
};
