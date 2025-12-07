export default {
  server: {
    env: 'development',
  },
  sockets: {
    cors: {
      enabled: true,
    },
  },
  db: {
    synchronize: process.env.RI_DB_SYNC
      ? process.env.RI_DB_SYNC === 'true'
      : true,
    migrationsRun: process.env.RI_DB_MIGRATIONS
      ? process.env.RI_DB_MIGRATIONS === 'true'
      : false,
  },
  logger: {
    logLevel: process.env.RI_LOG_LEVEL || 'debug',
    stdout: process.env.RI_STDOUT_LOGGER
      ? process.env.RI_STDOUT_LOGGER === 'true'
      : true, // enabled by default
    omitSensitiveData: process.env.RI_LOGGER_OMIT_DATA
      ? process.env.RI_LOGGER_OMIT_DATA === 'true'
      : false,
  },
};
