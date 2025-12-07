import { dialog } from 'electron'
import log from 'electron-log'

export const initDialogHandlers = () => {
  dialog.showErrorBox = (title: string, content: string) => {
    log.error('Dialog shows error:', `\n${title}\n${content}`)
  }
}
