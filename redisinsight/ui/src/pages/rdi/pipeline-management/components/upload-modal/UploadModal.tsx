import JSZip from 'jszip'
import React, { useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useParams } from 'react-router-dom'

import { validatePipeline } from 'uiSrc/components/yaml-validator'
import { FileChangeType } from 'uiSrc/slices/interfaces'
import {
  rdiPipelineSelector,
  setChangedFiles,
  setConfigValidationErrors,
  setIsPipelineValid,
  setJobsValidationErrors,
  setPipelineConfig,
  setPipelineJobs,
} from 'uiSrc/slices/rdi/pipeline'
import { sendEventTelemetry, TelemetryEvent } from 'uiSrc/telemetry'
import UploadDialog from './components/upload-dialog/UploadDialog'

export interface Props {
  children?: React.ReactElement
  onUploadedPipeline?: () => void
  visible?: boolean
  onClose?: () => void
}

const UploadModal = (props: Props) => {
  const { children, visible, onUploadedPipeline, onClose } = props

  const [isModalVisible, setIsModalVisible] = useState(visible)
  const [file, setFile] = useState<File>()
  const [isUploaded, setIsUploaded] = useState(false)
  const [error, setError] = useState<string>()

  const {
    loading,
    config: pipelineConfig,
    jobs: pipelineJobs,
    schema,
    monacoJobsSchema,
    jobNameSchema,
  } = useSelector(rdiPipelineSelector)

  const { rdiInstanceId } = useParams<{ rdiInstanceId: string }>()

  const dispatch = useDispatch()

  const validateZip = (zip: JSZip) => {
    // check if config.yaml exists
    if (zip.file('config.yaml') === null) {
      throw new Error('config.yaml is missing')
    }

    // check if job files exist
    const jobFiles = Object.keys(zip.files).filter((filename) =>
      filename.startsWith('jobs/'),
    )
    if (!jobFiles.length) {
      throw new Error('No jobs folder found')
    }
  }

  const handleUploadClick = () => {
    sendEventTelemetry({
      event: TelemetryEvent.RDI_PIPELINE_UPLOAD_FROM_FILE_CLICKED,
      eventData: {
        id: rdiInstanceId,
      },
    })

    setIsModalVisible(true)
  }

  const handleConfirmModal = async () => {
    if (!file) {
      return
    }

    // unzip config and job contents and set form values
    try {
      const zip = await JSZip.loadAsync(file)

      validateZip(zip)

      const config = await zip.file('config.yaml')?.async('string')
      const jobs = await Promise.all(
        Object.keys(zip.files)
          .filter(
            (filename) =>
              filename.startsWith('jobs/') && filename.endsWith('.yaml'),
          )
          .map(async (filename) => ({
            name: filename.split('/')[1].split('.')[0],
            value: await zip.files[filename].async('string'),
          })),
      )

      const uploadFiles = {
        config: FileChangeType.Added,
        ...jobs.reduce(
          (acc, { name }) => {
            acc[name] = FileChangeType.Added
            return acc
          },
          {} as Record<string, FileChangeType>,
        ),
      }

      dispatch(setChangedFiles(uploadFiles))

      dispatch(setPipelineConfig(config || ''))
      dispatch(setPipelineJobs(jobs))

      if (config && schema && jobs?.length) {
        const { result, configValidationErrors, jobsValidationErrors } =
          validatePipeline({
            config,
            schema,
            jobs,
            monacoJobsSchema,
            jobNameSchema,
          })

        dispatch(setConfigValidationErrors(configValidationErrors))
        dispatch(setJobsValidationErrors(jobsValidationErrors))
        dispatch(setIsPipelineValid(result))
      }

      sendEventTelemetry({
        event: TelemetryEvent.RDI_PIPELINE_UPLOAD_SUCCEEDED,
        eventData: {
          id: rdiInstanceId,
          jobsNumber: jobs.length,
          source: 'file',
        },
      })

      setIsUploaded(true)
      onUploadedPipeline?.()
    } catch (err) {
      const errorMessage = (err as Error).message

      sendEventTelemetry({
        event: TelemetryEvent.RDI_PIPELINE_UPLOAD_FAILED,
        eventData: {
          id: rdiInstanceId,
          errorMessage,
          source: 'file',
        },
      })

      setError(errorMessage)
    }
  }

  const handleCloseModal = () => {
    setIsModalVisible(false)
    setIsUploaded(false)
    setError(undefined)
    onClose?.()
  }

  const handleFileChangeModal = (file: File) => {
    setFile(file)
  }

  const button = children
    ? React.cloneElement(children, {
        disabled: loading,
        onClick: handleUploadClick,
      })
    : null

  return (
    <>
      {isModalVisible && (
        <UploadDialog
          onClose={handleCloseModal}
          onConfirm={handleConfirmModal}
          onFileChange={handleFileChangeModal}
          isUploaded={isUploaded}
          showWarning={
            (!!pipelineConfig || !!pipelineJobs?.length) &&
            !isUploaded &&
            !error
          }
          error={error}
          loading={loading}
        />
      )}
      {button}
    </>
  )
}

export default UploadModal
