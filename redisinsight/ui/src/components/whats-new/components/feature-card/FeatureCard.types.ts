import { WhatsNewCard } from 'uiSrc/constants/content/whats-new'

export interface Props {
  card: WhatsNewCard
  /** The card's feature is usable in this build (flag on or not gated). */
  isActive?: boolean
  onLinkClick: (cardId: string, href: string) => void
}
