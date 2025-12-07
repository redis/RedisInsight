import React from 'react'
import { useDispatch, useSelector } from 'react-redux'

import { instancesSelector, setShownColumns } from 'uiSrc/slices/rdi/instances'
import { FlexItem, Row } from 'uiSrc/components/base/layout/flex'
import { Spacer } from 'uiSrc/components/base/layout/spacer'
import { PrimaryButton } from 'uiSrc/components/base/forms/buttons'
import { RDI_COLUMN_FIELD_NAME_MAP, RdiListColumn } from 'uiSrc/constants'
import { sendEventTelemetry, TelemetryEvent } from 'uiSrc/telemetry'
import ColumnsConfigPopover from 'uiSrc/components/columns-config/ColumnsConfigPopover'
import { PlusIcon } from 'uiSrc/components/base/icons'
import SearchRdiList from '../search/SearchRdiList'

export interface Props {
  onRdiInstanceClick: () => void
}

const RdiHeader = ({ onRdiInstanceClick }: Props) => {
  const dispatch = useDispatch()
  const { data: instances, shownColumns } = useSelector(instancesSelector)

  if (instances.length === 0) {
    return null
  }

  const handleColumnsChange = (
    next: RdiListColumn[],
    diff: { shown: RdiListColumn[]; hidden: RdiListColumn[] },
  ) => {
    dispatch(setShownColumns(next))
    sendEventTelemetry({
      event: TelemetryEvent.RDI_INSTANCE_LIST_COLUMNS_CLICKED,
      eventData: diff,
    })
  }

  return (
    <div className="containerDl">
      <Row className="contentDL" align="center" gap="s">
        <FlexItem>
          <PrimaryButton
            onClick={onRdiInstanceClick}
            data-testid="rdi-instance"
            icon={PlusIcon}
          >
            RDI Instance
          </PrimaryButton>
        </FlexItem>
        {instances.length > 0 && (
          <Row justify="end" align="center" gap="l">
            <ColumnsConfigPopover
              columnsMap={RDI_COLUMN_FIELD_NAME_MAP}
              shownColumns={shownColumns}
              onChange={handleColumnsChange}
            />
            <SearchRdiList />
          </Row>
        )}
      </Row>
      <Spacer className="spacerDl" />
    </div>
  )
}

export default RdiHeader
