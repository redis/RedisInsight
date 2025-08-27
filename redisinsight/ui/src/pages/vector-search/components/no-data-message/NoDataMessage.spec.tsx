import React from 'react'
import { render, screen } from 'uiSrc/utils/test-utils'
import NoDataMessage, {
  NO_DATA_MESSAGES,
  NoDataMessageKeys,
  NoDataMessageProps,
} from './NoDataMessage'

const mockDefaultNoDataMessageVariant = NoDataMessageKeys.ManageIndexes

const renderNoDataMessageComponent = (props?: NoDataMessageProps) => {
  const defaultProps: NoDataMessageProps = {
    variant: mockDefaultNoDataMessageVariant,
  }

  return render(<NoDataMessage {...defaultProps} {...props} />)
}

describe('NoDataMessage', () => {
  it('should render correctly', () => {
    renderNoDataMessageComponent()

    const container = screen.getByTestId('no-data-message')
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
