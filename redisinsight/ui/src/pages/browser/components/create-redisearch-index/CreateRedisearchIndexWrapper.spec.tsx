import { cloneDeep } from 'lodash'
import React from 'react'
import { createIndex } from 'uiSrc/slices/browser/redisearch'
import {
  render,
  screen,
  fireEvent,
  cleanup,
  mockedStore,
  userEvent,
} from 'uiSrc/utils/test-utils'

import CreateRedisearchIndexWrapper from './CreateRedisearchIndexWrapper'

jest.mock('uiSrc/slices/instances/instances', () => ({
  ...jest.requireActual('uiSrc/slices/instances/instances'),
  connectedInstanceSelector: jest.fn().mockReturnValue({
    id: '1',
    modules: [],
  }),
}))

const onClose = jest.fn()

let store: typeof mockedStore

beforeEach(() => {
  cleanup()
  store = cloneDeep(mockedStore)
  store.clearActions()
})

describe('CreateRedisearchIndexWrapper', () => {
  it('should render', () => {
    expect(
      render(<CreateRedisearchIndexWrapper onClosePanel={onClose} />),
    ).toBeTruthy()
  })

  it('should call onClose after click cross icon', () => {
    render(<CreateRedisearchIndexWrapper onClosePanel={onClose} />)

    fireEvent.click(screen.getByTestId('create-index-close-panel'))
    expect(onClose).toHaveBeenCalled()
    onClose.mockRestore()
  })

  it('should call onClose after click cancel', () => {
    render(<CreateRedisearchIndexWrapper onClosePanel={onClose} />)

    fireEvent.click(screen.getByTestId('create-index-cancel-btn'))
    expect(onClose).toHaveBeenCalled()
    onClose.mockRestore()
  })

  it('should add prefix and delete it', () => {
    const { container } = render(
      <CreateRedisearchIndexWrapper onClosePanel={onClose} />,
    )

    const comboboxInput = container.querySelector(
      '[data-testid="prefix-combobox"] [data-test-subj="autoTagInput"]',
    ) as HTMLInputElement

    fireEvent.change(comboboxInput, { target: { value: 'val1' } })

    fireEvent.keyDown(comboboxInput, { key: 'Enter', code: 13, charCode: 13 })

    const containerLabels = container.querySelector(
      '[data-test-subj="autoTagWrapper"]',
    )!
    expect(containerLabels.querySelector('[title="val1"]')).toBeInTheDocument()

    fireEvent.click(
      containerLabels.querySelector('[data-test-subj="autoTagChip"] button')!,
    )
    expect(
      containerLabels.querySelector('[title="val1"]'),
    ).not.toBeInTheDocument()
  })

  it('should be preselected hash type', () => {
    render(<CreateRedisearchIndexWrapper onClosePanel={onClose} />)

    expect(screen.getByTestId('key-type')).toHaveTextContent('Hash')
  })

  it('should call proper action on submit', () => {
    render(<CreateRedisearchIndexWrapper onClosePanel={onClose} />)

    const expectedActions = [createIndex()]
    fireEvent.click(screen.getByTestId('create-index-btn'))

    expect(store.getActions()).toEqual(expectedActions)
  })

  it('should properly change all fields', async () => {
    const { container, findByText } = render(
      <CreateRedisearchIndexWrapper onClosePanel={onClose} />,
    )
    const comboboxInput = container.querySelector(
      '[data-testid="prefix-combobox"] [data-test-subj="autoTagInput"]',
    ) as HTMLInputElement

    const containerLabels = container.querySelector(
      '[data-test-subj="autoTagWrapper"]',
    )!

    fireEvent.change(screen.getByTestId('index-name'), {
      target: { value: 'index' },
    })
    fireEvent.change(comboboxInput, { target: { value: 'val1' } })

    fireEvent.keyDown(comboboxInput, { key: 'Enter', code: 13, charCode: 13 })

    await userEvent.click(screen.getByTestId('key-type'))
    await userEvent.click(await findByText('JSON'))

    fireEvent.change(screen.getByTestId('identifier-0'), {
      target: { value: 'identifier' },
    })

    await userEvent.click(screen.getByTestId('field-type-0'))
    await userEvent.click(await findByText('GEO'))

    expect(screen.getByTestId('index-name')).toHaveValue('index')
    expect(screen.getByTestId('key-type')).toHaveTextContent('JSON')
    expect(containerLabels.querySelector('[title="val1"]')).toBeInTheDocument()
    expect(screen.getByTestId('identifier-0')).toHaveValue('identifier')
    expect(screen.getByTestId('field-type-0')).toHaveTextContent('GEO')
  })

  it('should render Identifier popover button ', () => {
    render(<CreateRedisearchIndexWrapper onClosePanel={onClose} />)

    expect(screen.getByTestId('identifier-info-icon')).toBeInTheDocument()
  })

  it('should show GEOSHAPE in field type dropdown', async () => {
    const { findByText } = render(
      <CreateRedisearchIndexWrapper onClosePanel={onClose} />,
    )

    await userEvent.click(screen.getByTestId('field-type-0'))

    expect(await findByText('GEOSHAPE')).toBeInTheDocument()
  })
})
