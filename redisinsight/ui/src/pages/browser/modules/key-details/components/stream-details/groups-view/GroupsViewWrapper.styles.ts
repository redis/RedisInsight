import styled from 'styled-components'
import { HTMLAttributes } from 'react'

export const Tooltip = styled.div`
  max-width: 200px;
`

export const CellWrapper = styled.div`
  max-width: 100%;
`

export const GroupsCell = styled.div`
  overflow: hidden;
`

export const DateWrapper = styled.div<HTMLAttributes<HTMLDivElement>>`
  display: flex;
  max-width: 190px;
`

// Class names for VirtualTable column configuration and EditablePopover
export const actionsHeaderClassName = 'groups-actions-header'
export const editLastIdClassName = 'groups-edit-last-id'
export const editBtnClassName = 'groups-edit-btn'
export const tooltipNameClassName = 'groups-tooltip-name'
export const tooltipClassName = 'groups-tooltip'
export const editableCellClassName = 'groups-editable-cell'

export const ClassStyles = styled.div`
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
