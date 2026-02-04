import styled from 'styled-components'

export const TooltipName = styled.div`
  max-width: 200px;
`

export const Tooltip = styled.div`
  max-width: 200px;
`

export const EditableCell = styled.div`
  display: flex;
  align-items: center;
  width: 100%;
`

export const IdText = styled.span`
  color: ${({ theme }) => theme.semantic.color.text.neutral500};
  font-size: 12px;
`

export const ErrorText = styled.span`
  color: ${({ theme }) => theme.semantic.color.text.danger500};
  font-size: 12px;
`

// Class names for VirtualTable column configuration and EditablePopover
export const cellClassName = 'groups-cell'
export const actionsHeaderClassName = 'groups-actions-header'
export const editLastIdClassName = 'groups-edit-last-id'
export const editBtnClassName = 'groups-edit-btn'
export const tooltipNameClassName = 'groups-tooltip-name'
export const tooltipClassName = 'groups-tooltip'
export const editableCellClassName = 'groups-editable-cell'

export const ClassStyles = styled.div`
  .${cellClassName} {
    overflow: hidden;
  }

  .${actionsHeaderClassName} {
    width: 54px;
  }

  .${editLastIdClassName} {
    width: 100%;
  }

  .${editBtnClassName} {
    margin-left: 8px;
  }

  .${tooltipNameClassName}, .${tooltipClassName} {
    max-width: 200px;
  }

  .${editableCellClassName} {
    display: flex;
    align-items: center;
    width: 100%;
  }
`
