const rimraf = require('rimraf');
const fs = require('fs');
const webpackPaths = require('../configs/webpack.paths');

const foldersToRemove = [webpackPaths.distPath, webpackPaths.buildPath];

// remove dist folders
foldersToRemove.forEach((folder) => {
  if (fs.existsSync(folder)) rimraf.sync(folder);
});
