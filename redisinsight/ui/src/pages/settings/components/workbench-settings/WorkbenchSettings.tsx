import { toNumber } from 'lodash'
import React from 'react'
import { useAppDispatch, useAppSelector } from 'uiSrc/slices/hooks'
import { SettingItem } from 'uiSrc/components'
import { PIPELINE_COUNT_DEFAULT } from 'uiSrc/constants/api'
import {
  setWorkbenchCleanUp,
  updateUserConfigSettingsAction,
  userSettingsConfigSelector,
  userSettingsWBSelector,
} from 'uiSrc/slices/user/user-settings'
import { sendEventTelemetry, TelemetryEvent } from 'uiSrc/telemetry'
import { validateNumber } from 'uiSrc/utils'
import { Spacer } from 'uiSrc/components/base/layout/spacer'
import { FormField } from 'uiSrc/components/base/forms/FormField'
import { SwitchInput } from 'uiSrc/components/base/inputs'
import { Title } from 'uiSrc/components/base/text/Title'
import { Link } from 'uiSrc/components/base/link/Link'
import { Trans, useTranslation } from 'uiSrc/i18n'

const PIPELINING_DOCS_URL =
  'https://redis.io/docs/latest/develop/use/pipelining/'

const WorkbenchSettings = () => {
  const { t } = useTranslation()
  const { cleanup } = useAppSelector(userSettingsWBSelector)
  const { batchSize = PIPELINE_COUNT_DEFAULT } =
    useAppSelector(userSettingsConfigSelector) ?? {}

  const dispatch = useAppDispatch()

  const onSwitchWbCleanUp = (val: boolean) => {
    dispatch(setWorkbenchCleanUp(val))
    sendEventTelemetry({
      event: TelemetryEvent.SETTINGS_WORKBENCH_EDITOR_CLEAR_CHANGED,
      eventData: {
        currentValue: !val,
        newValue: val,
      },
    })
  }

  const handleApplyPipelineCountChanges = (value: string) => {
    dispatch(updateUserConfigSettingsAction({ batchSize: toNumber(value) }))
  }

  return (
    <>
      <Title size="M">{t('settings.workbench.cleanup.title')}</Title>
      <Spacer size="m" />
      <FormField>
        <SwitchInput
          checked={cleanup}
          onCheckedChange={onSwitchWbCleanUp}
          title={t('settings.workbench.cleanup.label')}
          data-testid="switch-workbench-cleanup"
        />
      </FormField>
      <Spacer size="xl" />
      <SettingItem
        initValue={batchSize.toString()}
        onApply={handleApplyPipelineCountChanges}
        validation={(value) => validateNumber(value)}
        title={t('settings.workbench.pipeline.title')}
        testid="pipeline-bunch"
        placeholder={`${PIPELINE_COUNT_DEFAULT}`}
        label={t('settings.workbench.pipeline.label')}
        summary={
          <Trans
            i18nKey="settings.workbench.pipeline.summary"
            components={{
              pipelineLink: (
                <Link
                  variant="inline"
                  href={PIPELINING_DOCS_URL}
                  target="_blank"
                  data-testid="pipelining-link"
                  style={{ padding: 0 }}
                />
              ),
            }}
          />
        }
      />
    </>
  )
}

export default WorkbenchSettings
