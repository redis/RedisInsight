import React from 'react'
import parse from 'html-react-parser'

import { FlexItem, Row } from 'uiSrc/components/base/layout/flex'
import { Spacer } from 'uiSrc/components/base/layout/spacer'

import { Text } from 'uiSrc/components/base/text'
import { SwitchInput } from 'uiSrc/components/base/inputs'
import { useTranslation } from 'uiSrc/i18n'

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

  const { t } = useTranslation()

  // Localize the backend-supplied copy by its stable agreement code, falling
  // back to the English text shipped in the spec (mirrors the error-code i18n).
  const label = consent.code
    ? t(`api.agreement.${consent.code}.label` as never, {
        defaultValue: consent.label,
      })
    : consent.label
  const description =
    consent.code && consent.description
      ? t(`api.agreement.${consent.code}.description` as never, {
          defaultValue: consent.description,
        })
      : consent.description

  return (
    <FlexItem key={consent.agreementName} grow>
      {isSettingsPage && description && (
        <>
          <Spacer size="s" />
          <Text size="M" color="primary">
            <ItemDescription
              description={description}
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
            {parse(label)}
          </Text>
          {!isSettingsPage && description && (
            <>
              <Spacer size="xs" />
              <Text size="s" color="secondary">
                <ItemDescription
                  description={description}
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
