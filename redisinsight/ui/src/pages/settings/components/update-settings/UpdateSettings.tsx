import React, { useEffect, useState } from 'react'
import { Button, TextButton } from '@redis-ui/components'
import { Row } from 'uiSrc/components/base/layout/flex'
import { Spacer } from 'uiSrc/components/base/layout/spacer'
import { RefreshIcon } from 'uiSrc/components/base/icons'
import { AppUpdateStrategy } from 'uiSrc/electron/constants'
import {
  ipcCheckForUpdate,
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
  const [isChecking, setIsChecking] = useState(false)

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

  const onCheckForUpdates = async () => {
    setIsChecking(true)
    await ipcCheckForUpdate()
    setIsChecking(false)
  }

  if (!strategy) {
    return null
  }

  return (
    <form>
      <Title size="XS">{t('settings.general.updates.title')}</Title>
      <Spacer size="m" />
      <Row justify="between" align="center">
        <FormField.Label label={t('settings.general.updates.label')} />
        {strategy === AppUpdateStrategy.notify && (
          <TextButton
            variant="primary-inline"
            size="small"
            onClick={onCheckForUpdates}
            disabled={isChecking}
            data-testid="btn-check-for-updates"
          >
            <Button.Icon icon={RefreshIcon} />
            {t('settings.general.updates.button.check')}
          </TextButton>
        )}
      </Row>
      <Spacer size="m" />
      <RiSelect
        valueRender={defaultValueRender}
        options={options}
        value={strategy}
        onChange={onChange}
        data-testid="select-update-strategy"
      />
      <Spacer size="xl" />
    </form>
  )
}

export default UpdateSettings
