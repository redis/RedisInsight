import React from 'react'
import { render, screen } from 'uiSrc/utils/test-utils'

import JSONViewer from './JSONViewer'

describe('JSONViewer', () => {
  it('should render proper json', () => {
    const jsx = JSONViewer({ value: JSON.stringify({}) })
    render(jsx.value as React.ReactElement)

    expect(jsx.isValid).toBeTruthy()
    expect(screen.queryByTestId('value-as-json')).toBeInTheDocument()
  })

  it('should not render invalid json', () => {
    const jsx = JSONViewer({ value: 'zxc' })

    expect(jsx.value).toEqual('zxc')
    expect(jsx.isValid).toBeFalsy()
  })
})
