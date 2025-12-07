import React from 'react'
import { render, screen, fireEvent } from 'uiSrc/utils/test-utils'

import { INSTANCES_MOCK } from 'uiSrc/mocks/handlers/instances/instancesHandlers'
import ExportAction from './ExportAction'

describe('ExportAction', () => {
  it('should render', () => {
    expect(
      render(<ExportAction subTitle="" selection={[]} onExport={jest.fn()} />),
    ).toBeTruthy()
  })

  it('should call onExport with proper data', () => {
    const onExport = jest.fn()
    render(
      <ExportAction
        subTitle=""
        selection={INSTANCES_MOCK}
        onExport={onExport}
      />,
    )

    fireEvent.click(screen.getByTestId('export-btn'))
    fireEvent.click(screen.getByTestId('export-selected-dbs'))

    expect(onExport).toBeCalledWith(INSTANCES_MOCK, true)
  })

  it('should call onExport with proper data', () => {
    const onExport = jest.fn()
    render(
      <ExportAction
        subTitle=""
        selection={INSTANCES_MOCK}
        onExport={onExport}
      />,
    )

    fireEvent.click(screen.getByTestId('export-btn'))
    fireEvent.click(screen.getByTestId('export-passwords'))

    fireEvent.click(screen.getByTestId('export-selected-dbs'))

    expect(onExport).toBeCalledWith(INSTANCES_MOCK, false)
  })
})
