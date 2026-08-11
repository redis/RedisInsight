import React, { useEffect, useState } from 'react'
import { Spacer } from 'uiSrc/components/base/layout/spacer'
import { AppUpdateStrategy } from 'uiSrc/electron/constants'
import {
  ipcGetUpdateStrategy,
  ipcSetUpdateStrategy,
} from 'uiSrc/electron/utils'
import { sendEventTelemetry, TelemetryEvent } from 'uiSrc/telemetry'
import {
  defaultValueRender,
  RiSelect,
  RiSelectOption,
} from 'uiSrc/components/base/forms/select/RiSelect'
import { FormField } from 'uiSrc/components/base/forms/FormField'
import { Title } from 'uiSrc/components/base/text'
import { useTranslation } from 'uiSrc/i18n'

const UpdateSettings = () => {
  const { t } = useTranslation()
  const [strategy, setStrategy] = useState<AppUpdateStrategy | null>(null)

  useEffect(() => {
    ipcGetUpdateStrategy().then(setStrategy)
  }, [])

  const options: RiSelectOption[] = Object.values(AppUpdateStrategy).map(
    (value) => ({
      value,
      inputDisplay: t(`settings.general.updates.option.${value}` as never),
    }),
  )

  const onChange = (value: string) => {
    if (value === strategy) {
      return
    }
    const nextStrategy = value as AppUpdateStrategy
    setStrategy(nextStrategy)
    ipcSetUpdateStrategy(nextStrategy)
    sendEventTelemetry({
      event: TelemetryEvent.SETTINGS_UPDATE_STRATEGY_CHANGED,
      eventData: { strategy: nextStrategy },
    })
  }

  if (!strategy) {
    return null
  }

  return (
    <form>
      <Title size="XS">{t('settings.general.updates.title')}</Title>
      <Spacer size="m" />
      <FormField label={t('settings.general.updates.label')}>
        <Spacer size="m" />
        <RiSelect
          valueRender={defaultValueRender}
          options={options}
          value={strategy}
          onChange={onChange}
          data-testid="select-update-strategy"
        />
      </FormField>
      <Spacer size="xl" />
    </form>
  )
}

export default UpdateSettings
