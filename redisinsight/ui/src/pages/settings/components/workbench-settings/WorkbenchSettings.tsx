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

const WorkbenchSettings = () => {
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
      <Title size="M">Editor cleanup</Title>
      <Spacer size="m" />
      <FormField>
        <SwitchInput
          checked={cleanup}
          onCheckedChange={onSwitchWbCleanUp}
          title="Clear the editor after running commands"
          data-testid="switch-workbench-cleanup"
        />
      </FormField>
      <Spacer size="xl" />
      <SettingItem
        initValue={batchSize.toString()}
        onApply={handleApplyPipelineCountChanges}
        validation={(value) => validateNumber(value)}
        title="Pipeline mode"
        testid="pipeline-bunch"
        placeholder={`${PIPELINE_COUNT_DEFAULT}`}
        label="Commands in pipeline:"
        summary={
          <>
            {'Sets the size of a command batch for the '}
            <Link
              variant="inline"
              href="https://redis.io/docs/latest/develop/use/pipelining/"
              target="_blank"
              data-testid="pipelining-link"
              style={{ padding: 0 }}
            >
              pipeline
            </Link>
            {' mode in Workbench. 0 or 1 pipelines every command.'}
          </>
        }
      />
    </>
  )
}

export default WorkbenchSettings
