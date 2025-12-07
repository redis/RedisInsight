import React from 'react'
import reactRouterDom from 'react-router-dom'
import { instance, mock } from 'ts-mockito'
import { render, screen, fireEvent } from 'uiSrc/utils/test-utils'

import InternalLink, { Props } from './InternalLink'

const mockedProps = mock<Props>()

jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useHistory: () => ({
    push: jest.fn,
  }),
}))

describe('InternalLink', () => {
  it('should render', () => {
    expect(render(<InternalLink {...instance(mockedProps)} />)).toBeTruthy()
  })

  it('should call history push with proper path', () => {
    const pushMock = jest.fn()
    reactRouterDom.useHistory = jest.fn().mockReturnValue({ push: pushMock })
    const onClickMock = jest.fn()

    render(
      <InternalLink
        {...instance(mockedProps)}
        path="path"
        onClick={onClickMock}
      />,
    )

    fireEvent.click(screen.getByTestId('internal-link'))

    expect(pushMock).toHaveBeenCalledTimes(1)
    expect(pushMock).toHaveBeenCalledWith('path')
    expect(onClickMock).toBeCalled()
  })
})
