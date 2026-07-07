import React from 'react'
import { render, screen, fireEvent } from 'uiSrc/utils/test-utils'
import { whatsNewCardFactory } from 'uiSrc/mocks/factories/whatsNew/WhatsNewCard.factory'
import FeatureCard from './FeatureCard'

const onLinkClickMock = jest.fn()

beforeEach(() => {
  onLinkClickMock.mockClear()
})

describe('FeatureCard', () => {
  it('should render title and body', () => {
    const card = whatsNewCardFactory.build()

    render(<FeatureCard card={card} onLinkClick={onLinkClickMock} />)

    expect(screen.getByText(card.title)).toBeInTheDocument()
    expect(screen.getByText(card.body)).toBeInTheDocument()
  })

  it('should render tag and location only when provided', () => {
    const card = whatsNewCardFactory.build({
      tag: 'Beta',
      location: 'Browser — somewhere',
    })

    render(<FeatureCard card={card} onLinkClick={onLinkClickMock} />)

    expect(
      screen.getByTestId(`whats-new-card-tag-${card.id}`),
    ).toBeInTheDocument()
    expect(
      screen.getByTestId(`whats-new-card-location-${card.id}`),
    ).toBeInTheDocument()
  })

  it('should not render tag or location by default', () => {
    const card = whatsNewCardFactory.build()

    render(<FeatureCard card={card} onLinkClick={onLinkClickMock} />)

    expect(
      screen.queryByTestId(`whats-new-card-tag-${card.id}`),
    ).not.toBeInTheDocument()
    expect(
      screen.queryByTestId(`whats-new-card-location-${card.id}`),
    ).not.toBeInTheDocument()
  })

  it('should call onLinkClick with card id and href', () => {
    const link = { label: 'Learn more', href: 'https://redis.io/docs' }
    const card = whatsNewCardFactory.build({ links: [link] })

    render(<FeatureCard card={card} onLinkClick={onLinkClickMock} />)
    fireEvent.click(screen.getByTestId(`whats-new-card-link-${card.id}`))

    expect(onLinkClickMock).toBeCalledWith(card.id, link.href)
  })
})
