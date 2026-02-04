import styled from 'styled-components'

export const Option = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
  height: 36px;
`

export const PendingCount = styled.span`
  font:
    normal normal normal 13px/24px Graphik,
    sans-serif;
  letter-spacing: -0.13px;
  color: ${({ theme }) => theme.semantic.color.text.neutral500};
  white-space: nowrap;
`

export const ConsumerName = styled.span`
  overflow: hidden;
  text-overflow: ellipsis;
`

export const TimeWrapper = styled.div`
  position: relative;
`

export const TimeUnit = styled.div`
  position: absolute;
  top: 12px;
  right: 5px;
  font-size: 12px;
`

// Class names for third-party components and fields that expect string className
export const consumerFieldClassName = 'claim-consumer-field'
export const fieldWithAppendClassName = 'claim-field-with-append'
export const retryCountFieldClassName = 'claim-retry-count-field'
export const claimBtnClassName = 'claim-btn'
export const popoverWrapperClassName = 'claim-popover-wrapper'
export const consumerOptionClassName = 'claim-consumer-option'
export const timeSelectClassName = 'claim-time-select'
export const timeOptionFieldClassName = 'claim-time-option-field'
export const hiddenLabelClassName = 'claim-hidden-label'

export const ClassStyles = styled.div`
  .${consumerFieldClassName} {
    width: 389px;
    height: 36px;
  }

  .${fieldWithAppendClassName} {
    width: 162px;
    height: 36px;
    padding-right: 40px;
  }

  .${retryCountFieldClassName} {
    width: 88px;
    height: 36px;
  }

  .${consumerOptionClassName} {
    .euiContextMenu__itemLayout {
      margin-right: 20px;
      height: 20px;

      ${PendingCount} {
        padding-right: 13px;
      }
    }
  }
`
