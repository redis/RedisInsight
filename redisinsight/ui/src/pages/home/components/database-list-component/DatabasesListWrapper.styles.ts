import styled, { css } from 'styled-components'

const BREAKPOINT_M = '1150px'
const BREAKPOINT_L = '1400px'

export const TooltipAnchorColumnName = styled.span`
  text-decoration: underline;

  &:hover {
    text-decoration: none;
  }
`

interface TooltipColumnNameTextProps {
  $withDb?: boolean
}

export const TooltipColumnNameText = styled.span<TooltipColumnNameTextProps>`
  display: inline-block;
  max-width: 100%;
  overflow: hidden;
  vertical-align: top;
  text-overflow: ellipsis;
  white-space: nowrap;
  text-decoration: inherit;

  ${({ $withDb }) =>
    $withDb &&
    css`
      max-width: 89%;

      @media (min-width: ${BREAKPOINT_M}) {
        max-width: 92%;
      }

      @media (min-width: ${BREAKPOINT_L}) {
        max-width: 95%;
      }
    `}
`

export const NoSearchResults = styled.div`
  display: flex;
  height: calc(100vh - 278px);
  align-items: center;
  flex-direction: column;
  justify-content: center;
`

export const TableMsgTitle = styled.div`
  font-size: 18px;
  margin-bottom: 12px;
  height: 24px;
  color: ${({ theme }) => theme.semantic.color.text.neutral700};
`

export const Container = styled.div`
  height: 100%;

  // Database alias column
  tr > th:nth-child(2),
  tr > td:nth-child(2) {
    padding-left: 5px;
  }

  tr:hover {
    .tagsButton {
      display: inline-block;
    }
  }

  .euiTableRow.cloudDbRow {
    cursor: pointer;

    .euiTableRowCellCheckbox {
      background-image: url('uiSrc/assets/img/icons/star.svg');
      background-repeat: no-repeat;
      background-position: center;
    }
    .euiTableRowCellCheckbox .euiCheckbox {
      visibility: hidden;
    }
  }

  .hideSelectableCheckboxes .euiCheckbox {
    visibility: hidden;
  }
`

export const CloudIcon = styled.span`
  path {
    fill: ${({ theme }) => theme.semantic.color.text.neutral600};
  }
`

export const TagsButton = styled.span`
  display: none;
`

// Class names for third-party components
export const tooltipColumnNameClassName = 'databases-tooltip-column-name'
export const columnModulesClassName = 'databases-column-modules'
export const tooltipLogoClassName = 'databases-tooltip-logo'
export const columnNewClassName = 'databases-column-new'
export const tagsButtonClassName = 'databases-tags-button'
export const cloudIconClassName = 'databases-cloud-icon'

export const ClassStyles = styled.div`
  .${tooltipColumnNameClassName} {
    max-width: 370px;
    * {
      line-height: 1.19;
      font-size: 14px;
      &:not(.euiToolTip__title) {
        font-weight: 300;
      }
    }
  }

  .${columnModulesClassName} {
    height: 40px;
    padding-right: 0;
  }

  .${tooltipLogoClassName} {
    width: 88px;
    height: 18px;
  }

  .${columnNewClassName} {
    padding: 0;

    .euiFlexItem {
      margin: 0;
    }
  }

  .${tagsButtonClassName} {
    display: none;
  }

  .${cloudIconClassName} {
    path {
      fill: ${({ theme }) => theme.semantic.color.text.neutral600};
    }
  }

  .controlsPopoverContent {
    display: flex;
    flex-direction: column;

    & > div {
      display: flex;

      button {
        flex: 1;

        .euiButtonContent {
          justify-content: start;
        }
      }
    }
  }
`
