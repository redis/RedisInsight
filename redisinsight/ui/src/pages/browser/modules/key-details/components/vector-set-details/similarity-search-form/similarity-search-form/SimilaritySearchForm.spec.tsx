import React from 'react'
import { fireEvent, render, screen } from 'uiSrc/utils/test-utils'
import { useSimilaritySearchResultFactory } from 'uiSrc/mocks/factories/browser/vectorSet/useSimilaritySearch.factory'

import { useSimilaritySearch } from '../../hooks/useSimilaritySearch'

import { SimilaritySearchForm } from './SimilaritySearchForm'
import { SIMILARITY_SEARCH_FORM_TEST_ID as TEST_ID } from './constants'

// The hook has its own spec covering selectors, debouncing, payload building
// and dispatch. Here we only mock it to keep the form from talking to the
// real store — this spec stays focused on form behavior (UI, validation,
// local state, hook wiring).
jest.mock('../../hooks/useSimilaritySearch', () => ({
  useSimilaritySearch: jest.fn(),
}))

const mockedUseSimilaritySearch = jest.mocked(useSimilaritySearch)

beforeEach(() => {
  jest.clearAllMocks()
  mockedUseSimilaritySearch.mockReturnValue(
    useSimilaritySearchResultFactory.build(),
  )
})

describe('SimilaritySearchForm', () => {
  it('renders the mode toggle, vector input, count, filter and submit', () => {
    render(<SimilaritySearchForm />)

    expect(screen.getByTestId(`${TEST_ID}-mode-toggle`)).toBeInTheDocument()
    expect(screen.getByTestId(`${TEST_ID}-vector-input`)).toBeInTheDocument()
    expect(screen.getByTestId(`${TEST_ID}-count-input`)).toBeInTheDocument()
    expect(screen.getByTestId(`${TEST_ID}-filter-input`)).toBeInTheDocument()
    expect(screen.getByTestId(`${TEST_ID}-submit`)).toBeInTheDocument()
  })

  it('falls back to the "Redis Command Preview" placeholder when the hook has no preview', () => {
    render(<SimilaritySearchForm />)

    expect(
      screen.getByTestId('similarity-search-command-preview-text'),
    ).toHaveTextContent('Redis Command Preview')
    expect(
      screen.getByTestId('similarity-search-command-preview-copy-btn'),
    ).toBeDisabled()
  })

  it('renders the hook-supplied preview verbatim and enables the copy button', () => {
    mockedUseSimilaritySearch.mockReturnValue(
      useSimilaritySearchResultFactory.build({
        preview: 'VSIM mykey ELE seed WITHSCORES WITHATTRIBS',
      }),
    )
    render(<SimilaritySearchForm />)

    expect(
      screen.getByTestId('similarity-search-command-preview-text'),
    ).toHaveTextContent('VSIM mykey ELE seed WITHSCORES WITHATTRIBS')
    expect(
      screen.getByTestId('similarity-search-command-preview-copy-btn'),
    ).toBeEnabled()
  })

  it('keeps the submit button disabled until a valid query is provided', () => {
    render(<SimilaritySearchForm />)

    const submit = screen.getByTestId(`${TEST_ID}-submit`)
    expect(submit).toBeDisabled()

    fireEvent.change(screen.getByTestId(`${TEST_ID}-vector-input`), {
      target: { value: '1, 2' },
    })

    expect(submit).toBeEnabled()
  })

  it('switches to ELE mode and renders the element input', () => {
    render(<SimilaritySearchForm />)

    fireEvent.click(screen.getByTestId(`${TEST_ID}-mode-element`))

    expect(
      screen.queryByTestId(`${TEST_ID}-vector-input`),
    ).not.toBeInTheDocument()
    expect(screen.getByTestId(`${TEST_ID}-element-input`)).toBeInTheDocument()
  })

  it('calls runSimilaritySearch when the submit button is clicked', () => {
    const runSimilaritySearch = jest.fn()
    mockedUseSimilaritySearch.mockReturnValue(
      useSimilaritySearchResultFactory.build({ runSimilaritySearch }),
    )
    render(<SimilaritySearchForm />)

    fireEvent.change(screen.getByTestId(`${TEST_ID}-vector-input`), {
      target: { value: '1, 2, 3' },
    })
    fireEvent.click(screen.getByTestId(`${TEST_ID}-submit`))

    expect(runSimilaritySearch).toHaveBeenCalledTimes(1)
  })

  it('does not call runSimilaritySearch when the query is not ready', () => {
    const runSimilaritySearch = jest.fn()
    mockedUseSimilaritySearch.mockReturnValue(
      useSimilaritySearchResultFactory.build({ runSimilaritySearch }),
    )
    render(<SimilaritySearchForm />)

    fireEvent.click(screen.getByTestId(`${TEST_ID}-submit`))

    expect(runSimilaritySearch).not.toHaveBeenCalled()
  })

  it('disables submit and surfaces a dimension-mismatch error when the numeric vector does not match vectorDim', () => {
    mockedUseSimilaritySearch.mockReturnValue(
      useSimilaritySearchResultFactory.build({ vectorDim: 3 }),
    )
    render(<SimilaritySearchForm />)

    fireEvent.change(screen.getByTestId(`${TEST_ID}-vector-input`), {
      target: { value: '1, 2' },
    })

    expect(screen.getByTestId(`${TEST_ID}-submit`)).toBeDisabled()
    expect(
      screen.getAllByText(
        'Dimension mismatch. Expected 3 values, but received 2',
      ).length,
    ).toBeGreaterThan(0)
  })

  it('enables submit when the numeric vector dimension matches vectorDim', () => {
    mockedUseSimilaritySearch.mockReturnValue(
      useSimilaritySearchResultFactory.build({ vectorDim: 3 }),
    )
    render(<SimilaritySearchForm />)

    fireEvent.change(screen.getByTestId(`${TEST_ID}-vector-input`), {
      target: { value: '1, 2, 3' },
    })

    expect(screen.getByTestId(`${TEST_ID}-submit`)).toBeEnabled()
  })

  it('disables submit when the FP32 vector dimension does not match vectorDim', () => {
    mockedUseSimilaritySearch.mockReturnValue(
      useSimilaritySearchResultFactory.build({ vectorDim: 4 }),
    )
    render(<SimilaritySearchForm />)

    fireEvent.change(screen.getByTestId(`${TEST_ID}-vector-input`), {
      target: { value: '\\x00\\x00\\x80\\x3f\\x00\\x00\\x00\\x40' },
    })

    expect(screen.getByTestId(`${TEST_ID}-submit`)).toBeDisabled()
    expect(
      screen.getAllByText(
        'Dimension mismatch. Expected 4 values, but received 2',
      ).length,
    ).toBeGreaterThan(0)
  })

  it('keeps submit disabled while the preview is being fetched, even when the query is otherwise valid', () => {
    const runSimilaritySearch = jest.fn()
    mockedUseSimilaritySearch.mockReturnValue(
      useSimilaritySearchResultFactory.build({
        vectorDim: 3,
        previewLoading: true,
        runSimilaritySearch,
      }),
    )
    render(<SimilaritySearchForm />)

    fireEvent.change(screen.getByTestId(`${TEST_ID}-vector-input`), {
      target: { value: '1, 2, 3' },
    })

    const submit = screen.getByTestId(`${TEST_ID}-submit`)
    expect(submit).toBeDisabled()

    fireEvent.click(submit)
    expect(runSimilaritySearch).not.toHaveBeenCalled()
  })

  describe('reset button', () => {
    it('renders next to the submit button', () => {
      render(<SimilaritySearchForm />)

      expect(screen.getByTestId(`${TEST_ID}-reset`)).toBeInTheDocument()
    })

    it('clears the form fields and calls resetSimilaritySearch on click', () => {
      const resetSimilaritySearch = jest.fn()
      mockedUseSimilaritySearch.mockReturnValue(
        useSimilaritySearchResultFactory.build({
          vectorDim: 3,
          resetSimilaritySearch,
        }),
      )
      render(<SimilaritySearchForm />)

      fireEvent.change(screen.getByTestId(`${TEST_ID}-vector-input`), {
        target: { value: '1, 2, 3' },
      })
      fireEvent.change(screen.getByTestId(`${TEST_ID}-filter-input`), {
        target: { value: '.price > 50' },
      })

      fireEvent.click(screen.getByTestId(`${TEST_ID}-reset`))

      expect(resetSimilaritySearch).toHaveBeenCalledTimes(1)
      expect(
        (screen.getByTestId(`${TEST_ID}-vector-input`) as HTMLInputElement)
          .value,
      ).toBe('')
      expect(
        (screen.getByTestId(`${TEST_ID}-filter-input`) as HTMLInputElement)
          .value,
      ).toBe('')
    })

    it('is disabled while a search is in flight', () => {
      mockedUseSimilaritySearch.mockReturnValue(
        useSimilaritySearchResultFactory.build({ loading: true }),
      )
      render(<SimilaritySearchForm />)

      expect(screen.getByTestId(`${TEST_ID}-reset`)).toBeDisabled()
    })
  })

  describe('prefillElement prop', () => {
    it('switches to Element mode and seeds the element input when a prefill is provided', () => {
      render(
        <SimilaritySearchForm prefillElement={{ value: 'alpha', nonce: 1 }} />,
      )

      expect(
        screen.queryByTestId(`${TEST_ID}-vector-input`),
      ).not.toBeInTheDocument()
      expect(
        (screen.getByTestId(`${TEST_ID}-element-input`) as HTMLInputElement)
          .value,
      ).toBe('alpha')
    })

    it('re-applies the same value when only the nonce changes', () => {
      const { rerender } = render(
        <SimilaritySearchForm prefillElement={{ value: 'alpha', nonce: 1 }} />,
      )

      fireEvent.change(screen.getByTestId(`${TEST_ID}-element-input`), {
        target: { value: 'beta' },
      })
      expect(
        (screen.getByTestId(`${TEST_ID}-element-input`) as HTMLInputElement)
          .value,
      ).toBe('beta')

      rerender(
        <SimilaritySearchForm prefillElement={{ value: 'alpha', nonce: 2 }} />,
      )

      expect(
        (screen.getByTestId(`${TEST_ID}-element-input`) as HTMLInputElement)
          .value,
      ).toBe('alpha')
    })
  })

  it('opens the filter syntax help popover when the trigger is clicked', () => {
    render(<SimilaritySearchForm />)

    expect(
      screen.queryByTestId('similarity-search-filter-help-panel'),
    ).not.toBeInTheDocument()

    fireEvent.click(screen.getByTestId('similarity-search-filter-help-trigger'))

    expect(
      screen.getByTestId('similarity-search-filter-help-panel'),
    ).toBeInTheDocument()
  })
})
