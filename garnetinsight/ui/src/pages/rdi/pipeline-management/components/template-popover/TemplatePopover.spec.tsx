import React from 'react'
import { cloneDeep } from 'lodash'
import { instance, mock } from 'ts-mockito'

import {
  fireEvent,
  render,
  cleanup,
  mockedStore,
  screen,
} from 'uiSrc/utils/test-utils'
import { getPipelineStrategies } from 'uiSrc/slices/rdi/pipeline'
import { RdiPipelineTabs } from 'uiSrc/slices/interfaces'
import TemplatePopover, { Props } from './TemplatePopover'

const mockedProps = mock<Props>()

let store: typeof mockedStore
beforeEach(() => {
  cleanup()
  store = cloneDeep(mockedStore)
  store.clearActions()
})

describe('TemplatePopover', () => {
  it('should render', () => {
    expect(render(<TemplatePopover {...instance(mockedProps)} />)).toBeTruthy()
  })

  it('should call proper actions on open popover', () => {
    const mockSetIsPopoverOpen = jest.fn()

    render(
      <TemplatePopover
        {...instance(mockedProps)}
        source={RdiPipelineTabs.Config}
        setIsPopoverOpen={mockSetIsPopoverOpen}
      />,
    )

    fireEvent.click(
      screen.getByTestId(`template-trigger-${RdiPipelineTabs.Config}`),
    )

    const expectedActions = [getPipelineStrategies()]
    expect(store.getActions().slice(0, expectedActions.length)).toEqual(
      expectedActions,
    )
    expect(mockSetIsPopoverOpen).toBeCalledWith(true)
  })
})
