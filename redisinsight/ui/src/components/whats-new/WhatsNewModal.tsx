import React from 'react'

import { useTranslation } from 'uiSrc/i18n'
import { useAppDispatch, useAppSelector } from 'uiSrc/slices/hooks'
import {
  closeWhatsNew,
  setSelectedVersion,
  whatsNewSelector,
} from 'uiSrc/slices/app/whatsNew'
import {
  appElectronInfoSelector,
  setReleaseNotesViewed,
} from 'uiSrc/slices/app/info'
import { appFeatureFlagsFeaturesSelector } from 'uiSrc/slices/app/features'
import { sendEventTelemetry, TelemetryEvent } from 'uiSrc/telemetry'
import { isWhatsNewCardActive, whatsNewFeed } from 'uiSrc/utils'
import { EXTERNAL_LINKS } from 'uiSrc/constants/links'

import { Modal } from 'uiSrc/components/base/display'
import { CancelIcon } from 'uiSrc/components/base/icons'
import { Row } from 'uiSrc/components/base/layout/flex'
import { Spacer } from 'uiSrc/components/base/layout/spacer'
import { Text } from 'uiSrc/components/base/text'
import { Link } from 'uiSrc/components/base/link/Link'
import { PrimaryButton } from 'uiSrc/components/base/forms/buttons'
import {
  RiSelect,
  RiSelectOption,
} from 'uiSrc/components/base/forms/select/RiSelect'
import FeatureCard from './components/feature-card'
import { formatReleaseDate } from './WhatsNewModal.utils'
import * as S from './WhatsNewModal.styles'

const WhatsNewModal = () => {
  const { isOpen, selectedVersion } = useAppSelector(whatsNewSelector)
  const features = useAppSelector(appFeatureFlagsFeaturesSelector)
  const { isReleaseNotesViewed } = useAppSelector(appElectronInfoSelector)
  const dispatch = useAppDispatch()
  const { t, i18n } = useTranslation()

  if (!isOpen) return null

  const versionEntry =
    whatsNewFeed.find((v) => v.version === selectedVersion) ?? whatsNewFeed[0]

  if (!versionEntry) return null

  const currentVersion = versionEntry.version

  const versionOptions: RiSelectOption[] = whatsNewFeed.map((v, index) => ({
    value: v.version,
    label:
      index === 0
        ? t('whatsNew.version.optionLatest', { version: v.version })
        : t('whatsNew.version.option', { version: v.version }),
  }))

  const releaseNotesUrl =
    versionEntry.releaseNotesUrl ??
    `${EXTERNAL_LINKS.releaseNotes}/tag/${currentVersion}`

  const onClose = () => {
    sendEventTelemetry({
      event: TelemetryEvent.WHATS_NEW_CLOSED,
      eventData: { version: currentVersion },
    })
    // Acknowledge a pending update like closing the legacy toast did, so the
    // Release Notes indicator clears and the stored version is cleaned up.
    // `false` is only set once the updated version is running — a pre-restart
    // open must not acknowledge, or the post-restart flow would be skipped.
    if (isReleaseNotesViewed === false) {
      dispatch(setReleaseNotesViewed(true))
    }
    dispatch(closeWhatsNew())
  }

  const onVersionChange = (version: string) => {
    if (version === currentVersion) return
    sendEventTelemetry({
      event: TelemetryEvent.WHATS_NEW_VERSION_CHANGED,
      eventData: { fromVersion: currentVersion, toVersion: version },
    })
    dispatch(setSelectedVersion(version))
  }

  const onCardLinkClick = (cardId: string, href: string) => {
    sendEventTelemetry({
      event: TelemetryEvent.WHATS_NEW_CARD_LINK_CLICKED,
      eventData: { version: currentVersion, cardId, href },
    })
  }

  return (
    <Modal.Compose open={isOpen}>
      <S.StyledContent persistent onCancel={onClose}>
        <Modal.Content.Close icon={CancelIcon} onClick={onClose} />
        <Modal.Content.Header.Compose>
          <Modal.Content.Header.Title>
            {t('whatsNew.title')}
          </Modal.Content.Header.Title>
        </Modal.Content.Header.Compose>

        <S.StyledBody>
          <Row align="center" gap="m">
            <S.VersionSelectWrapper>
              <RiSelect
                options={versionOptions}
                value={currentVersion}
                onChange={onVersionChange}
                data-testid="whats-new-version-select"
              />
            </S.VersionSelectWrapper>
            {!!versionEntry.releaseDate && (
              <Text size="xs" color="secondary">
                {t('whatsNew.releaseDate', {
                  date: formatReleaseDate(
                    versionEntry.releaseDate,
                    i18n.language,
                  ),
                })}
              </Text>
            )}
          </Row>

          <Spacer size="l" />

          <S.CardsList gap="l" data-testid="whats-new-cards">
            {versionEntry.cards.map((card) => (
              <FeatureCard
                key={card.id}
                card={card}
                isActive={isWhatsNewCardActive(card, features)}
                onLinkClick={onCardLinkClick}
              />
            ))}
          </S.CardsList>
        </S.StyledBody>

        <Modal.Content.Footer.Compose>
          <Link
            href={releaseNotesUrl}
            target="_blank"
            data-testid="whats-new-release-notes-link"
          >
            {t('whatsNew.releaseNotes.link', { version: currentVersion })}
          </Link>
          <PrimaryButton onClick={onClose} data-testid="whats-new-got-it-btn">
            {t('whatsNew.button.gotIt')}
          </PrimaryButton>
        </Modal.Content.Footer.Compose>
      </S.StyledContent>
    </Modal.Compose>
  )
}

export default WhatsNewModal
