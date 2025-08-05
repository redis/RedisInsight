import { toNumber } from 'lodash'
import React from 'react'
import { useDispatch, useSelector } from 'react-redux'
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
import { RiSpacer } from 'uiSrc/components/base/layout/spacer'
import { RiFormField } from 'uiSrc/components/base/forms'
import { RiSwitchInput } from 'uiSrc/components/base/inputs'
import { RiTitle } from 'uiSrc/components/base/text'
import { RiLink } from 'uiSrc/components/base/display'

const WorkbenchSettings = () => {
  const { cleanup } = useSelector(userSettingsWBSelector)
  const { batchSize = PIPELINE_COUNT_DEFAULT } =
    useSelector(userSettingsConfigSelector) ?? {}

  const dispatch = useDispatch()

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
      <RiTitle size="M">Editor Cleanup</RiTitle>
      <RiSpacer size="m" />
      <RiFormField>
        <RiSwitchInput
          checked={cleanup}
          onCheckedChange={onSwitchWbCleanUp}
          title="Clear the Editor after running commands"
          data-testid="switch-workbench-cleanup"
        />
      </RiFormField>
      <RiSpacer size="xl" />
      <SettingItem
        initValue={batchSize.toString()}
        onApply={handleApplyPipelineCountChanges}
        validation={(value) => validateNumber(value)}
        title="Pipeline Mode"
        testid="pipeline-bunch"
        placeholder={`${PIPELINE_COUNT_DEFAULT}`}
        label="Commands in pipeline:"
        summary={
          <>
            {'Sets the size of a command batch for the '}
            <RiLink
              href="https://redis.io/docs/latest/develop/use/pipelining/"
              target="_blank"
              data-testid="pipelining-link"
              style={{ padding: 0 }}
            >
              pipeline
            </RiLink>
            {' mode in Workbench. 0 or 1 pipelines every command.'}
          </>
        }
      />
    </>
  )
}

export default WorkbenchSettings
