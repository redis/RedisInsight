import React from 'react'
import parse from 'html-react-parser'

import { FlexItem, Row } from 'uiSrc/components/base/layout/flex'
import { Spacer } from 'uiSrc/components/base/layout/spacer'

import { Text } from 'uiSrc/components/base/text'
import { RiSwitchInput } from 'uiSrc/components/base/inputs'

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
    <FlexItem key={consent.agreementName} grow>
      {isSettingsPage && consent.description && (
        <>
          <Text
            size="s"
            className={styles.smallText}
            color="subdued"
            style={{ marginTop: '12px' }}
          >
            <ItemDescription
              description={consent.description}
              withLink={consent.linkToPrivacyPolicy}
            />
          </Text>
          <Spacer size="m" />
        </>
      )}
      <Row gap="m">
        <FlexItem>
          <RiSwitchInput
            checked={checked}
            onCheckedChange={(checked) =>
              onChangeAgreement(checked, consent.agreementName)
            }
            data-testid={`switch-option-${consent.agreementName}`}
            disabled={consent?.disabled}
          />
        </FlexItem>
        <FlexItem>
          <Text className={styles.smallText}>{parse(consent.label)}</Text>
          {!isSettingsPage && consent.description && (
            <Text
              size="s"
              className={styles.smallText}
              color="subdued"
              style={{ marginTop: '12px' }}
            >
              <ItemDescription
                description={consent.description}
                withLink={consent.linkToPrivacyPolicy}
              />
            </Text>
          )}
        </FlexItem>
      </Row>
      {!withoutSpacer && <Spacer />}
    </FlexItem>
  )
}

export default ConsentOption
