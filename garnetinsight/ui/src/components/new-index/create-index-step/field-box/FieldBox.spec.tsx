import React from 'react'
import { BoxSelectionGroup } from '@redis-ui/components'

import { cleanup, fireEvent, render, screen } from 'uiSrc/utils/test-utils'
import { vectorSearchBoxFactory } from 'uiSrc/mocks/factories/redisearch/VectorSearchBox.factory'

import { FieldBox, FieldBoxProps } from './FieldBox'
import { VectorSearchBox } from './types'

const renderFieldBoxComponent = (props?: FieldBoxProps) => {
  const defaultProps: FieldBoxProps = {
    box: vectorSearchBoxFactory.build(),
  }

  return render(
    <BoxSelectionGroup.Compose>
      <FieldBox {...defaultProps} {...props} />
    </BoxSelectionGroup.Compose>,
  )
}

describe('CreateIndexStepWrapper', () => {
  beforeEach(() => {
    cleanup()
  })

  it('should render', () => {
    const props: FieldBoxProps = {
      box: vectorSearchBoxFactory.build(),
    }

    const { container } = renderFieldBoxComponent(props)

    expect(container).toBeTruthy()

    // Check if the box is rendered with the correct visual elements
    const label = screen.getByText(props.box.label!)
    const description = screen.getByText(props.box.text!)
    const tag = screen.getByText(props.box.tag.toUpperCase()!)
    const checkbox = screen.getByRole('checkbox')

    expect(label).toBeInTheDocument()
    expect(description).toBeInTheDocument()
    expect(tag).toBeInTheDocument()
    expect(checkbox).toBeInTheDocument()
  })

  it('should select the box when clicked', async () => {
    const props: FieldBoxProps = {
      box: vectorSearchBoxFactory.build({
        disabled: false,
      }),
    }

    renderFieldBoxComponent(props)

    // Verify that the checkbox is not checked initially
    const checkbox = screen.getByRole('checkbox')
    expect(checkbox).not.toBeChecked()

    // Click on the box to select it
    const box = screen.getByTestId(`field-box-${props.box.value}`)
    fireEvent.click(box)

    // Wait for the checkbox to be checked
    expect(checkbox).toBeChecked()
  })

  it('should not select the box when clicked if disabled', () => {
    const disabledBox: VectorSearchBox = vectorSearchBoxFactory.build({
      disabled: true,
    })

    renderFieldBoxComponent({ box: disabledBox })

    const checkbox = screen.getByRole('checkbox')
    expect(checkbox).not.toBeChecked()

    const box = screen.getByTestId(`field-box-${disabledBox.value}`)
    fireEvent.click(box)

    expect(checkbox).not.toBeChecked()
  })
})
