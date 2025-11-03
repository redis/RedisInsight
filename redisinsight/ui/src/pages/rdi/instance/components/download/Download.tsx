import { saveAs } from 'file-saver'
import JSZip from 'jszip'
import React from 'react'
import { useSelector } from 'react-redux'
import { useParams } from 'react-router-dom'

import { rdiPipelineSelector } from 'uiSrc/slices/rdi/pipeline'
import { sendEventTelemetry, TelemetryEvent } from 'uiSrc/telemetry'

export interface Props {
  trigger: React.ReactElement
  onClose?: () => void
}

const Download = ({ onClose, trigger }: Props) => {
  const { loading, jobs, config } = useSelector(rdiPipelineSelector)

  const { rdiInstanceId } = useParams<{ rdiInstanceId: string }>()

  const handleDownloadClick = async () => {
    sendEventTelemetry({
      event: TelemetryEvent.RDI_PIPELINE_DOWNLOAD_CLICKED,
      eventData: {
        id: rdiInstanceId,
        jobsNumber: jobs?.length,
      },
    })

    // zip config and job contents
    const zip = new JSZip()
    zip.file('config.yaml', config || '')

    const rdiJobs = zip.folder('jobs')
    jobs.forEach(({ name, value }) => rdiJobs?.file(`${name}.yaml`, value))

    const content = await zip.generateAsync({ type: 'blob' })
    saveAs(content, 'RDI_pipeline.zip')

    onClose?.()
  }

  const button = trigger
    ? React.cloneElement(trigger, {
        disabled: loading,
        onClick: handleDownloadClick,
      })
    : null

  return <>{button}</>
}

export default Download
