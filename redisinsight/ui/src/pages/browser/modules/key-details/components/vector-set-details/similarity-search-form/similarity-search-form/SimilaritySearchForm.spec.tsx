import React from 'react'
import { fireEvent, render, screen } from 'uiSrc/utils/test-utils'

import { SimilaritySearchForm } from './SimilaritySearchForm'

const KEY_NAME = 'mykey'
const TEST_ID = 'similarity-search-form'

const renderForm = (
  overrides: Partial<React.ComponentProps<typeof SimilaritySearchForm>> = {},
) =>
  render(
    <SimilaritySearchForm
      keyName={KEY_NAME}
      data-testid={TEST_ID}
      {...overrides}
    />,
  )

describe('SimilaritySearchForm', () => {
  it('renders the mode toggle, vector input, count, filter and submit', () => {
    renderForm()

    expect(screen.getByTestId(`${TEST_ID}-mode-toggle`)).toBeInTheDocument()
    expect(screen.getByTestId(`${TEST_ID}-vector-input`)).toBeInTheDocument()
    expect(screen.getByTestId(`${TEST_ID}-count-input`)).toBeInTheDocument()
    expect(screen.getByTestId(`${TEST_ID}-filter-input`)).toBeInTheDocument()
    expect(screen.getByTestId(`${TEST_ID}-submit`)).toBeInTheDocument()
  })

  it('renders the supplied `preview` prop verbatim in the preview area', () => {
    renderForm({ preview: 'VSIM mykey VALUES 3 1 2 3 WITHSCORES WITHATTRIBS' })

    expect(screen.getByTestId(`${TEST_ID}-preview-text`)).toHaveTextContent(
      'VSIM mykey VALUES 3 1 2 3 WITHSCORES WITHATTRIBS',
    )
  })

  it('renders the "Redis Command Preview" placeholder when no preview is supplied', () => {
    renderForm()

    expect(screen.getByTestId(`${TEST_ID}-preview`)).toBeInTheDocument()
    expect(screen.getByTestId(`${TEST_ID}-preview-text`)).toHaveTextContent(
      'Redis Command Preview',
    )
  })

  it('renders the placeholder when an empty preview is supplied', () => {
    renderForm({ preview: '' })

    expect(screen.getByTestId(`${TEST_ID}-preview-text`)).toHaveTextContent(
      'Redis Command Preview',
    )
  })

  it('shows the supplied command instead of the placeholder when a non-empty preview is supplied', () => {
    renderForm({ preview: 'VSIM mykey ELE seed WITHSCORES WITHATTRIBS' })

    expect(screen.getByTestId(`${TEST_ID}-preview-text`)).toHaveTextContent(
      'VSIM mykey ELE seed WITHSCORES WITHATTRIBS',
    )
  })

  it('disables the copy button when no preview is supplied', () => {
    renderForm()

    expect(screen.getByTestId(`${TEST_ID}-preview-copy-btn`)).toBeDisabled()
  })

  it('enables the copy button when a non-empty preview is supplied', () => {
    renderForm({ preview: 'VSIM mykey ELE seed WITHSCORES WITHATTRIBS' })

    expect(screen.getByTestId(`${TEST_ID}-preview-copy-btn`)).toBeEnabled()
  })

  it('fires `onStateChange` on mount with the initial form state', () => {
    const onStateChange = jest.fn()
    renderForm({ onStateChange })

    expect(onStateChange).toHaveBeenCalledWith(
      expect.objectContaining({
        mode: 'vector',
        vectorInput: '',
        elementInput: '',
        count: 10,
        filter: '',
      }),
    )
  })

  it('fires `onStateChange` whenever the vector input changes', () => {
    const onStateChange = jest.fn()
    renderForm({ onStateChange })
    onStateChange.mockClear()

    fireEvent.change(screen.getByTestId(`${TEST_ID}-vector-input`), {
      target: { value: '1, 2, 3' },
    })

    expect(onStateChange).toHaveBeenCalledWith(
      expect.objectContaining({ mode: 'vector', vectorInput: '1, 2, 3' }),
    )
  })

  it('fires `onStateChange` with mode=element after switching modes', () => {
    const onStateChange = jest.fn()
    renderForm({ onStateChange })
    onStateChange.mockClear()

    fireEvent.click(screen.getByTestId(`${TEST_ID}-mode-element`))

    expect(onStateChange).toHaveBeenLastCalledWith(
      expect.objectContaining({ mode: 'element' }),
    )
  })

  it('fires `onStateChange` whenever the filter input changes', () => {
    const onStateChange = jest.fn()
    renderForm({ onStateChange })
    onStateChange.mockClear()

    fireEvent.change(screen.getByTestId(`${TEST_ID}-filter-input`), {
      target: { value: '.price > 50' },
    })

    expect(onStateChange).toHaveBeenLastCalledWith(
      expect.objectContaining({ filter: '.price > 50' }),
    )
  })

  it('keeps the submit button disabled until a valid query is provided', () => {
    renderForm()

    const submit = screen.getByTestId(`${TEST_ID}-submit`)
    expect(submit).toBeDisabled()

    fireEvent.change(screen.getByTestId(`${TEST_ID}-vector-input`), {
      target: { value: '1, 2' },
    })

    expect(submit).toBeEnabled()
  })

  it('switches to ELE mode and renders the element input', () => {
    renderForm()

    fireEvent.click(screen.getByTestId(`${TEST_ID}-mode-element`))

    expect(
      screen.queryByTestId(`${TEST_ID}-vector-input`),
    ).not.toBeInTheDocument()
    expect(screen.getByTestId(`${TEST_ID}-element-input`)).toBeInTheDocument()
  })

  it('calls onSubmit with the current form state when the submit button is clicked', () => {
    const onSubmit = jest.fn()
    renderForm({ onSubmit })

    fireEvent.change(screen.getByTestId(`${TEST_ID}-vector-input`), {
      target: { value: '1, 2, 3' },
    })
    fireEvent.click(screen.getByTestId(`${TEST_ID}-submit`))

    expect(onSubmit).toHaveBeenCalledTimes(1)
    expect(onSubmit).toHaveBeenCalledWith(
      expect.objectContaining({
        mode: 'vector',
        vectorInput: '1, 2, 3',
        count: 10,
        filter: '',
      }),
    )
  })

  it('does not call onSubmit when the query is not ready', () => {
    const onSubmit = jest.fn()
    renderForm({ onSubmit })

    fireEvent.click(screen.getByTestId(`${TEST_ID}-submit`))

    expect(onSubmit).not.toHaveBeenCalled()
  })

  it('disables submit when the numeric vector dimension does not match vectorDim', () => {
    renderForm({ vectorDim: 3 })

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
    renderForm({ vectorDim: 3 })

    fireEvent.change(screen.getByTestId(`${TEST_ID}-vector-input`), {
      target: { value: '1, 2, 3' },
    })

    expect(screen.getByTestId(`${TEST_ID}-submit`)).toBeEnabled()
  })

  it('disables submit when the FP32 vector dimension does not match vectorDim', () => {
    renderForm({ vectorDim: 4 })

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

  it('keeps the submit button disabled while the preview is being fetched, even when the query is otherwise valid', () => {
    const onSubmit = jest.fn()
    renderForm({ vectorDim: 3, previewLoading: true, onSubmit })

    fireEvent.change(screen.getByTestId(`${TEST_ID}-vector-input`), {
      target: { value: '1, 2, 3' },
    })

    const submit = screen.getByTestId(`${TEST_ID}-submit`)
    expect(submit).toBeDisabled()

    fireEvent.click(submit)
    expect(onSubmit).not.toHaveBeenCalled()
  })

  describe('reset button', () => {
    it('renders a reset button next to the submit button', () => {
      renderForm()

      expect(screen.getByTestId(`${TEST_ID}-reset`)).toBeInTheDocument()
    })

    it('clears the form fields and fires onReset when clicked', () => {
      const onReset = jest.fn()
      const onStateChange = jest.fn()
      renderForm({ vectorDim: 3, onReset, onStateChange })

      fireEvent.change(screen.getByTestId(`${TEST_ID}-vector-input`), {
        target: { value: '1, 2, 3' },
      })
      fireEvent.change(screen.getByTestId(`${TEST_ID}-filter-input`), {
        target: { value: '.price > 50' },
      })

      onStateChange.mockClear()
      fireEvent.click(screen.getByTestId(`${TEST_ID}-reset`))

      expect(onReset).toHaveBeenCalledTimes(1)
      expect(
        (screen.getByTestId(`${TEST_ID}-vector-input`) as HTMLInputElement)
          .value,
      ).toBe('')
      expect(
        (screen.getByTestId(`${TEST_ID}-filter-input`) as HTMLInputElement)
          .value,
      ).toBe('')
      expect(onStateChange).toHaveBeenLastCalledWith(
        expect.objectContaining({
          mode: 'vector',
          vectorInput: '',
          elementInput: '',
          filter: '',
        }),
      )
    })

    it('disables the reset button while a search is in flight', () => {
      renderForm({ loading: true })

      expect(screen.getByTestId(`${TEST_ID}-reset`)).toBeDisabled()
    })
  })

  it('opens the filter syntax help popover when the trigger is clicked', () => {
    renderForm()

    expect(
      screen.queryByTestId(`${TEST_ID}-filter-help-panel`),
    ).not.toBeInTheDocument()

    fireEvent.click(screen.getByTestId(`${TEST_ID}-filter-help-trigger`))

    expect(
      screen.getByTestId(`${TEST_ID}-filter-help-panel`),
    ).toBeInTheDocument()
  })
})
