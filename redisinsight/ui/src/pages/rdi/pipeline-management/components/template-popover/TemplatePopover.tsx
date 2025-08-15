import React from 'react'
import { useDispatch } from 'react-redux'
import { useParams } from 'react-router-dom'

import { RiOutsideClickDetector } from 'uiBase/utils'
import { RiSecondaryButton } from 'uiBase/forms'
import { RiPopover } from 'uiBase/display'
import TemplateForm from 'uiSrc/pages/rdi/pipeline-management/components/template-form'
import { fetchPipelineStrategies } from 'uiSrc/slices/rdi/pipeline'
import { RdiPipelineTabs } from 'uiSrc/slices/interfaces'

import styles from './styles.module.scss'

export interface Props {
  isPopoverOpen: boolean
  setIsPopoverOpen: (value: boolean) => void
  value: string
  setFieldValue: (template: string) => void
  loading: boolean
  source: RdiPipelineTabs
}

const TemplatePopover = (props: Props) => {
  const {
    isPopoverOpen,
    setIsPopoverOpen,
    value,
    loading,
    setFieldValue,
    source,
  } = props

  const { rdiInstanceId } = useParams<{ rdiInstanceId: string }>()

  const dispatch = useDispatch()

  const handleOpen = () => {
    dispatch(fetchPipelineStrategies(rdiInstanceId))
    setIsPopoverOpen(true)
  }

  const handleClose = () => {
    setIsPopoverOpen(false)
  }

  return (
    <RiOutsideClickDetector onOutsideClick={handleClose}>
      <RiPopover
        ownFocus
        anchorPosition="downRight"
        isOpen={isPopoverOpen}
        closePopover={handleClose}
        panelClassName={styles.popoverWrapper}
        button={
          <RiSecondaryButton
            inverted
            size="s"
            className={styles.btn}
            aria-label="Insert template"
            disabled={loading}
            onClick={handleOpen}
            data-testid={`template-trigger-${source}`}
          >
            Insert template
          </RiSecondaryButton>
        }
      >
        <TemplateForm
          closePopover={handleClose}
          setTemplate={setFieldValue}
          source={source}
          value={value}
        />
      </RiPopover>
    </RiOutsideClickDetector>
  )
}

export default TemplatePopover
