import React from 'react'
import { render, screen, userEvent } from 'uiSrc/utils/test-utils'

import LoadSampleDataset from './LoadSampleDataset'
import { DEFAULT_SAMPLE_DATASET, SAMPLE_DATASETS } from './data'
import { Props } from './LoadSampleDataset.types'

const defaultProps: Props = {
  dataset: DEFAULT_SAMPLE_DATASET,
  onDatasetChange: jest.fn(),
}

const renderComponent = (propsOverride?: Partial<Props>) => {
  const props = { ...defaultProps, ...propsOverride }
  return render(<LoadSampleDataset {...props} />)
}

const selectDataset = async (label: string) => {
  await userEvent.click(screen.getByTestId('sample-dataset-select'))
  await userEvent.click(await screen.findByText(label))
}

describe('LoadSampleDataset', () => {
  it('renders the selector and every preview row of the default dataset with its index and value', () => {
    renderComponent()

    expect(screen.getByTestId('sample-dataset-select')).toBeInTheDocument()

    DEFAULT_SAMPLE_DATASET.previewRows.forEach(({ index, value }) => {
      const row = screen.getByTestId(`load-sample-dataset-preview-${index}`)
      expect(row).toHaveTextContent(index)
      if (value) {
        expect(row).toHaveTextContent(value)
      }
    })
  })

  it('shows an "and N more" hint derived from the element count', () => {
    renderComponent()

    const remaining =
      DEFAULT_SAMPLE_DATASET.elementCount -
      DEFAULT_SAMPLE_DATASET.previewRows.length
    expect(
      screen.getByTestId('load-sample-dataset-preview-more'),
    ).toHaveTextContent(`${remaining} more`)
  })

  it('renders the default dataset info as compact label/value rows', () => {
    renderComponent()

    const info = screen.getByTestId('load-sample-dataset-info')
    expect(info).toHaveTextContent(DEFAULT_SAMPLE_DATASET.keyName)
    expect(info).toHaveTextContent(`${DEFAULT_SAMPLE_DATASET.elementCount}`)
    expect(info).toHaveTextContent(DEFAULT_SAMPLE_DATASET.highestIndex)
    expect(info).toHaveTextContent(DEFAULT_SAMPLE_DATASET.description)
  })

  it('calls onDatasetChange with the dataset chosen from the dropdown', async () => {
    const onDatasetChange = jest.fn()
    renderComponent({ onDatasetChange })

    const logDataset = SAMPLE_DATASETS.find(
      ({ collectionName }) => collectionName === 'server-errors',
    )!
    await selectDataset(logDataset.label)

    expect(onDatasetChange).toHaveBeenCalledWith(logDataset)
  })

  it('renders the preview and info for the provided dataset', () => {
    const logDataset = SAMPLE_DATASETS.find(
      ({ collectionName }) => collectionName === 'server-errors',
    )!
    renderComponent({ dataset: logDataset })

    logDataset.previewRows.forEach(({ index, value }) => {
      const row = screen.getByTestId(`load-sample-dataset-preview-${index}`)
      if (value) {
        expect(row).toHaveTextContent(value)
      }
    })

    const info = screen.getByTestId('load-sample-dataset-info')
    expect(info).toHaveTextContent(logDataset.keyName)
    expect(info).toHaveTextContent(`${logDataset.elementCount}`)
    expect(info).toHaveTextContent(logDataset.highestIndex)
    expect(info).toHaveTextContent(logDataset.description)
  })
})
