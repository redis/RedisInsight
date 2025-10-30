import React from 'react'
import parse from 'html-react-parser'

import { FlexItem, Row } from 'uiSrc/components/base/layout/flex'
import { Spacer } from 'uiSrc/components/base/layout/spacer'

import { Text } from 'uiSrc/components/base/text'
import { SwitchInput } from 'uiSrc/components/base/inputs'

import { ItemDescription } from './components'
import { IConsent } from '../ConsentsSettings'

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
          <Spacer size="s" />
          <Text size="M" color="primary">
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
          <Spacer size="xs" />
          <SwitchInput
            checked={checked}
            onCheckedChange={(checked) =>
              onChangeAgreement(checked, consent.agreementName)
            }
            data-testid={`switch-option-${consent.agreementName}`}
            disabled={consent?.disabled}
          />
        </FlexItem>
        <FlexItem>
          <Text size="M" color="primary">
            {parse(consent.label)}
          </Text>
          {!isSettingsPage && consent.description && (
            <>
              <Spacer size="s" />
              <Text size="s" color="secondary">
                <ItemDescription
                  description={consent.description}
                  withLink={consent.linkToPrivacyPolicy}
                />
              </Text>
            </>
          )}
        </FlexItem>
      </Row>
      {!withoutSpacer && <Spacer />}
    </FlexItem>
  )
}

export default ConsentOption
