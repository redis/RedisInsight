import React, { useCallback, useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useParams } from 'react-router-dom'
import { isEqual } from 'lodash'
import styled from 'styled-components'

import { sendEventTelemetry, TelemetryEvent } from 'uiSrc/telemetry'
import {
  DEFAULT_DELIMITER,
  DEFAULT_TREE_SORTING,
  SortOrder,
} from 'uiSrc/constants'
import {
  appContextDbConfig,
  resetBrowserTree,
  setBrowserTreeDelimiter,
  setBrowserTreeSort,
} from 'uiSrc/slices/app/context'
import { comboBoxToArray } from 'uiSrc/utils'

import { Col, FlexItem, Row } from 'uiSrc/components/base/layout/flex'
import {
  IconButton,
  PrimaryButton,
  SecondaryButton,
} from 'uiSrc/components/base/forms/buttons'
import { SettingsIcon } from 'uiSrc/components/base/icons'
import {
  AutoTag,
  AutoTagOption,
} from 'uiSrc/components/base/forms/combo-box/AutoTag'
import { RiSelect } from 'uiSrc/components/base/forms/select/RiSelect'
import { RiPopover } from 'uiSrc/components/base'
import { FormField } from 'uiSrc/components/base/forms/FormField'

const StyledCol = styled(Col)`
  width: 300px;
`

const TreeViewSettingsButton = styled(IconButton)<{
  isPopoverOpen: boolean
}>`
  background-color: ${({ theme, isPopoverOpen }) =>
    isPopoverOpen ? theme.semantic.color.background.neutral100 : 'transparent'};
`

export interface Props {
  loading: boolean
}
const sortOptions = [SortOrder.ASC, SortOrder.DESC].map((value) => ({
  value,
  inputDisplay: (
    <span data-testid={`tree-view-sorting-item-${value}`}>
      Key name {value}
    </span>
  ),
}))

const KeyTreeSettings = ({ loading }: Props) => {
  const { instanceId = '' } = useParams<{ instanceId: string }>()
  const {
    treeViewDelimiter = [DEFAULT_DELIMITER],
    treeViewSort = DEFAULT_TREE_SORTING,
  } = useSelector(appContextDbConfig)
  const [sorting, setSorting] = useState<SortOrder>(treeViewSort)
  const [delimiters, setDelimiters] =
    useState<AutoTagOption[]>(treeViewDelimiter)

  const [isPopoverOpen, setIsPopoverOpen] = useState(false)

  const dispatch = useDispatch()

  useEffect(() => {
    setSorting(treeViewSort)
  }, [treeViewSort])

  useEffect(() => {
    setDelimiters(treeViewDelimiter)
  }, [treeViewDelimiter])

  const onButtonClick = () =>
    setIsPopoverOpen((isPopoverOpen) => !isPopoverOpen)
  const closePopover = () => {
    setIsPopoverOpen(false)
    setTimeout(() => {
      resetStates()
    }, 500)
  }

  const resetStates = useCallback(() => {
    setSorting(treeViewSort)
    setDelimiters(treeViewDelimiter)
  }, [treeViewSort, treeViewDelimiter])

  const button = (
    <TreeViewSettingsButton
      isPopoverOpen={isPopoverOpen}
      icon={SettingsIcon}
      onClick={onButtonClick}
      disabled={loading}
      aria-label="open tree view settings"
      data-testid="tree-view-settings-btn"
    />
  )

  const handleApply = () => {
    if (!isEqual(delimiters, treeViewDelimiter)) {
      const delimitersValue = delimiters.length
        ? delimiters
        : [DEFAULT_DELIMITER]

      dispatch(setBrowserTreeDelimiter(delimitersValue))
      sendEventTelemetry({
        event: TelemetryEvent.TREE_VIEW_DELIMITER_CHANGED,
        eventData: {
          databaseId: instanceId,
          from: comboBoxToArray(treeViewDelimiter),
          to: comboBoxToArray(delimitersValue),
        },
      })

      dispatch(resetBrowserTree())
    }

    if (sorting !== treeViewSort) {
      dispatch(setBrowserTreeSort(sorting))

      sendEventTelemetry({
        event: TelemetryEvent.TREE_VIEW_KEYS_SORTED,
        eventData: {
          databaseId: instanceId,
          sorting: sorting || DEFAULT_TREE_SORTING,
        },
      })

      dispatch(resetBrowserTree())
    }

    setIsPopoverOpen(false)
  }

  const onChangeSort = (value: SortOrder) => {
    setSorting(value)
  }

  return (
    <RiPopover
      ownFocus={false}
      isOpen={isPopoverOpen}
      closePopover={closePopover}
      button={button}
    >
      <StyledCol gap="l">
        <FlexItem>
          <AutoTag
            layout="horizontal"
            label="Delimiter"
            placeholder=":"
            delimiter=" "
            selectedOptions={delimiters}
            onCreateOption={(del) =>
              setDelimiters([...delimiters, { label: del }])
            }
            onChange={(selectedOptions) => setDelimiters(selectedOptions)}
            data-testid="delimiter-combobox"
          />
        </FlexItem>
        <FlexItem>
          <FormField layout="horizontal" label="Sort by">
            <RiSelect
              options={sortOptions}
              valueRender={({ option }) => option.inputDisplay ?? option.value}
              value={sorting}
              onChange={(value: SortOrder) => onChangeSort(value)}
              data-testid="tree-view-sorting-select"
            />
          </FormField>
        </FlexItem>
        <FlexItem />
        <FlexItem>
          <Row gap="m" justify="end">
            <SecondaryButton
              data-testid="tree-view-cancel-btn"
              onClick={closePopover}
            >
              Cancel
            </SecondaryButton>
            <PrimaryButton
              data-testid="tree-view-apply-btn"
              onClick={handleApply}
            >
              Apply
            </PrimaryButton>
          </Row>
        </FlexItem>
      </StyledCol>
    </RiPopover>
  )
}

export default React.memo(KeyTreeSettings)
