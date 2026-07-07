import { WhatsNewCard } from 'uiSrc/constants/content/whatsNew.types'

export interface Props {
  card: WhatsNewCard
  onLinkClick: (cardId: string, href: string) => void
}
