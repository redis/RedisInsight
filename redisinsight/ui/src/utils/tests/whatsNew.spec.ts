import { FeatureFlags } from 'uiSrc/constants'
import {
  isWhatsNewCardActive,
  isWhatsNewEligible,
  whatsNewFeed,
} from 'uiSrc/utils'
import { whatsNewCardFactory } from 'uiSrc/mocks/factories/whatsNew/WhatsNewCard.factory'

const latestVersion = whatsNewFeed[0].version

describe('isWhatsNewEligible', () => {
  it('should be eligible for a new version with cards that is not a patch', () => {
    expect(isWhatsNewEligible(latestVersion, null)).toEqual(true)
  })

  it('should not be eligible when the version was already seen', () => {
    expect(isWhatsNewEligible(latestVersion, latestVersion)).toEqual(false)
  })

  it('should not be eligible for an unknown version', () => {
    expect(isWhatsNewEligible('99.0.0', null)).toEqual(false)
  })
})

describe('isWhatsNewCardActive', () => {
  it('should be active for a card without a feature flag', () => {
    const card = whatsNewCardFactory.build()

    expect(isWhatsNewCardActive(card, {})).toEqual(true)
  })

  it('should follow the feature flag for gated cards', () => {
    const card = whatsNewCardFactory.build({
      featureFlag: FeatureFlags.azureEntraId,
    })

    expect(isWhatsNewCardActive(card, {})).toEqual(false)
    expect(
      isWhatsNewCardActive(card, {
        [FeatureFlags.azureEntraId]: { flag: true },
      }),
    ).toEqual(true)
  })
})
