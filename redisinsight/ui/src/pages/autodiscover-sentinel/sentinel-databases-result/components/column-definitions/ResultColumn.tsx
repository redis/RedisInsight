import React from 'react'

import { FlexItem, Row } from 'uiSrc/components/base/layout/flex'
import { Loader } from 'uiSrc/components/base/display'
import {
  AddRedisDatabaseStatus,
  ModifiedSentinelMaster,
} from 'uiSrc/slices/interfaces'
import { CellText } from 'uiSrc/components/auto-discover'
import { RiTooltip } from 'uiSrc/components'
import { ColorText } from 'uiSrc/components/base/text'
import { Spacer } from 'uiSrc/components/base/layout'
import { InfoIcon, RiIcon } from 'uiSrc/components/base/icons'
import { ColumnDef } from 'uiSrc/components/base/layout/table'
import { ApiStatusCode } from 'uiSrc/constants'
import { ApiEncryptionErrors } from 'uiSrc/constants/apiErrors'
import validationErrors from 'uiSrc/constants/validationErrors'
import { PrimaryButton } from 'uiSrc/components/base/forms/buttons'
import { ColumnDefinitionTitles } from 'uiSrc/pages/autodiscover-sentinel/constants/constants'

const addError = (
  { name, error, alias, loading }: ModifiedSentinelMaster,
  onAddInstance: (name: string) => void = () => {},
) => {
  const isDisabled = !alias
  if (
    typeof error === 'object' &&
    error !== null &&
    'statusCode' in error &&
    error?.statusCode !== ApiStatusCode.Unauthorized &&
    !ApiEncryptionErrors.includes(error?.name || '') &&
    error?.statusCode !== ApiStatusCode.BadRequest
  ) {
    return ''
  }
  return (
    <FlexItem padding role="presentation">
      <RiTooltip
        position="top"
        title={isDisabled ? validationErrors.REQUIRED_TITLE(1) : null}
        content={isDisabled ? <span>Database Alias</span> : null}
      >
        <PrimaryButton
          size="s"
          disabled={isDisabled}
          loading={loading}
          onClick={() => onAddInstance(name)}
          icon={isDisabled ? InfoIcon : undefined}
        >
          Add Primary Group
        </PrimaryButton>
      </RiTooltip>
    </FlexItem>
  )
}

export const ResultColumn = (
  addActions?: boolean,
  onAddInstance?: (name: string) => void,
): ColumnDef<ModifiedSentinelMaster> => {
  return {
    header: ColumnDefinitionTitles.Result,
    id: 'message',
    accessorKey: 'message',
    enableSorting: true,
    minSize: addActions ? 250 : 110,
    cell: ({
      row: {
        original: { status, message, name, error, alias, loading = false },
      },
    }) => {
      return (
        <Row
          data-testid={`status_${name}_${status}`}
          align="center"
          justify="between"
          gap="m"
        >
          {loading && <Loader size="L" />}
          {!loading && status === AddRedisDatabaseStatus.Success && (
            <CellText>{message}</CellText>
          )}
          {!loading && status !== AddRedisDatabaseStatus.Success && (
            <RiTooltip position="right" title="Error" content={message}>
              <FlexItem direction="row" grow={false}>
                <ColorText
                  size="S"
                  color="danger"
                  style={{ cursor: 'pointer' }}
                >
                  Error
                </ColorText>
                <Spacer size="s" direction="horizontal" />
                <RiIcon size="M" type="ToastDangerIcon" color="danger600" />
              </FlexItem>
            </RiTooltip>
          )}
          {addActions &&
            addError({ name, error, alias, loading }, onAddInstance)}
        </Row>
      )
    },
  }
}
