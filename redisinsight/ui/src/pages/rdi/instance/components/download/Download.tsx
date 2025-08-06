import { saveAs } from 'file-saver'
import JSZip from 'jszip'
import React from 'react'
import { useSelector } from 'react-redux'
import { useParams } from 'react-router-dom'

import { SaveIcon } from 'uiBase/icons'
import { RiEmptyButton } from 'uiBase/forms'
import { rdiPipelineSelector } from 'uiSrc/slices/rdi/pipeline'
import { sendEventTelemetry, TelemetryEvent } from 'uiSrc/telemetry'

import styles from './styles.module.scss'

interface Props {
  dataTestid?: string
  onClose?: () => void
}

const Download = ({ dataTestid, onClose }: Props) => {
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

  return (
    <RiEmptyButton
      color="text"
      className={styles.downloadBtn}
      icon={SaveIcon}
      disabled={loading}
      onClick={handleDownloadClick}
      aria-labelledby="Download pipeline button"
      data-testid={dataTestid || 'download-pipeline-btn'}
    >
      Save to file
    </RiEmptyButton>
  )
}

export default Download
