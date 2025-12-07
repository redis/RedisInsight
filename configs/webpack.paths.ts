const path = require('path')

const rootPath = path.join(__dirname, '..')

const riPath = path.join(rootPath, 'garnetinsight')

const apiPath = path.join(riPath, 'api')
const uiPath = path.join(riPath, 'ui')
const apiSrcPath = path.join(apiPath, 'src')
const uiSrcPath = path.join(uiPath, 'src')
const desktopPath = path.join(riPath, 'desktop')
const desktopSrcPath = path.join(desktopPath, 'src')

const dllPath = path.join(desktopPath, 'dll')

const releasePath = path.join(rootPath, 'release')
const appPackagePath = path.join(riPath, 'package.json')
const appNodeModulesPath = path.join(releasePath, 'node_modules')
const buildAppPackagePath = path.join(releasePath, 'package.json')
const srcNodeModulesPath = path.join(apiPath, 'node_modules')

const distPath = path.join(riPath, 'dist')
const distMainPath = path.join(distPath, 'main')
const distRendererPath = path.join(distPath, 'renderer')

export default {
  rootPath,
  dllPath,
  apiPath,
  uiPath,
  riPath,
  apiSrcPath,
  uiSrcPath,
  releasePath,
  desktopPath,
  desktopSrcPath,
  appPackagePath,
  appNodeModulesPath,
  srcNodeModulesPath,
  distPath,
  distMainPath,
  distRendererPath,
  buildAppPackagePath,
  buildPath: releasePath,
}
