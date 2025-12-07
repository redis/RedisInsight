import React from 'react'
import { useDispatch, useSelector } from 'react-redux'

import {
  fireEvent,
  render,
  screen,
  waitForRiPopoverVisible,
} from 'uiSrc/utils/test-utils'
import { Tag } from 'uiSrc/slices/interfaces/tag'
import { TagsCellHeader } from './TagsCellHeader'

jest.mock('react-redux', () => ({
  useDispatch: jest.fn(),
  useSelector: jest.fn(),
  connect: () => (Component: any) => Component,
}))

const mockDispatch = useDispatch as jest.MockedFunction<typeof useDispatch>
const mockSelector = useSelector as jest.MockedFunction<typeof useSelector>

const mockTags: Tag[] = [
  {
    id: '1',
    key: 'env',
    value: 'prod',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: '2',
    key: 'version',
    value: '1.0',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
]

describe('TagsCellHeader', () => {
  beforeEach(() => {
    mockDispatch.mockReturnValue(jest.fn())
    mockSelector.mockReturnValue({
      data: mockTags,
      selectedTags: new Set(),
    })
  })

  it('should render the TagsCellHeader component', () => {
    render(<TagsCellHeader />)
    expect(screen.getByText('Tags')).toBeInTheDocument()
  })

  it('should open the popover when the filter icon is clicked', async () => {
    const { getByRole } = render(<TagsCellHeader />)
    fireEvent.click(getByRole('button'))
    await waitForRiPopoverVisible()

    expect(screen.getByTestId('tag-search')).toBeInTheDocument()
  })

  it('should filter tags based on search input', async () => {
    const { getByRole, getByTestId } = render(<TagsCellHeader />)
    fireEvent.click(getByRole('button'))
    await waitForRiPopoverVisible()

    expect(getByTestId(`${mockTags[0].key}:${mockTags[0].value}`)).toBeVisible()
    expect(getByTestId(`${mockTags[1].key}:${mockTags[1].value}`)).toBeVisible()

    fireEvent.change(getByTestId('tag-search'), {
      target: { value: 'version' },
    })

    expect(getByTestId('tag-search')).toHaveValue('version')
    try {
      getByTestId(`${mockTags[0].key}:${mockTags[0].value}`)
    } catch (e) {
      expect(e).toBeInstanceOf(Error)
      expect(
        (e as Error)?.message.startsWith(
          'Unable to find an element by: [data-testid="env:prod"]',
        ),
      ).toBeTruthy()
    }
    expect(getByTestId(`${mockTags[1].key}:${mockTags[1].value}`)).toBeVisible()
  })
})
