import { renderHook } from '@testing-library/react'
import { useSelector } from 'react-redux'
import { KeyValueFormat } from 'uiSrc/constants'
import { bufferToHex, bufferToString } from 'uiSrc/utils'
import useKeyFormat from './useKeyFormat'

jest.mock('react-redux', () => ({
  ...jest.requireActual('react-redux'),
  useSelector: jest.fn(),
}))

const mockUseSelector = useSelector as jest.Mock

describe('useKeyFormat hook', () => {
  const renderUseKeyFormat = () => renderHook(() => useKeyFormat())

  it('should return bufferToString as the default handler when keyNameFormat is not set', () => {
    mockUseSelector.mockReturnValueOnce({
      keyNameFormat: undefined,
    })

    const { result } = renderUseKeyFormat()

    expect(result.current.handler).toBe(bufferToString)
  })

  it('should return bufferToString when keyNameFormat is Unicode', () => {
    mockUseSelector.mockReturnValueOnce({
      keyNameFormat: KeyValueFormat.Unicode,
    })
    const { result } = renderUseKeyFormat()

    expect(result.current.handler).toBe(bufferToString)
  })

  it('should return bufferToHex when keyNameFormat is HEX', () => {
    mockUseSelector.mockReturnValueOnce({
      keyNameFormat: KeyValueFormat.HEX,
    })

    const { result } = renderUseKeyFormat()

    expect(result.current.handler).toBe(bufferToHex)
  })
})
