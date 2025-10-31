import React from 'react'
import { mock } from 'ts-mockito'
import { render } from 'uiSrc/utils/test-utils'

import CopilotPanel, { Props } from './CopilotPanel'

const mockedProps = mock<Props>()

describe('CopilotPanel', () => {
  it('should render', () => {
    expect(render(<CopilotPanel {...mockedProps} />)).toBeTruthy()
  })
})
