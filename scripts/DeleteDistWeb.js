const path = require('path');
const rimraf = require('rimraf');

module.exports = function deleteDistWeb() {
  rimraf.sync(path.join(__dirname, '../garnetinsight/ui/dist/*'));
};
