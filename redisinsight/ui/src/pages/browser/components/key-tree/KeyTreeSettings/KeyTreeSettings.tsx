import React, { useCallback, useEffect, useState } from 'react'
import cx from 'classnames'
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

import { Col, FlexItem } from 'uiSrc/components/base/layout/flex'
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
import { RiIcon } from 'uiSrc/components/base/icons/RiIcon'
import { RiSelect } from 'uiSrc/components/base/forms/select/RiSelect'
import { RiPopover } from 'uiSrc/components/base'
import { Theme } from 'uiSrc/components/base/theme/types'
import styles from './styles.module.scss'

export interface Props {
  loading: boolean
}
const sortOptions = [SortOrder.ASC, SortOrder.DESC].map((value) => ({
  value,
  inputDisplay: (
    <span
      data-testid={`tree-view-sorting-item-${value}`}
      className={styles.selectItem}
    >
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

  const TreeViewSettingsButton = styled(IconButton)`
    background-color: ${({ theme }: { theme: Theme }) =>
      isPopoverOpen ? theme.color.gray100 : 'transparent'};
  `

  const button = (
    <TreeViewSettingsButton
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
    <div className={styles.container}>
      <RiPopover
        ownFocus={false}
        anchorPosition="downLeft"
        isOpen={isPopoverOpen}
        anchorClassName={styles.anchorWrapper}
        panelClassName={cx('popover-without-top-tail', styles.popoverWrapper)}
        closePopover={closePopover}
        button={button}
      >
        <Col gap="s">
          <FlexItem grow className={styles.row} />
          <FlexItem grow className={styles.row}>
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
              className={styles.combobox}
              data-testid="delimiter-combobox"
            />
          </FlexItem>
          <FlexItem className={styles.row}>
            <div className={styles.label}>
              <RiIcon type="DescendingIcon" className={styles.sortIcon} />
              Sort by
            </div>
            <RiSelect
              options={sortOptions}
              valueRender={({ option }) => option.inputDisplay ?? option.value}
              value={sorting}
              className={styles.select}
              onChange={(value: SortOrder) => onChangeSort(value)}
              data-testid="tree-view-sorting-select"
            />
          </FlexItem>
          <FlexItem className={styles.row}>
            <div className={styles.footer}>
              <SecondaryButton
                size="s"
                data-testid="tree-view-cancel-btn"
                onClick={closePopover}
              >
                Cancel
              </SecondaryButton>
              <PrimaryButton
                size="s"
                data-testid="tree-view-apply-btn"
                onClick={handleApply}
              >
                Apply
              </PrimaryButton>
            </div>
          </FlexItem>
        </Col>
      </RiPopover>
    </div>
  )
}

export default React.memo(KeyTreeSettings)
