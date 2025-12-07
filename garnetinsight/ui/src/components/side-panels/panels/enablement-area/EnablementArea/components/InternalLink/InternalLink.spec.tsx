import React from 'react'
import { instance, mock } from 'ts-mockito'
import { fireEvent, render } from 'uiSrc/utils/test-utils'
import {
  EnablementAreaProvider,
  defaultValue,
} from 'uiSrc/pages/workbench/contexts/enablementAreaContext'

import InternalLink, { Props } from './InternalLink'

const mockedProps = mock<Props>()

describe('InternalLink', () => {
  it('should render', () => {
    const label = 'Manual'
    const component = render(
      <InternalLink {...instance(mockedProps)} testId="manual" label={label} />,
    )
    const { container } = component

    expect(component).toBeTruthy()
    expect(container).toHaveTextContent(label)
  })
  it('should call onClick function if path provided', () => {
    const openPage = jest.fn()

    const { queryByTestId } = render(
      <EnablementAreaProvider value={{ ...defaultValue, openPage }}>
        <InternalLink
          {...instance(mockedProps)}
          testId="manual"
          path="static/workbench"
          label="Manual"
        />
      </EnablementAreaProvider>,
    )

    const link = queryByTestId(/internal-link-manual/)
    fireEvent.click(link as Element)
    expect(openPage).toBeCalled()
  })
  it('should not call onClick function if path not provided', () => {
    const openPage = jest.fn()

    const { queryByTestId } = render(
      <EnablementAreaProvider value={{ ...defaultValue, openPage }}>
        <InternalLink
          {...instance(mockedProps)}
          testId="manual"
          label="Manual"
        />
      </EnablementAreaProvider>,
    )

    const link = queryByTestId(/internal-link-manual/)
    fireEvent.click(link as Element)
    expect(openPage).not.toBeCalled()
  })
})
