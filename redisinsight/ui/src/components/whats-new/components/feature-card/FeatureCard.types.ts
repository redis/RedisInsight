import { WhatsNewCard } from 'uiSrc/constants/content/whats-new'

export interface Props {
  card: WhatsNewCard
  onLinkClick: (cardId: string, href: string) => void
}
