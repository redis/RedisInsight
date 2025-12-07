import React from 'react'
import { render } from 'uiSrc/utils/test-utils'

import MonacoYaml from './MonacoYaml'

const monacoTestId = 'monaco-yaml'

describe('MonacoYaml', () => {
  it('should render', () => {
    const { queryByTestId } = render(
      <MonacoYaml
        schema={{}}
        value="val"
        onChange={jest.fn()}
        data-testid={monacoTestId}
      />,
    )
    expect(queryByTestId(monacoTestId)).toBeInTheDocument()
  })
})
