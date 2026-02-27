import { renderHook } from '@testing-library/react-hooks'
import { SampleDataContent } from '../../components/pick-sample-data-modal/PickSampleDataModal.types'
import { useCreateIndexCommand } from './useCreateIndexCommand'
import { PresetIndexName } from '../../utils/sampleData'

describe('useCreateIndexCommand', () => {
  it('should return command and indexName for e-commerce discovery', () => {
    const { result } = renderHook(() =>
      useCreateIndexCommand(SampleDataContent.E_COMMERCE_DISCOVERY),
    )

    expect(result.current.indexName).toBe(PresetIndexName.BIKES)
    expect(result.current.command).toContain('FT.CREATE')
    expect(result.current.command).toContain(PresetIndexName.BIKES)
  })

  it('should return command and indexName for content recommendations', () => {
    const { result } = renderHook(() =>
      useCreateIndexCommand(SampleDataContent.CONTENT_RECOMMENDATIONS),
    )

    expect(result.current.indexName).toBe(PresetIndexName.MOVIES)
    expect(result.current.command).toContain('FT.CREATE')
    expect(result.current.command).toContain(PresetIndexName.MOVIES)
  })

  it('should return empty command and indexName when sampleData is undefined', () => {
    const { result } = renderHook(() => useCreateIndexCommand(undefined))

    expect(result.current.indexName).toBe('')
    expect(result.current.command).toBe('')
  })

  it('should allow overriding the index name', () => {
    const customName = 'my-custom-index'
    const { result } = renderHook(() =>
      useCreateIndexCommand(SampleDataContent.E_COMMERCE_DISCOVERY, customName),
    )

    expect(result.current.indexName).toBe(customName)
    expect(result.current.command).toContain(customName)
  })
})
