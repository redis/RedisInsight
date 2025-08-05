import React, { useContext } from 'react'

import { EXTERNAL_LINKS, UTM_MEDIUMS } from 'uiSrc/constants/links'
import { getUtmExternalLink } from 'uiSrc/utils/links'
import EmptyListDarkIcon from 'uiSrc/assets/img/rdi/empty_list_dark.svg'
import EmptyListLightIcon from 'uiSrc/assets/img/rdi/empty_list_light.svg'
import { ThemeContext } from 'uiSrc/contexts/themeContext'
import { Theme } from 'uiSrc/constants'

import { RiText } from 'uiSrc/components/base/text'
import { RiFlexItem, RiRow } from 'uiSrc/components/base/layout'
import { RiSpacer } from 'uiSrc/components/base/layout/spacer'
import { RiPrimaryButton } from 'uiSrc/components/base/forms'
import { RiIcon } from 'uiSrc/components/base/icons'
import { RiLink, RiImage } from 'uiSrc/components/base/display'
import styles from './styles.module.scss'

const subTitleText =
  "Redis Data Integration (RDI) synchronizes data from your existing database into Redis in near-real-time. We've done the heavy lifting so you can turn slow data into fast data without coding."

export interface Props {
  onAddInstanceClick: () => void
}

const EmptyMessage = ({ onAddInstanceClick }: Props) => {
  const { theme } = useContext(ThemeContext)
  return (
    <div
      className={styles.noResultsContainer}
      data-testid="empty-rdi-instance-list"
    >
      <RiSpacer size="xl" />
      <RiText className={styles.title}>Redis Data Integration</RiText>
      <RiImage
        src={theme === Theme.Dark ? EmptyListDarkIcon : EmptyListLightIcon}
        className={styles.icon}
        alt="empty"
      />
      <RiText className={styles.subTitle}>{subTitleText}</RiText>
      <RiRow align="center" gap="m" responsive style={{ lineHeight: '20px' }}>
        <RiFlexItem grow>
          <RiPrimaryButton
            data-testid="empty-rdi-instance-button"
            size="small"
            onClick={onAddInstanceClick}
          >
            + Add RDI Endpoint
          </RiPrimaryButton>
        </RiFlexItem>
        or
        <RiFlexItem grow>
          <RiLink
            data-testid="empty-rdi-quickstart-button"
            target="_blank"
            href={getUtmExternalLink(EXTERNAL_LINKS.rdiQuickStart, {
              medium: UTM_MEDIUMS.Rdi,
              campaign: 'rdi_list',
            })}
          >
            RDI Quickstart <RiIcon type="ArrowDiagonalIcon" />
          </RiLink>
        </RiFlexItem>
      </RiRow>
    </div>
  )
}

export default EmptyMessage
