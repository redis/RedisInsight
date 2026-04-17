import { defaultConfig } from 'uiSrc/config/default'
import { WritableStream as NodeWritableStream } from 'stream/web'

const globalWithStreams = globalThis as typeof globalThis & {
  WritableStream?: typeof NodeWritableStream
}

if (typeof globalWithStreams.WritableStream === 'undefined') {
  globalWithStreams.WritableStream = NodeWritableStream
}

riConfig = defaultConfig

window.app = {
  ...window.app,
  config: {
    apiPort: `${defaultConfig.api.port}`,
  },
}
