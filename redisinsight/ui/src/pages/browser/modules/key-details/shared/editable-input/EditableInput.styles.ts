import styled from 'styled-components'

export const ContentWrapper = styled.div`
  display: flex;
  align-items: center;
  position: relative;
  flex-grow: 1;
  width: 100%;
  height: 100%;
  min-height: 42px;
  padding-right: 32px;
`

export const InputWrapper = styled.div`
  max-width: calc(100% - 48px);
  padding: 0 4px;
`

export const EditBtnAnchor = styled.div`
  position: absolute;
  right: 4px;
`

// Controls styles for InlineItemEditor - using global class
// This needs to remain as className string due to InlineItemEditor API
export const controlsClassName = 'editable-input-controls'

export const ControlsStyles = styled.div`
  .${controlsClassName} {
    padding: 2px;
    width: 48px;
    box-shadow: none;
    background-color: transparent;
    display: flex;
    align-items: center;
    justify-content: space-between;

    .euiButtonIcon,
    .euiToolTipAnchor {
      width: 20px;
      height: 20px;
      min-width: 20px;
    }
  }
`
