/* eslint-disable no-console */
import installExtension, {
  REACT_DEVELOPER_TOOLS,
  REDUX_DEVTOOLS,
} from 'electron-devtools-installer'
import { wrapErrorMessageSensitiveData } from 'desktopSrc/utils'
import { configMain as config } from 'desktopSrc/config'

export const installExtensions = async () => {
  if (config.isProduction) {
    return Promise.resolve()
  }

  const extensions = [REDUX_DEVTOOLS, REACT_DEVELOPER_TOOLS]
  const forceDownload = !!process.env.UPGRADE_EXTENSIONS

  return installExtension(extensions, {
    forceDownload,
    loadExtensionOptions: { allowFileAccess: true },
  })
    .then((name) => console.log(`Added Extension:  ${name}`))
    .catch((err) =>
      console.log(
        'An error occurred: ',
        wrapErrorMessageSensitiveData(err).toString(),
      ),
    )
}
