const electronBuilder = require('./electron-builder.json');

const config = {
  ...electronBuilder,
  appId: 'com.redis.Garnetinsight',
};

module.exports = config;
