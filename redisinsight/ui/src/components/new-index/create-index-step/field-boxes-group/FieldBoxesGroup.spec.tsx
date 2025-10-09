import React from 'react'

import { fireEvent, render, screen } from 'uiSrc/utils/test-utils'
import { vectorSearchBoxFactory } from 'uiSrc/mocks/factories/redisearch/VectorSearchBox.factory'
import { FieldBoxesGroup, FieldBoxesGroupProps } from './FieldBoxesGroup'

const renderFieldBoxesGroupComponent = (
  props?: Partial<FieldBoxesGroupProps>,
) => {
  const defaultProps: FieldBoxesGroupProps = {
    boxes: vectorSearchBoxFactory.buildList(3, { disabled: false }),
    value: [],
    onChange: jest.fn(),
  }

  return render(<FieldBoxesGroup {...defaultProps} {...props} />)
}

describe('FieldBoxesGroup', () => {
  it('should render', () => {
    const { container } = renderFieldBoxesGroupComponent()

    expect(container).toBeTruthy()

    const fieldBoxesGroup = screen.getByTestId('field-boxes-group')
    expect(fieldBoxesGroup).toBeInTheDocument()

    const fieldBoxes = screen.getAllByTestId(/field-box-/)
    expect(fieldBoxes).toHaveLength(3)
  })

  it('should call onChange when clicking on a box to select it', () => {
    const mockVectorSearchBox = vectorSearchBoxFactory.build({
      disabled: false,
    })

    const props: FieldBoxesGroupProps = {
      boxes: [mockVectorSearchBox],
      value: [],
      onChange: jest.fn(),
    }

    renderFieldBoxesGroupComponent(props)

    const box = screen.getByTestId(`field-box-${mockVectorSearchBox.value}`)

    fireEvent.click(box)
    expect(props.onChange).toHaveBeenCalledWith([mockVectorSearchBox.value])
  })

  it('should call onChange when clicking on a box to deselect it', () => {
    const mockVectorSearchBox = vectorSearchBoxFactory.build({
      disabled: false,
    })

    const props: FieldBoxesGroupProps = {
      boxes: [mockVectorSearchBox],
      value: [mockVectorSearchBox.value],
      onChange: jest.fn(),
    }

    renderFieldBoxesGroupComponent(props)

    const box = screen.getByTestId(`field-box-${mockVectorSearchBox.value}`)

    fireEvent.click(box)
    expect(props.onChange).toHaveBeenCalledWith([])
  })
})
