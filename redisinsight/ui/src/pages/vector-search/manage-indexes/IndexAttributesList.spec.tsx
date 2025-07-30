import React from 'react'
import { cleanup, render, screen } from 'uiSrc/utils/test-utils'
import {
  IndexAttributesList,
  IndexAttributesListProps,
} from './IndexAttributesList'

const renderComponent = (props?: Partial<IndexAttributesListProps>) => {
  // TODO: Potentially replace this with a factory later
  const defaultProps: IndexAttributesListProps = {
    data: [
      {
        attribute: 'title',
        type: 'TEXT',
        weight: '1.0',
        separator: ',',
      },
      {
        attribute: 'content',
        type: 'TEXT',
      },
      {
        attribute: 'tags',
        type: 'TAG',
        weight: '1.0',
      },
    ],
  }

  return render(<IndexAttributesList {...defaultProps} {...props} />)
}

describe('IndexAttributesList', () => {
  beforeEach(() => {
    cleanup()
  })

  it('should render', () => {
    const props: IndexAttributesListProps = {
      data: [
        {
          attribute: 'title',
          type: 'TEXT',
          weight: '1.0',
          separator: ',',
        },
      ],
    }

    const { container } = renderComponent(props)
    expect(container).toBeTruthy()

    const list = screen.getByTestId('index-attributes-list')
    expect(list).toBeInTheDocument()

    // Verify data is rendered correctly
    const attribute = screen.getByText(props.data[0].attribute)
    const type = screen.getByText(props.data[0].type)
    const weight = screen.getByText(props.data[0].weight!)
    const separator = screen.getByText(props.data[0].separator!)

    expect(attribute).toBeInTheDocument()
    expect(type).toBeInTheDocument()
    expect(weight).toBeInTheDocument()
    expect(separator).toBeInTheDocument()
  })
})
