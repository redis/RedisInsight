import React from 'react'
import { useDispatch } from 'react-redux'
import { useParams } from 'react-router-dom'

import TemplateForm from 'uiSrc/pages/rdi/pipeline-management/components/template-form'
import { fetchPipelineStrategies } from 'uiSrc/slices/rdi/pipeline'
import { RdiPipelineTabs } from 'uiSrc/slices/interfaces'
import { OutsideClickDetector } from 'uiSrc/components/base/utils'

import { RiPopover } from 'uiSrc/components/base'
import * as S from './TemplatePopover.styles'

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
    <OutsideClickDetector onOutsideClick={handleClose}>
      <RiPopover
        ownFocus
        anchorPosition="downRight"
        isOpen={isPopoverOpen}
        closePopover={handleClose}
        maxWidth={S.POPOVER_WIDTH}
        button={
          <S.PopoverButton
            aria-label="Insert template"
            disabled={loading}
            onClick={handleOpen}
            data-testid={`template-trigger-${source}`}
          >
            Insert template
          </S.PopoverButton>
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
