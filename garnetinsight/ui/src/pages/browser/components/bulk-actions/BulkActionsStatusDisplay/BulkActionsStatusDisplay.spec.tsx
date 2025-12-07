import React from 'react'
import { render, screen } from 'uiSrc/utils/test-utils'
import BulkActionsStatusDisplay, {
  BulkActionsStatusDisplayProps,
} from './BulkActionsStatusDisplay'
import { faker } from '@faker-js/faker/locale/af_ZA'
import { BulkActionsStatus } from 'uiSrc/constants'

const renderBulkActionsStatusDisplay = (
  props?: Partial<BulkActionsStatusDisplayProps>,
) => {
  const defaultProps: BulkActionsStatusDisplayProps = {
    status: faker.helpers.enumValue(BulkActionsStatus),
    total: faker.number.int({ min: 0, max: 1000 }),
    scanned: faker.number.int({ min: 0, max: 1000 }),
  }

  return render(<BulkActionsStatusDisplay {...defaultProps} {...props} />)
}

describe('BulkActionsStatusDisplay', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('should render banner when status is in progress', () => {
    const props: BulkActionsStatusDisplayProps = {
      status: BulkActionsStatus.Running,
      total: 200,
      scanned: 50,
    }

    renderBulkActionsStatusDisplay(props)

    const banner = screen.getByTestId('bulk-status-progress')

    expect(banner).toBeInTheDocument()
    expect(banner).toHaveTextContent('In progress: 25%')
  })

  it('should render banner when status is in Aborted', () => {
    const props: BulkActionsStatusDisplayProps = {
      status: BulkActionsStatus.Aborted,
      total: 100,
      scanned: 30,
    }

    renderBulkActionsStatusDisplay(props)

    const banner = screen.getByTestId('bulk-status-stopped')

    expect(banner).toBeInTheDocument()
    expect(banner).toHaveTextContent('Stopped: 30%')
  })

  it('should render banner when status is Completed', () => {
    renderBulkActionsStatusDisplay({ status: BulkActionsStatus.Completed })

    const banner = screen.getByTestId('bulk-status-completed')

    expect(banner).toBeInTheDocument()
    expect(banner).toHaveTextContent('Action completed')
  })

  it('should render banner when status is Disconnected', () => {
    const props: BulkActionsStatusDisplayProps = {
      status: BulkActionsStatus.Disconnected,
      total: 100,
      scanned: 50,
    }

    renderBulkActionsStatusDisplay(props)

    const banner = screen.getByTestId('bulk-status-disconnected')

    expect(banner).toBeInTheDocument()
    expect(banner).toHaveTextContent('Connection Lost: 50%')
  })
})
