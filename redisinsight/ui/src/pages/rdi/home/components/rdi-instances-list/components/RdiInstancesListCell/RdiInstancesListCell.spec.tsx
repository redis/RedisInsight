import React from 'react'
import { render, screen, userEvent } from 'uiSrc/utils/test-utils'

import { rdiInstanceFactory } from 'uiSrc/mocks/rdi/RdiInstance.factory'

import RdiInstancesListCell from './RdiInstancesListCell'
import { lastConnectionFormat } from 'uiSrc/utils'

// Mock only the handler used by the cell so we can assert call args
const mockHandleCopyUrl = jest.fn()
jest.mock('../../methods/handlers', () => ({
  ...jest.requireActual('../../methods/handlers'),
  handleCopyUrl: (...args: any[]) => mockHandleCopyUrl(...args),
}))

// Stabilize lastConnection formatting to avoid time-dependence
jest.mock('uiSrc/utils', () => ({
  ...jest.requireActual('uiSrc/utils'),
  lastConnectionFormat: jest.fn(() => '3 min ago'),
}))

const buildRow = (
  overrides: Partial<ReturnType<typeof rdiInstanceFactory.build>> = {},
) => {
  const instance = rdiInstanceFactory.build({
    id: 'id-1',
    name: 'Endpoint A',
    url: 'https://example',
    ...overrides,
  })
  return { row: { original: instance } as any, instance }
}

describe('RdiInstancesListCell', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('should render null when field is not provided', () => {
    const { row } = buildRow()
    const { container } = render(<RdiInstancesListCell {...({ row } as any)} />)
    expect(container.firstChild).toBeNull()
  })

  it('should render text value and data-testid for a string field (name)', () => {
    const { row, instance } = buildRow({ id: 'cell-1', name: 'My Endpoint' })

    render(<RdiInstancesListCell {...({ row } as any)} field="name" />)

    expect(screen.getByText('My Endpoint')).toBeInTheDocument()
    // data-testid includes id and text
    expect(
      screen.getByTestId(`rdi-list-cell-${instance.id}-${instance.name}`),
    ).toBeInTheDocument()
  })

  it('should not show copy icon by default', () => {
    const { row } = buildRow()

    render(<RdiInstancesListCell {...({ row } as any)} field="url" />)

    expect(screen.queryByRole('button')).not.toBeInTheDocument()
  })

  it('should show copy icon and call handleCopyUrl with url text and id', async () => {
    const { row, instance } = buildRow({
      id: 'cpy-1',
      url: 'https://ri.example',
    })

    render(
      <RdiInstancesListCell {...({ row } as any)} field="url" withCopyIcon />,
    )

    const btn = screen.getByRole('button')
    await userEvent.click(btn, { pointerEventsCheck: 0 })

    expect(mockHandleCopyUrl).toHaveBeenCalledTimes(1)
    const [evt, text, id] = mockHandleCopyUrl.mock.calls[0]
    expect(evt).toBeTruthy()
    expect(text).toBe(instance.url)
    expect(id).toBe(instance.id)
  })

  it('should format lastConnection via lastConnectionFormat and pass formatted text to handler', async () => {
    const date = new Date('2023-01-01T00:00:00.000Z')
    const { row, instance } = buildRow({ id: 'last-1', lastConnection: date })

    render(
      <RdiInstancesListCell
        {...({ row } as any)}
        field="lastConnection"
        withCopyIcon
      />,
    )

    // Uses mocked formatter
    expect(lastConnectionFormat).toHaveBeenCalledWith(date as any)
    expect(screen.getByText('3 min ago')).toBeInTheDocument()

    const btn = screen.getByRole('button')
    await userEvent.click(btn, { pointerEventsCheck: 0 })

    const [, text, id] = mockHandleCopyUrl.mock.calls[0]
    expect(text).toBe('3 min ago')
    expect(id).toBe(instance.id)
  })
})
