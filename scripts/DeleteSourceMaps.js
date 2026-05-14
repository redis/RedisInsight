const { join } = require('path');
const rimraf = require('rimraf');

module.exports = function deleteSourceMaps() {
  rimraf.sync(join(__dirname, '../redisinsight/ui/dist/*.js.map'));
  rimraf.sync(join(__dirname, '../redisinsight/ui/*.js.map'));
};
