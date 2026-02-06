import React from 'react'
import { render, screen, fireEvent } from 'uiSrc/utils/test-utils'

import { PickSampleDataModal } from './PickSampleDataModal'
import {
  PickSampleDataModalProps,
  SampleDataContent,
} from './PickSampleDataModal.types'
import { SAMPLE_DATA_OPTIONS } from './PickSampleDataModal.constants'

const mockedOnSelectDataset = jest.fn()
const mockedOnCancel = jest.fn()
const mockedOnSeeIndexDefinition = jest.fn()
const mockedOnStartQuerying = jest.fn()

const renderComponent = (props?: Partial<PickSampleDataModalProps>) => {
  const defaultProps: PickSampleDataModalProps = {
    isOpen: true,
    selectedDataset: null,
    onSelectDataset: mockedOnSelectDataset,
    onCancel: mockedOnCancel,
    onSeeIndexDefinition: mockedOnSeeIndexDefinition,
    onStartQuerying: mockedOnStartQuerying,
  }

  return render(<PickSampleDataModal {...defaultProps} {...props} />)
}

describe('PickSampleDataModal', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('should render nothing when isOpen is false', () => {
    renderComponent({ isOpen: false })

    expect(
      screen.queryByTestId('pick-sample-data-modal--heading'),
    ).not.toBeInTheDocument()
  })

  it('should render modal content when isOpen is true', () => {
    renderComponent()

    expect(
      screen.getByTestId('pick-sample-data-modal--heading'),
    ).toBeInTheDocument()
    expect(
      screen.getByTestId('pick-sample-data-modal--subtitle'),
    ).toBeInTheDocument()
    expect(
      screen.getByTestId('pick-sample-data-modal--illustration'),
    ).toBeInTheDocument()
  })

  it('should render all sample data option cards', () => {
    renderComponent()

    SAMPLE_DATA_OPTIONS.forEach((option) => {
      expect(
        screen.getByTestId(`pick-sample-data-modal--option-${option.value}`),
      ).toBeInTheDocument()
      expect(screen.getByText(option.label)).toBeInTheDocument()
      expect(screen.getByText(option.description)).toBeInTheDocument()
    })
  })

  it('should call onSelectDataset when a card is clicked', () => {
    renderComponent()

    const ecommerceOption = screen.getByTestId(
      `pick-sample-data-modal--option-${SampleDataContent.E_COMMERCE_DISCOVERY}`,
    )
    fireEvent.click(ecommerceOption)

    expect(mockedOnSelectDataset).toHaveBeenCalledWith(
      SampleDataContent.E_COMMERCE_DISCOVERY,
    )
  })

  it('should disable "Start querying" button when no dataset is selected', () => {
    renderComponent({ selectedDataset: null })

    const startButton = screen.getByTestId(
      'pick-sample-data-modal--start-querying',
    )
    expect(startButton).toBeDisabled()
  })

  it('should disable "See index definition" button when no dataset is selected', () => {
    renderComponent({ selectedDataset: null })

    const seeIndexButton = screen.getByTestId(
      'pick-sample-data-modal--see-index-definition',
    )
    expect(seeIndexButton).toBeDisabled()
  })

  it('should enable action buttons when a dataset is selected', () => {
    renderComponent({
      selectedDataset: SampleDataContent.E_COMMERCE_DISCOVERY,
    })

    const startButton = screen.getByTestId(
      'pick-sample-data-modal--start-querying',
    )
    const seeIndexButton = screen.getByTestId(
      'pick-sample-data-modal--see-index-definition',
    )

    expect(startButton).not.toBeDisabled()
    expect(seeIndexButton).not.toBeDisabled()
  })

  it('should call onStartQuerying with selected dataset when "Start querying" is clicked', () => {
    renderComponent({
      selectedDataset: SampleDataContent.CONTENT_RECOMMENDATIONS,
    })

    const startButton = screen.getByTestId(
      'pick-sample-data-modal--start-querying',
    )
    fireEvent.click(startButton)

    expect(mockedOnStartQuerying).toHaveBeenCalledWith(
      SampleDataContent.CONTENT_RECOMMENDATIONS,
    )
  })

  it('should call onSeeIndexDefinition with selected dataset when "See index definition" is clicked', () => {
    renderComponent({
      selectedDataset: SampleDataContent.E_COMMERCE_DISCOVERY,
    })

    const seeIndexButton = screen.getByTestId(
      'pick-sample-data-modal--see-index-definition',
    )
    fireEvent.click(seeIndexButton)

    expect(mockedOnSeeIndexDefinition).toHaveBeenCalledWith(
      SampleDataContent.E_COMMERCE_DISCOVERY,
    )
  })

  it('should call onCancel when "Cancel" button is clicked', () => {
    renderComponent()

    const cancelButton = screen.getByTestId('pick-sample-data-modal--cancel')
    fireEvent.click(cancelButton)

    expect(mockedOnCancel).toHaveBeenCalled()
  })

  it('should call onCancel when close (X) button is clicked', () => {
    renderComponent()

    const closeButton = screen.getByTestId('pick-sample-data-modal--close')
    fireEvent.click(closeButton)

    expect(mockedOnCancel).toHaveBeenCalled()
  })
})
