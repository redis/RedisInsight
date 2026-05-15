import React from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { FeatureFlags } from 'uiSrc/constants'
import { FeatureFlagComponent } from 'uiSrc/components'
import Divider from 'uiSrc/components/divider/Divider'
import {
  updateUserConfigSettingsAction,
  userSettingsConfigSelector,
} from 'uiSrc/slices/user/user-settings'
import { Spacer } from 'uiSrc/components/base/layout/spacer'
import { FormField } from 'uiSrc/components/base/forms/FormField'
import { SwitchInput } from 'uiSrc/components/base/inputs'
import { Title } from 'uiSrc/components/base/text/Title'
import { Text } from 'uiSrc/components/base/text'

const SkipConfirmations = () => {
  const { skipConfirmationsForNonProduction = false } =
    useSelector(userSettingsConfigSelector) ?? {}

  const dispatch = useDispatch()

  const onToggle = (val: boolean) => {
    dispatch(
      updateUserConfigSettingsAction({
        skipConfirmationsForNonProduction: val,
      }),
    )
  }

  return (
    <FeatureFlagComponent name={FeatureFlags.devProdMode}>
      <Divider />
      <Spacer />
      <Title size="M">Non-production databases</Title>
      <Spacer size="m" />
      <FormField>
        <SwitchInput
          checked={skipConfirmationsForNonProduction}
          onCheckedChange={onToggle}
          title="Skip confirmations on non-production"
          data-testid="switch-skip-confirmations-non-production"
        />
      </FormField>
      <Spacer size="s" />
      <Text color="primary" size="s">
        Skip all confirmation dialogs when modifying data in non-production
        databases.
      </Text>
    </FeatureFlagComponent>
  )
}

export default SkipConfirmations
