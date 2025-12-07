import React from 'react'
import { render, screen } from 'uiSrc/utils/test-utils'

import JSONView from './JSONView'

describe('JSONViewer', () => {
  it('should render proper json', () => {
    const jsx = JSONView({ value: JSON.stringify({}) })
    render(jsx.value as React.ReactElement)

    expect(jsx.isValid).toBeTruthy()
    expect(screen.queryByTestId('value-as-json')).toBeInTheDocument()
  })

  it('should not render invalid json', () => {
    const jsx = JSONView({ value: 'zxc' })

    expect(jsx.value).toEqual('zxc')
    expect(jsx.isValid).toBeFalsy()
  })
})
