import { useAppSelector } from 'uiSrc/slices/hooks'
import { KeyValueFormat } from 'uiSrc/constants'
import { connectedInstanceSelector } from 'uiSrc/slices/instances/instances'
import { bufferToHex, bufferToString } from 'uiSrc/utils'

const encodingHandlerMap = {
  [KeyValueFormat.Unicode]: bufferToString,
  [KeyValueFormat.HEX]: bufferToHex,
}

const useKeyFormat = () => {
  const { keyNameFormat } = useAppSelector(connectedInstanceSelector)
  const format = keyNameFormat || KeyValueFormat.Unicode
  const handler = encodingHandlerMap[format]

  return { handler }
}

export default useKeyFormat
