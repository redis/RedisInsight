const { flipFuses, FuseVersion, FuseV1Options } = require('@electron/fuses');
const path = require('path');

/**
 * Flip Electron fuses to disable security-sensitive features.
 * This runs after the app is packaged but before signing.
 *
 * Disables ELECTRON_RUN_AS_NODE to prevent sandbox bypass attacks.
 *
 * @see https://www.electronjs.org/docs/latest/tutorial/fuses
 * @see https://redislabs.atlassian.net/browse/RED-174764
 */
exports.default = async function afterPack(context) {
  const { electronPlatformName, appOutDir } = context;
  const { productFilename } = context.packager.appInfo;

  let electronBinaryPath;

  if (electronPlatformName === 'darwin') {
    electronBinaryPath = path.join(
      appOutDir,
      `${productFilename}.app`,
      'Contents',
      'MacOS',
      productFilename,
    );
  } else if (electronPlatformName === 'win32') {
    electronBinaryPath = path.join(appOutDir, `${productFilename}.exe`);
  } else {
    // Linux
    electronBinaryPath = path.join(appOutDir, productFilename);
  }

  console.log(`Flipping Electron fuses for: ${electronBinaryPath}`);

  await flipFuses(electronBinaryPath, {
    version: FuseVersion.V1,
    // Disable ELECTRON_RUN_AS_NODE to prevent sandbox bypass (RED-174764)
    [FuseV1Options.RunAsNode]: false,
  });

  console.log('Electron fuses flipped successfully');
};
