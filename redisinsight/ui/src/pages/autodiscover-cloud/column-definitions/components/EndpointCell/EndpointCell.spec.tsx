import React from 'react'

import { render, screen } from 'uiSrc/utils/test-utils'

import { EndpointCell } from './EndpointCell'

describe('EndpointCell', () => {
  it('should render endpoint text', () => {
    const endpoint = 'redis-12345.c1.us-east-1.ec2.cloud.redislabs.com:12345'
    render(<EndpointCell publicEndpoint={endpoint} />)

    expect(screen.getByText(endpoint)).toBeInTheDocument()
  })

  it('should render copy button', () => {
    const endpoint = 'redis-12345.c1.us-east-1.ec2.cloud.redislabs.com:12345'
    render(<EndpointCell publicEndpoint={endpoint} />)

    const copyButton = screen.getByLabelText('Copy public endpoint')
    expect(copyButton).toBeInTheDocument()
  })

  it('should render both endpoint text and copy button together', () => {
    const endpoint = 'test-endpoint:6379'
    render(<EndpointCell publicEndpoint={endpoint} />)

    expect(screen.getByText(endpoint)).toBeInTheDocument()
    expect(screen.getByLabelText('Copy public endpoint')).toBeInTheDocument()
  })

  it('should render "-" when publicEndpoint is undefined', () => {
    render(<EndpointCell publicEndpoint={undefined} />)

    expect(screen.getByText('-')).toBeInTheDocument()
    expect(
      screen.queryByLabelText('Copy public endpoint'),
    ).not.toBeInTheDocument()
  })

  it('should render "-" when publicEndpoint is empty string', () => {
    render(<EndpointCell publicEndpoint="" />)

    expect(screen.getByText('-')).toBeInTheDocument()
    expect(
      screen.queryByLabelText('Copy public endpoint'),
    ).not.toBeInTheDocument()
  })
})
