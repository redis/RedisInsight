import styled from 'styled-components'
import { Col } from 'uiSrc/components/base/layout/flex'
import { Theme } from 'uiSrc/components/base/theme/types'
import { Container as StreamDataViewContainer } from '../stream-data-view/StreamDataView/StreamDataView.styles'
import { Container as MessagesViewContainer } from '../messages-view/MessagesView/MessagesView.styles'
import { Container as GroupsViewContainer } from '../groups-view/GroupsView/GroupsView.styles'
import { Container as ConsumersViewContainer } from '../consumers-view/ConsumersView/ConsumersView.styles'

const CELL_PADDING_WIDTH = '12px'

export const Container = styled(Col)`
  padding: 0 ${({ theme }: { theme: Theme }) => theme.core.space.space200};
  height: 100%;
  position: relative;

  ${StreamDataViewContainer},
  ${MessagesViewContainer},
  ${GroupsViewContainer},
  ${ConsumersViewContainer} {
    height: calc(100% - 125px);
  }

  .ReactVirtualized__Grid__innerScrollContainer {
    .ReactVirtualized__Table__rowColumn {
      padding-right: 6px;
      border-left: none;

      > div {
        max-width: 100%;
        min-height: 54px;
        padding: ${CELL_PADDING_WIDTH};
      }
    }

    .ReactVirtualized__Table__row {
      &:last-of-type {
        border-bottom: none;
      }
    }

    & > div:hover {
      background: ${({ theme }) => theme.semantic.color.background.neutral100};
    }
  }

  .ReactVirtualized__Table__headerRow {
    .streamItemHeader {
      padding-right: 4px;

      > div > div:first-of-type {
        padding: 18px 0 18px ${CELL_PADDING_WIDTH};
      }
    }
  }

  .ReactVirtualized__Table__Grid {
    border: 1px solid ${({ theme }) => theme.semantic.color.border.neutral400};
    border-top: 0;
  }

  .streamItem {
    white-space: normal;
    max-width: 100%;
    word-break: break-all;
  }

  .streamItemId {
    color: ${({ theme }) => theme.semantic.color.text.neutral500};
    display: flex;
  }

  .stream-entry-actions {
    margin-left: -5px;
  }
`

export const RangeWrapper = styled.div`
  margin: 30px 30px 26px;
  padding: 12px 0;
`

export const SliderTrack = styled.div`
  position: absolute;
  background-color: ${({ theme }) => theme.semantic.color.border.neutral400};
  width: 100%;
  height: 1px;
  margin-top: 2px;
  z-index: 1;
`

export const MockRange = styled(SliderTrack)`
  left: 18px;
  width: calc(100% - 36px);
`
