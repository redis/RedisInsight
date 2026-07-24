import { cloneDeep } from 'lodash'
import React from 'react'
import { instance, mock } from 'ts-mockito'
import { cleanup, mockedStore, render, waitFor } from 'uiSrc/utils/test-utils'
import { resourcesService } from 'uiSrc/services'
import InternalPage from '../InternalPage'
import LazyInternalPage, { Props } from './LazyInternalPage'

const mockedProps = mock<Props>()

let store: typeof mockedStore
beforeEach(() => {
  cleanup()
  store = cloneDeep(mockedStore)
  store.clearActions()
})

jest.mock('uiSrc/services', () => ({
  ...jest.requireActual('uiSrc/services'),
  sessionStorageService: {
    set: jest.fn(),
    get: jest.fn(),
  },
  resourcesService: {
    get: jest.fn(),
  },
}))

jest.mock('../InternalPage', () => ({
  __esModule: true,
  default: jest.fn(() => null),
}))

const mockedResourcesGet = resourcesService.get as jest.Mock
const mockedInternalPage = InternalPage as unknown as jest.Mock

/**
 * LazyInternalPage tests
 *
 * @group component
 */
describe('LazyInternalPage', () => {
  beforeEach(() => {
    mockedResourcesGet.mockReset()
    mockedInternalPage.mockClear()
  })

  it('should render', async () => {
    mockedResourcesGet.mockResolvedValue({ status: 200, data: '' })

    const { container } = render(
      <LazyInternalPage {...instance(mockedProps)} />,
    )
    expect(container).toBeTruthy()

    await waitFor(() => {
      expect(mockedResourcesGet).toHaveBeenCalled()
    })
  })

  it('should pass the fetched content to InternalPage as raw markdown, unformatted', async () => {
    const rawMarkdown = '# Raw Heading\n\nSome *raw* markdown text.'
    mockedResourcesGet.mockResolvedValue({ status: 200, data: rawMarkdown })

    render(
      <LazyInternalPage
        {...instance(mockedProps)}
        path="/quick-guides/document.md"
      />,
    )

    await waitFor(() => {
      expect(mockedInternalPage).toHaveBeenCalledWith(
        expect.objectContaining({ content: rawMarkdown }),
        expect.anything(),
      )
    })
  })
})
