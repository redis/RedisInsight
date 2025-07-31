import React, { useContext } from 'react'

import { EXTERNAL_LINKS, UTM_MEDIUMS } from 'uiSrc/constants/links'
import { getUtmExternalLink } from 'uiSrc/utils/links'
import EmptyListDarkIcon from 'uiSrc/assets/img/rdi/empty_list_dark.svg'
import EmptyListLightIcon from 'uiSrc/assets/img/rdi/empty_list_light.svg'
import { ThemeContext } from 'uiSrc/contexts/themeContext'
import { Theme } from 'uiSrc/constants'

import { Text } from 'uiSrc/components/base/text'
import { FlexItem, Row } from 'uiSrc/components/base/layout/flex'
import { Spacer } from 'uiSrc/components/base/layout/spacer'
import { PrimaryButton } from 'uiSrc/components/base/forms/buttons'
import { RiIcon } from 'uiSrc/components/base/icons/RiIcon'
import { Link } from 'uiSrc/components/base/link/Link'
import { RiImage } from 'uiSrc/components/base/display'
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
      <Spacer size="xl" />
      <Text className={styles.title}>Redis Data Integration</Text>
      <RiImage
        src={theme === Theme.Dark ? EmptyListDarkIcon : EmptyListLightIcon}
        className={styles.icon}
        alt="empty"
      />
      <Text className={styles.subTitle}>{subTitleText}</Text>
      <Row align="center" gap="m" responsive style={{ lineHeight: '20px' }}>
        <FlexItem grow>
          <PrimaryButton
            data-testid="empty-rdi-instance-button"
            size="small"
            onClick={onAddInstanceClick}
          >
            + Add RDI Endpoint
          </PrimaryButton>
        </FlexItem>
        or
        <FlexItem grow>
          <Link
            data-testid="empty-rdi-quickstart-button"
            target="_blank"
            href={getUtmExternalLink(EXTERNAL_LINKS.rdiQuickStart, {
              medium: UTM_MEDIUMS.Rdi,
              campaign: 'rdi_list',
            })}
          >
            RDI Quickstart <RiIcon type="ArrowDiagonalIcon" />
          </Link>
        </FlexItem>
      </Row>
    </div>
  )
}

export default EmptyMessage
