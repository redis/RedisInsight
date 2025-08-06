import React from 'react'
import parse from 'html-react-parser'

import { RiFlexItem, RiRow } from 'uiBase/layout'
import { RiSpacer } from 'uiBase/layout/spacer'

import { RiText } from 'uiBase/text'
import { RiSwitchInput } from 'uiBase/inputs'

import { ItemDescription } from './components'
import { IConsent } from '../ConsentsSettings'

import styles from '../styles.module.scss'

interface Props {
  consent: IConsent
  onChangeAgreement: (checked: boolean, name: string) => void
  checked: boolean
  isSettingsPage?: boolean
  withoutSpacer?: boolean
}

const ConsentOption = (props: Props) => {
  const {
    consent,
    onChangeAgreement,
    checked,
    isSettingsPage = false,
    withoutSpacer = false,
  } = props

  return (
    <RiFlexItem key={consent.agreementName} grow>
      {isSettingsPage && consent.description && (
        <>
          <RiText
            size="s"
            className={styles.smallText}
            color="subdued"
            style={{ marginTop: '12px' }}
          >
            <ItemDescription
              description={consent.description}
              withLink={consent.linkToPrivacyPolicy}
            />
          </RiText>
          <RiSpacer size="m" />
        </>
      )}
      <RiRow gap="m">
        <RiFlexItem>
          <RiSwitchInput
            checked={checked}
            onCheckedChange={(checked) =>
              onChangeAgreement(checked, consent.agreementName)
            }
            data-testid={`switch-option-${consent.agreementName}`}
            disabled={consent?.disabled}
          />
        </RiFlexItem>
        <RiFlexItem>
          <RiText className={styles.smallText}>{parse(consent.label)}</RiText>
          {!isSettingsPage && consent.description && (
            <RiText
              size="s"
              className={styles.smallText}
              color="subdued"
              style={{ marginTop: '12px' }}
            >
              <ItemDescription
                description={consent.description}
                withLink={consent.linkToPrivacyPolicy}
              />
            </RiText>
          )}
        </RiFlexItem>
      </RiRow>
      {!withoutSpacer && <RiSpacer />}
    </RiFlexItem>
  )
}

export default ConsentOption
