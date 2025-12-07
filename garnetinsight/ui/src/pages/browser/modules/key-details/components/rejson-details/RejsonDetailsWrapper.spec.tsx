import React from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { instance, mock } from 'ts-mockito'
import { render } from 'uiSrc/utils/test-utils'
import { EditorType } from 'uiSrc/slices/interfaces'
import { stringToBuffer } from 'uiSrc/utils'

import { RejsonDetailsWrapper, Props } from './RejsonDetailsWrapper'

jest.mock('react-redux', () => ({
  useDispatch: jest.fn(),
  useSelector: jest.fn(),
  connect: () => (Component: any) => Component,
}))

jest.mock('uiSrc/slices/browser/rejson', () => ({
  ...jest.requireActual('uiSrc/slices/browser/rejson'),
  fetchReJSON: jest.fn((key) => ({ type: 'FETCH_REJSON', payload: key })),
}))

const mockedProps = mock<Props>()

const mockUseSelector = useSelector as jest.Mock
const mockUseDispatch = useDispatch as jest.Mock

type Selector = {
  name: string
}

const commonSelectorsMock = (selector: Selector) => {
  if (selector.name === 'rejsonSelector') {
    return { loading: false, editorType: EditorType.Default }
  }
  if (selector.name === 'rejsonDataSelector') {
    return { data: '{}', downloaded: true, type: 'string', path: '' }
  }
  if (selector.name === 'selectedKeyDataSelector') {
    return {
      name: stringToBuffer('test-key'),
      nameString: 'test-key',
      length: 1,
    }
  }
  if (selector.name === 'keysSelector') {
    return { viewType: 'Browser' }
  }
  if (selector.name === 'connectedInstanceSelector') {
    return { id: 'instanceId' }
  }
  return {}
}

describe('RejsonDetailsWrapper', () => {
  const mockDispatch = jest.fn()

  beforeEach(() => {
    jest.clearAllMocks()
    mockUseDispatch.mockReturnValue(mockDispatch)
  })

  it('should render', () => {
    mockUseSelector.mockImplementation(commonSelectorsMock)

    expect(
      render(<RejsonDetailsWrapper {...instance(mockedProps)} />),
    ).toBeTruthy()
  })

  it('should not dispatch fetchReJSON on init', () => {
    let editorType = EditorType.Default

    mockUseSelector.mockImplementation((selector) => {
      if (selector.name === 'rejsonSelector') {
        return { loading: false, editorType }
      }
      return commonSelectorsMock(selector)
    })

    const { rerender } = render(
      <RejsonDetailsWrapper {...instance(mockedProps)} />,
    )

    editorType = EditorType.Text
    rerender(<RejsonDetailsWrapper {...instance(mockedProps)} />)

    expect(mockDispatch).not.toHaveBeenCalledWith({
      type: 'FETCH_REJSON',
      payload: expect.anything(),
    })
  })
})
