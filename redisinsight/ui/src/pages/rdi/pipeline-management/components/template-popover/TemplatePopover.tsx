import React from 'react'
import { useAppDispatch } from 'uiSrc/slices/hooks'
import { useParams } from 'react-router-dom'

import TemplateForm from 'uiSrc/pages/rdi/pipeline-management/components/template-form'
import { fetchPipelineStrategies } from 'uiSrc/slices/rdi/pipeline'
import { RdiPipelineTabs } from 'uiSrc/slices/interfaces'
import { OutsideClickDetector } from 'uiSrc/components/base/utils'

import { SecondaryButton } from 'uiSrc/components/base/forms/buttons'
import { RiPopover } from 'uiSrc/components/base'
import { useTranslation } from 'uiSrc/i18n'
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
  const { t } = useTranslation()
  const {
    isPopoverOpen,
    setIsPopoverOpen,
    value,
    loading,
    setFieldValue,
    source,
  } = props

  const { rdiInstanceId } = useParams<{ rdiInstanceId: string }>()

  const dispatch = useAppDispatch()

  const handleOpen = () => {
    dispatch(fetchPipelineStrategies(rdiInstanceId))
    setIsPopoverOpen(true)
  }

  const handleClose = () => {
    setIsPopoverOpen(false)
  }

  return (
    <OutsideClickDetector onOutsideClick={handleClose}>
      <RiPopover
        ownFocus
        anchorPosition="downRight"
        isOpen={isPopoverOpen}
        closePopover={handleClose}
        panelClassName={styles.popoverWrapper}
        button={
          <SecondaryButton
            inverted
            size="s"
            className={styles.btn}
            aria-label={t('rdi.pipeline.template.insertAria')}
            disabled={loading}
            onClick={handleOpen}
            data-testid={`template-trigger-${source}`}
          >
            {t('rdi.pipeline.template.insertButton')}
          </SecondaryButton>
        }
      >
        <TemplateForm
          closePopover={handleClose}
          setTemplate={setFieldValue}
          source={source}
          value={value}
        />
      </RiPopover>
    </OutsideClickDetector>
  )
}

export default TemplatePopover
