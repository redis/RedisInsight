import React from 'react'

import { localStorageService } from 'uiSrc/services'
import { render } from 'uiSrc/utils/test-utils'
import { BrowserStorageItem } from 'uiSrc/constants'
import InstancePageTemplate, { getDefaultSizes } from './InstancePageTemplate'

const child = <div />

describe('InstancePageTemplate', () => {
  it('should render', () => {
    expect(
      render(<InstancePageTemplate>{child}</InstancePageTemplate>),
    ).toBeTruthy()
  })

  it('should be called LocalStorage after Component Will Unmount', () => {
    const defaultSizes = getDefaultSizes()
    localStorageService.set = jest.fn()

    const { unmount } = render(
      <InstancePageTemplate>{child}</InstancePageTemplate>,
    )

    unmount()

    expect(localStorageService.set).toBeCalledWith(
      BrowserStorageItem.cliResizableContainer,
      defaultSizes,
    )
  })
})
