import styled from 'styled-components'

// Class names for VirtualTable column configuration
export const cellClassName = 'messages-cell'
export const deliveredHeaderCellClassName = 'messages-delivered-header-cell'
export const actionCellClassName = 'messages-action-cell'

export const ClassStyles = styled.div`
  .${cellClassName} {
    overflow: hidden;
  }

  .${deliveredHeaderCellClassName} {
    min-width: 200px;
  }

  .${actionCellClassName} {
    width: 100%;
    display: flex;
    justify-content: flex-end;
  }
`
