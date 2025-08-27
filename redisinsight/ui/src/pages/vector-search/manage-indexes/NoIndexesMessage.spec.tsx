import React from 'react'
import { render, screen } from 'uiSrc/utils/test-utils'
import NoIndexesMessage, {
  NO_DATA_MESSAGES,
  NoDataMessageKeys,
  NoIndexesMessageProps,
} from './NoIndexesMessage'

const mockDefaultNoDataMessageVariant = NoDataMessageKeys.ManageIndexes

const renderNoIndexesMessageComponent = (props?: NoIndexesMessageProps) => {
  const defaultProps: NoIndexesMessageProps = {
    variant: mockDefaultNoDataMessageVariant,
  }

  return render(<NoIndexesMessage {...defaultProps} {...props} />)
}

describe('NoIndexesMessage', () => {
  it('should render correctly', () => {
    renderNoIndexesMessageComponent()

    const container = screen.getByTestId('no-indexes-message')
    expect(container).toBeInTheDocument()

    const title = screen.getByText(
      NO_DATA_MESSAGES[mockDefaultNoDataMessageVariant].title,
    )
    const description = screen.getByText(
      NO_DATA_MESSAGES[mockDefaultNoDataMessageVariant].description,
    )
    const icon = screen.getByAltText(
      NO_DATA_MESSAGES[mockDefaultNoDataMessageVariant].title,
    )

    expect(title).toBeInTheDocument()
    expect(description).toBeInTheDocument()
    expect(icon).toBeInTheDocument()
  })
})
