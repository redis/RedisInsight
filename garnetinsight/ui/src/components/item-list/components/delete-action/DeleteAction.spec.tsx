import React from 'react'
import { render, screen, fireEvent } from 'uiSrc/utils/test-utils'

import { INSTANCES_MOCK } from 'uiSrc/mocks/handlers/instances/instancesHandlers'
import DeleteAction from './DeleteAction'

describe('DeleteAction', () => {
  it('should render', () => {
    expect(
      render(<DeleteAction subTitle="" selection={[]} onDelete={jest.fn()} />),
    ).toBeTruthy()
  })

  it('should display instances that are going to be deleted', () => {
    const onDelete = jest.fn()
    render(
      <DeleteAction
        subTitle=""
        selection={INSTANCES_MOCK}
        onDelete={onDelete}
      />,
    )

    fireEvent.click(screen.getByTestId('delete-btn'))

    expect(screen.getByText('localhost')).toBeInTheDocument()
    expect(screen.getByText('oea123123')).toBeInTheDocument()
    expect(screen.getByText('sentinel')).toBeInTheDocument()
  })
})
