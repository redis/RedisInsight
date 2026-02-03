import React from 'react'
import { faker } from '@faker-js/faker'

import { render, screen, userEvent } from 'uiSrc/utils/test-utils'
import { RiAccordion } from './RiAccordion'
import { RiAccordionProps } from './RiAccordion.types'

const accordionBody = faker.lorem.sentence()
const label = faker.lorem.words(2)

const expectBodyHidden = (content: string) => {
  const body = screen.queryByText(content)
  if (body) {
    expect(body).not.toBeVisible()
    return
  }
  expect(body).not.toBeInTheDocument()
}

describe('RiAccordion', () => {
  const defaultProps: RiAccordionProps = {
    id: faker.string.uuid(),
    label,
    actionButtonText: faker.lorem.words(2),
  }

  const renderComponent = (
    propsOverride?: Partial<RiAccordionProps>,
    body: React.ReactNode = accordionBody,
  ) => {
    const props = { ...defaultProps, ...propsOverride }

    return render(<RiAccordion {...props}>{body}</RiAccordion>)
  }

  describe('Default', () => {
    it('Should render the label', () => {
      renderComponent()

      expect(screen.getByText(label)).toBeInTheDocument()
    })

    it('Should toggle open and closed when collapsible', async () => {
      renderComponent({ collapsible: true, defaultOpen: false })

      expectBodyHidden(accordionBody)

      await userEvent.click(screen.getByText(label))
      expect(screen.getByText(accordionBody)).toBeVisible()

      await userEvent.click(screen.getByText(label))
      expectBodyHidden(accordionBody)
    })

    it('Should keep content visible when not collapsible', async () => {
      renderComponent({ collapsible: false })

      expect(screen.getByText(accordionBody)).toBeVisible()

      await userEvent.click(screen.getByText(label))
      expect(screen.getByText(accordionBody)).toBeVisible()
    })

    it('Should call onAction when action button clicked', async () => {
      const onAction = jest.fn()
      const actionButtonText = faker.lorem.words(3)

      renderComponent({ onAction, actionButtonText })

      await userEvent.click(screen.getByText(actionButtonText))

      expect(onAction).toHaveBeenCalledTimes(1)
    })
  })
})
