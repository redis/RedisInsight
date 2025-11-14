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

const makeProps = (
  columnId: string,
  overrides: Partial<ReturnType<typeof rdiInstanceFactory.build>> = {},
) => {
  const instance = rdiInstanceFactory.build({
    id: 'id-1',
    name: 'Endpoint A',
    url: 'https://example',
    ...overrides,
  })
  return {
    row: { original: instance } as any,
    column: { id: columnId } as any,
    instance,
  }
}

describe('RdiInstancesListCell', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('should render null when value is missing for the column', () => {
    const { row, column } = makeProps('version', { version: undefined as any })
    const { container } = render(
      <RdiInstancesListCell {...({ row, column } as any)} />,
    )
    expect(container.firstChild).toBeNull()
  })

  it('should render text value and data-testid for a string field (name)', () => {
    const { row, column, instance } = makeProps('name', {
      id: 'cell-1',
      name: 'My Endpoint',
    })

    render(<RdiInstancesListCell {...({ row, column } as any)} />)

    expect(screen.getByText('My Endpoint')).toBeInTheDocument()
    expect(
      screen.getByTestId(`rdi-list-cell-${instance.id}-${instance.name}`),
    ).toBeInTheDocument()
  })

  it('should not show copy icon for non-url field', () => {
    const { row, column } = makeProps('name')

    render(<RdiInstancesListCell {...({ row, column } as any)} />)

    expect(screen.queryByRole('button')).not.toBeInTheDocument()
  })

  it('should show copy icon and call handleCopyUrl with url text and id', async () => {
    const { row, column, instance } = makeProps('url', {
      id: 'cpy-1',
      url: 'https://ri.example',
    })

    render(<RdiInstancesListCell {...({ row, column } as any)} />)

    const btn = screen.getByRole('button')
    await userEvent.click(btn, { pointerEventsCheck: 0 })

    expect(mockHandleCopyUrl).toHaveBeenCalledTimes(1)
    const [evt, text, id] = mockHandleCopyUrl.mock.calls[0]
    expect(evt).toBeTruthy()
    expect(text).toBe(instance.url)
    expect(id).toBe(instance.id)
  })

  it('should format lastConnection via lastConnectionFormat and render formatted text (no copy icon)', async () => {
    const date = new Date('2023-01-01T00:00:00.000Z')
    const { row, column } = makeProps('lastConnection', {
      id: 'last-1',
      lastConnection: date,
    })

    render(<RdiInstancesListCell {...({ row, column } as any)} />)

    expect(lastConnectionFormat).toHaveBeenCalledWith(date as any)
    expect(screen.getByText('3 min ago')).toBeInTheDocument()
    expect(screen.queryByRole('button')).not.toBeInTheDocument()
  })
})
