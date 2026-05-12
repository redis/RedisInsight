import { SIMILARITY_SEARCH_COUNT_DEFAULT } from './constants'
import { initialFormState, isQueryReady } from './SimilaritySearchForm.utils'

describe('initialFormState', () => {
  it('returns vector mode with empty inputs and the default count', () => {
    expect(initialFormState()).toEqual({
      mode: 'vector',
      vectorInput: '',
      elementInput: '',
      count: SIMILARITY_SEARCH_COUNT_DEFAULT,
      filter: '',
    })
  })
})

// Vector parsing / dimension matching is already covered by the
// `validateVector` spec. These tests only assert that the form routes the
// element vs. vector branch and translates the validator's output to a
// boolean.
describe('isQueryReady', () => {
  it('is ready in element mode when the element input has a non-empty trimmed value', () => {
    expect(
      isQueryReady({
        ...initialFormState(),
        mode: 'element',
        elementInput: 'a',
      }),
    ).toBe(true)
  })

  it('is not ready in element mode when the element input is empty', () => {
    expect(
      isQueryReady({
        ...initialFormState(),
        mode: 'element',
        elementInput: '',
      }),
    ).toBe(false)
  })

  it('is ready in vector mode when the vector input is valid', () => {
    expect(
      isQueryReady({ ...initialFormState(), vectorInput: '1, 2, 3' }),
    ).toBe(true)
  })

  it('is not ready in vector mode when the vector input is empty or invalid', () => {
    expect(isQueryReady({ ...initialFormState(), vectorInput: '' })).toBe(false)
    expect(
      isQueryReady({ ...initialFormState(), vectorInput: 'not-a-vector' }),
    ).toBe(false)
  })
})
