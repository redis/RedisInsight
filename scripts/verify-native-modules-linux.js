const fs = require('fs')
const path = require('path')

const repoRoot = path.resolve(__dirname, '..')
const releaseDir = path.join(repoRoot, 'release')
const configPath = path.join(repoRoot, 'scripts', 'native-modules.config.json')
const builderConfigPath = path.join(repoRoot, 'electron-builder.json')

const getArgValue = (name) => {
  const arg = process.argv.find((entry) => entry.startsWith(`${name}=`))

  return arg ? arg.split('=').slice(1).join('=') : ''
}

const targetArch = getArgValue('--arch') || 'x64'
const archMatchPattern =
  targetArch === 'arm64' ? /(arm64|aarch64)/i : /(x64|amd64)/i

const hasPath = (targetPath) => fs.existsSync(targetPath)

const loadJson = (filePath) => JSON.parse(fs.readFileSync(filePath, 'utf8'))

const assertAsarUnpackInSync = (config) => {
  const electronBuilder = loadJson(builderConfigPath)
  const unpackList = electronBuilder.asarUnpack || []
  const missingFromBuilder = config.asarUnpackModules.filter(
    (modulePath) => !unpackList.includes(modulePath),
  )

  if (missingFromBuilder.length) {
    throw new Error(
      `electron-builder asarUnpack is missing modules: ${missingFromBuilder.join(', ')}`,
    )
  }
}

const discoverAsarUnpackedDirs = () => {
  if (!hasPath(releaseDir)) {
    return []
  }

  const unpackedCandidates = fs
    .readdirSync(releaseDir, { withFileTypes: true })
    .filter((entry) => entry.isDirectory() && entry.name.endsWith('-unpacked'))
    .map((entry) => ({
      name: entry.name,
      asarUnpackedPath: path.join(
        releaseDir,
        entry.name,
        'resources',
        'app.asar.unpacked',
      ),
    }))
    .filter((entry) => hasPath(entry.asarUnpackedPath))

  const archSpecific = unpackedCandidates.filter((entry) =>
    archMatchPattern.test(entry.name),
  )

  if (archSpecific.length) {
    return archSpecific
  }

  return unpackedCandidates.filter(
    (entry) => targetArch === 'x64' && entry.name === 'linux-unpacked',
  )
}

const verifyBinaries = (config, unpackedDirs) => {
  if (!unpackedDirs.length) {
    throw new Error(
      `No unpacked Linux app directories found for arch "${targetArch}" under ${releaseDir}`,
    )
  }

  const checks = []
  unpackedDirs.forEach((entry) => {
    config.linuxRequiredNodeBinaries.forEach((binaryPath) => {
      checks.push({
        unpackedDirName: entry.name,
        expectedPath: binaryPath,
        absolutePath: path.join(entry.asarUnpackedPath, binaryPath),
      })
    })
  })

  const missing = checks.filter((item) => !hasPath(item.absolutePath))
  if (missing.length) {
    const details = missing
      .map((item) => `${item.unpackedDirName}: ${item.expectedPath}`)
      .join('\n')
    throw new Error(`Missing required native binaries:\n${details}`)
  }

  console.log(`Verified native binaries for arch=${targetArch}`)
  checks.forEach((item) => {
    console.log(`- ${item.unpackedDirName}: ${item.expectedPath}`)
  })
}

try {
  const nativeModulesConfig = loadJson(configPath)

  assertAsarUnpackInSync(nativeModulesConfig)

  const asarUnpackedDirs = discoverAsarUnpackedDirs()
  verifyBinaries(nativeModulesConfig, asarUnpackedDirs)
} catch (error) {
  console.error(error.message)
  process.exit(1)
}
