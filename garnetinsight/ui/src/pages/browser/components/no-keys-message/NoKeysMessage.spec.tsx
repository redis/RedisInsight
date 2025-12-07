import React from 'react'
import { instance, mock } from 'ts-mockito'
import { cloneDeep } from 'lodash'
import { render, mockedStore, cleanup } from 'uiSrc/utils/test-utils'

import { keysSelector } from 'uiSrc/slices/browser/keys'
import { SearchMode } from 'uiSrc/slices/interfaces/keys'
import { redisearchSelector } from 'uiSrc/slices/browser/redisearch'
import NoKeysMessage, { Props } from './NoKeysMessage'

const mockedProps = mock<Props>()

let store: typeof mockedStore
beforeEach(() => {
  cleanup()
  store = cloneDeep(mockedStore)
  store.clearActions()
})

jest.mock('uiSrc/slices/browser/keys', () => ({
  ...jest.requireActual('uiSrc/slices/browser/keys'),
  keysSelector: jest.fn().mockReturnValue({
    searchMode: 'Pattern',
    filter: null,
    search: '',
    viewType: 'Browser',
  }),
}))

jest.mock('uiSrc/slices/browser/redisearch', () => ({
  ...jest.requireActual('uiSrc/slices/browser/redisearch'),
  redisearchSelector: jest.fn().mockReturnValue({
    search: '',
    isSearched: false,
    selectedIndex: null,
  }),
}))

describe('NoKeysMessage', () => {
  it('should render', () => {
    expect(render(<NoKeysMessage {...mockedProps} />)).toBeTruthy()
  })

  describe('SearchMode = Pattern', () => {
    it('NoKeysFound should be rendered if total=0', () => {
      const { queryByTestId } = render(
        <NoKeysMessage {...instance(mockedProps)} total={0} />,
      )
      expect(queryByTestId('no-result-found-msg')).toBeInTheDocument()
    })

    it('"scan-no-results-found" should be rendered if searched and scanned < total', () => {
      const keysSelectorMock = jest.fn().mockReturnValue({
        isSearched: true,
        searchMode: SearchMode.Pattern,
      })
      const total = 100

      ;(keysSelector as jest.Mock).mockImplementation(keysSelectorMock)
      const { queryByTestId } = render(
        <NoKeysMessage
          {...instance(mockedProps)}
          total={total}
          scanned={total - 1}
        />,
      )

      expect(queryByTestId('scan-no-results-found')).toBeInTheDocument()
    })

    it('"no-result-found" should be rendered if searched and scanned===total', () => {
      const keysSelectorMock = jest.fn().mockReturnValue({
        isSearched: true,
        searchMode: SearchMode.Pattern,
      })
      const total = 100

      ;(keysSelector as jest.Mock).mockImplementation(keysSelectorMock)
      const { container } = render(
        <NoKeysMessage
          {...instance(mockedProps)}
          total={total}
          scanned={total}
        />,
      )

      expect(
        container.querySelector('[data-test-subj="no-result-found"]'),
      ).toBeInTheDocument()
    })

    it('"scan-no-results-found" should be rendered if filtered and scanned<total', () => {
      const keysSelectorMock = jest.fn().mockReturnValue({
        isFiltered: true,
        searchMode: SearchMode.Pattern,
      })
      const total = 100

      ;(keysSelector as jest.Mock).mockImplementation(keysSelectorMock)
      const { queryByTestId } = render(
        <NoKeysMessage
          {...instance(mockedProps)}
          total={total}
          scanned={total - 1}
        />,
      )

      expect(queryByTestId('scan-no-results-found')).toBeInTheDocument()
    })
  })

  describe('SearchMode = RediSearch', () => {
    it('"no-result-select-index" should be rendered if searched and scanned < total', () => {
      const keysSelectorMock = jest.fn().mockReturnValue({
        isSearched: true,
        searchMode: SearchMode.Redisearch,
      })
      const redisearchSelectorMock = jest.fn().mockReturnValue({
        selectedIndex: null,
      })
      const total = 100

      ;(keysSelector as jest.Mock).mockImplementation(keysSelectorMock)
      ;(redisearchSelector as jest.Mock).mockImplementation(
        redisearchSelectorMock,
      )
      const { queryByTestId } = render(
        <NoKeysMessage
          {...instance(mockedProps)}
          total={total}
          scanned={total - 1}
        />,
      )

      expect(queryByTestId('no-result-select-index')).toBeInTheDocument()
    })
    it('"no-result-found-only" should be rendered total = 0', () => {
      const keysSelectorMock = jest.fn().mockReturnValue({
        isSearched: true,
        searchMode: SearchMode.Redisearch,
      })
      const redisearchSelectorMock = jest.fn().mockReturnValue({
        selectedIndex: '123',
      })
      const total = 0

      ;(keysSelector as jest.Mock).mockImplementation(keysSelectorMock)
      ;(redisearchSelector as jest.Mock).mockImplementation(
        redisearchSelectorMock,
      )
      const { queryByTestId } = render(
        <NoKeysMessage {...instance(mockedProps)} total={total} />,
      )

      expect(queryByTestId('no-result-found-only')).toBeInTheDocument()
    })

    it('"no-result-found-only" should be rendered if searched and scanned<total', () => {
      const keysSelectorMock = jest.fn().mockReturnValue({
        searchMode: SearchMode.Redisearch,
      })
      const redisearchSelectorMock = jest.fn().mockReturnValue({
        isSearched: true,
        selectedIndex: '123',
      })
      const total = 100

      ;(keysSelector as jest.Mock).mockImplementation(keysSelectorMock)
      ;(redisearchSelector as jest.Mock).mockImplementation(
        redisearchSelectorMock,
      )
      const { queryByTestId } = render(
        <NoKeysMessage
          {...instance(mockedProps)}
          total={total}
          scanned={total - 1}
        />,
      )

      expect(queryByTestId('no-result-found-only')).toBeInTheDocument()
    })
  })
})
