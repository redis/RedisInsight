import React from 'react'

import { render, screen } from 'uiSrc/utils/test-utils'
import { rdiPipelineStatusFactory } from 'uiSrc/mocks/factories/rdi/RdiPipelineStatus.factory'
import Status from './Status'

const mockedProps = rdiPipelineStatusFactory.build()

describe('Status', () => {
  it('should render', () => {
    const { container } = render(<Status data={mockedProps} />)
    expect(container).toBeInTheDocument()
  })

  it('should render the title correctly', () => {
    render(<Status data={mockedProps} />)
    expect(screen.getByText('General info')).toBeInTheDocument()
  })

  it('should render all status labels correctly', () => {
    render(<Status data={mockedProps} />)

    expect(screen.getByText('RDI version')).toBeInTheDocument()
    expect(screen.getByText('RDI database address')).toBeInTheDocument()
    expect(screen.getByText('Run status')).toBeInTheDocument()
    expect(screen.getByText('Sync mode')).toBeInTheDocument()
  })

  it('should render with different data values', () => {
    const customProps = rdiPipelineStatusFactory.build({
      rdiVersion: '2.0.0',
      address: 'localhost:6380',
      runStatus: 'stopped',
      syncMode: 'initial-sync',
    })

    render(<Status data={customProps} />)

    expect(screen.getByText('2.0.0')).toBeInTheDocument()
    expect(screen.getByText('localhost:6380')).toBeInTheDocument()
    expect(screen.getByText('stopped')).toBeInTheDocument()
    expect(screen.getByText('initial-sync')).toBeInTheDocument()
  })

  it('should handle empty string values', () => {
    const emptyProps = rdiPipelineStatusFactory.build({
      rdiVersion: '',
      address: '',
      runStatus: '',
      syncMode: '',
    })

    render(<Status data={emptyProps} />)

    expect(screen.getByText('RDI version')).toBeInTheDocument()
    expect(screen.getByText('RDI database address')).toBeInTheDocument()
    expect(screen.getByText('Run status')).toBeInTheDocument()
    expect(screen.getByText('Sync mode')).toBeInTheDocument()
  })
})
