import { Environment } from 'monaco-editor/esm/vs/editor/editor.api'
import { Buffer } from 'buffer'
// eslint-disable-next-line import/order
import { Nullable } from 'uiSrc/utils'
import { KeyValueCompressor } from 'uiSrc/constants'
import {
  RedisResponseBuffer,
  RedisString,
  UintArray,
} from 'uiSrc/slices/interfaces'
import { Config } from 'uiSrc/config'
import { IPCHandler } from '../../../desktop/preload'

declare global {
  interface Window {
    ri: RedisInsight
    Buffer: typeof Buffer
    app: WindowApp
    windowId?: string
    MonacoEnvironment: Environment
    readonly __RI_PROXY_PATH__: string
  }
}

declare global {
  let riConfig: Config
}

export interface RedisInsight {
  bufferToUTF8: (reply: RedisResponseBuffer) => string
  bufferToASCII: (reply: RedisResponseBuffer) => string
  UintArrayToString: (reply: UintArray) => string
  UTF8ToBuffer: (reply: string) => RedisResponseBuffer
  ASCIIToBuffer: (reply: string) => RedisResponseBuffer
  stringToBuffer: (reply: string) => RedisResponseBuffer
  anyToBuffer: (reply: UintArray) => RedisResponseBuffer
  bufferToString: (reply: RedisString) => string
  hexToBuffer: (reply: string) => RedisResponseBuffer
  bufferToHex: (reply: RedisResponseBuffer) => string
  bufferToBinary: (reply: RedisResponseBuffer) => string
  binaryToBuffer: (reply: string) => RedisResponseBuffer
  getCompressor: (reply: RedisResponseBuffer) => Nullable<KeyValueCompressor>
}

export interface WindowApp {
  sendWindowId: any
  cloudOauthCallback: any
  azureSsoOauthCallback: any
  deepLinkAction: any
  updateAvailable: any
  ipc: IPCHandler
  config: {
    apiPort: string
  }
}
