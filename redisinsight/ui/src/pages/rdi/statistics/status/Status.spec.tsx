import React from 'react'

import { render, screen } from 'uiSrc/utils/test-utils'
import { IRdiPipelineStatus } from 'uiSrc/slices/interfaces'
import Status from './Status'

const mockedProps: IRdiPipelineStatus = {
  rdiVersion: '1.2.3',
  address: '127.0.0.1:6379',
  runStatus: 'running',
  syncMode: 'CDC',
}

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

  it('should render all status values correctly', () => {
    render(<Status data={mockedProps} />)

    expect(screen.getByText('1.2.3')).toBeInTheDocument()
    expect(screen.getByText('127.0.0.1:6379')).toBeInTheDocument()
    expect(screen.getByText('running')).toBeInTheDocument()
    expect(screen.getByText('CDC')).toBeInTheDocument()
  })

  it('should render with different data values', () => {
    const customProps: IRdiPipelineStatus = {
      rdiVersion: '2.0.0',
      address: 'localhost:6380',
      runStatus: 'stopped',
      syncMode: 'initial-sync',
    }

    render(<Status data={customProps} />)

    expect(screen.getByText('2.0.0')).toBeInTheDocument()
    expect(screen.getByText('localhost:6380')).toBeInTheDocument()
    expect(screen.getByText('stopped')).toBeInTheDocument()
    expect(screen.getByText('initial-sync')).toBeInTheDocument()
  })

  it('should handle empty string values', () => {
    const emptyProps: IRdiPipelineStatus = {
      rdiVersion: '',
      address: '',
      runStatus: '',
      syncMode: '',
    }

    render(<Status data={emptyProps} />)

    expect(screen.getByText('RDI version')).toBeInTheDocument()
    expect(screen.getByText('RDI database address')).toBeInTheDocument()
    expect(screen.getByText('Run status')).toBeInTheDocument()
    expect(screen.getByText('Sync mode')).toBeInTheDocument()
  })
})
