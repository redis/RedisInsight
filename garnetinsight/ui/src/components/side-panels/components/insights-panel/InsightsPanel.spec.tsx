import React from 'react'
import { mock } from 'ts-mockito'
import { render } from 'uiSrc/utils/test-utils'

import InsightsPanel, { Props } from './InsightsPanel'

const mockedProps = mock<Props>()

describe('CopilotPanel', () => {
  it('should render', () => {
    expect(render(<InsightsPanel {...mockedProps} />)).toBeTruthy()
  })
})
