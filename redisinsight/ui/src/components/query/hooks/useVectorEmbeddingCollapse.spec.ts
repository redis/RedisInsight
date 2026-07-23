import { renderHook } from 'uiSrc/utils/test-utils'
import {
  collapseVectorEmbeddingValue,
  resetVectorEmbeddingPlaceholders,
} from 'uiSrc/utils'
import { FP32_VECTOR_FIXTURE_1_2_3 } from 'uiSrc/mocks/factories/browser/vectorSet/vectorSetElement.factory'
import { useVectorEmbeddingCollapse } from './useVectorEmbeddingCollapse'
import { UseVectorEmbeddingCollapseProps } from './useVectorEmbeddingCollapse.types'

const { escaped: FP32_ESCAPED } = FP32_VECTOR_FIXTURE_1_2_3

const monaco = {
  Range: jest.fn((sl: number, sc: number, el: number, ec: number) => ({
    startLineNumber: sl,
    startColumn: sc,
    endLineNumber: el,
    endColumn: ec,
  })),
}

const createEditor = (value: string) => {
  const model = {
    getValue: jest.fn(() => value),
    getPositionAt: jest.fn((offset: number) => ({
      lineNumber: 1,
      column: offset + 1,
    })),
    getOffsetAt: jest.fn(() => 0),
    getValueInRange: jest.fn(() => ''),
  }
  const decorations = { set: jest.fn(), clear: jest.fn() }
  const dispose = jest.fn()
  const editor = {
    getModel: jest.fn(() => model),
    createDecorationsCollection: jest.fn(() => decorations),
    executeEdits: jest.fn(),
    pushUndoStop: jest.fn(),
    getSelection: jest.fn(() => null),
    getSelections: jest.fn(() => null),
    setSelection: jest.fn(),
    getContainerDomNode: jest.fn(() => document.createElement('div')),
    getTargetAtClientPoint: jest.fn(() => null),
    onDidChangeModelContent: jest.fn(() => ({ dispose })),
  }
  return { editor, decorations, dispose }
}

const renderCollapse = (value: string) => {
  const { editor, decorations, dispose } = createEditor(value)
  const monacoObjects = {
    current: { editor, monaco },
  } as unknown as UseVectorEmbeddingCollapseProps['monacoObjects']
  const view = renderHook(() =>
    useVectorEmbeddingCollapse({ monacoObjects, query: value }),
  )
  return { ...view, editor, decorations, dispose }
}

describe('useVectorEmbeddingCollapse', () => {
  beforeEach(() => {
    resetVectorEmbeddingPlaceholders()
  })

  it('collapses a detected embedding to a placeholder in the model', () => {
    const { editor } = renderCollapse(`HSET k v "${FP32_ESCAPED}"`)

    expect(editor.executeEdits).toHaveBeenCalled()
    const [, edits] = editor.executeEdits.mock.calls[0]
    expect(edits[0].text).toMatch(/^\[▸vector·\d+dims#.+\]$/)
    // Wrapped in undo stops so Ctrl+Z lands on the raw value first.
    expect(editor.pushUndoStop).toHaveBeenCalled()
  })

  it('draws hidden, toggle and copy chips for a known placeholder', () => {
    const placeholder = collapseVectorEmbeddingValue(`"${FP32_ESCAPED}"`, 3, 12)
    const { decorations } = renderCollapse(`HSET k v ${placeholder}`)

    expect(decorations.set).toHaveBeenCalled()
    const [drawn] = decorations.set.mock.calls.at(-1)!
    expect(drawn).toHaveLength(3)
  })

  it('omits the copy chip for a value-less (stale) placeholder', () => {
    // A placeholder-shaped token whose value is not in this session's store.
    const { decorations } = renderCollapse('HSET k v [▸vector·3dims#gone-9]')

    const [drawn] = decorations.set.mock.calls.at(-1)!
    // hidden + toggle only, no copy button.
    expect(drawn).toHaveLength(2)
  })

  it('disposes the content-change subscription on unmount', () => {
    const { unmount, editor, dispose } = renderCollapse(
      `HSET k v "${FP32_ESCAPED}"`,
    )

    expect(editor.onDidChangeModelContent).toHaveBeenCalled()
    unmount()
    expect(dispose).toHaveBeenCalled()
  })
})
