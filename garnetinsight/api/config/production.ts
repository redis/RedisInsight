import { join } from 'path';
import * as os from 'os';

const homedir =
  process.env.RI_APP_FOLDER_ABSOLUTE_PATH ||
  join(os.homedir(), process.env.RI_APP_FOLDER_NAME || '.redis-insight');

const prevHomedir = join(os.homedir(), '.garnetinsight-app');

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
      join(os.homedir(), '.garnetinsight-preview'),
      join(os.homedir(), '.garnetinsight-v2'),
      process.env.RI_GUIDES_PATH || join(homedir, 'guides'),
    ],
  },
  server: {
    env: 'production',
  },
  analytics: {
    writeKey:
      process.env.RI_SEGMENT_WRITE_KEY || 'lK5MNZgHbxj6vQwFgqZxygA0BiDQb32n',
    flushInterval:
      parseInt(process.env.RI_ANALYTICS_FLUSH_INTERVAL, 10) || 10000,
  },
  db: {
    database: join(homedir, 'garnetinsight.db'),
  },
  cloud: {
    cApiUrl: process.env.RI_CLOUD_CAPI_URL || 'https://api.redislabs.com/v1',
  },
  ai: {
    convAiApiUrl:
      process.env.RI_AI_CONVAI_API_URL || 'https://redis.io/convai/api',
    querySocketUrl:
      process.env.RI_AI_QUERY_SOCKET_URL || 'https://app.redislabs.com',
    querySocketPath:
      process.env.RI_AI_QUERY_SOCKET_PATH ||
      '/api/v1/cloud-copilot-service/socket.io/',
  },
};
