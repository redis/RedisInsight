import React, { useCallback, useEffect, useState } from 'react'
import cx from 'classnames'
import { useDispatch, useSelector } from 'react-redux'
import { useParams } from 'react-router-dom'
import { isEqual } from 'lodash'

import { RiCol, RiFlexItem } from 'uiBase/layout'
import {
  RiIconButton,
  RiPrimaryButton,
  RiSecondaryButton,
  RiAutoTag,
  AutoTagOption,
  RiSelect,
} from 'uiBase/forms'
import { SettingsIcon, RiIcon } from 'uiBase/icons'
import { RiPopover } from 'uiBase/index'
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

  const button = (
    <RiIconButton
      icon={SettingsIcon}
      onClick={onButtonClick}
      disabled={loading}
      className={cx(styles.anchorBtn)}
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
        panelClassName={styles.popoverWrapper}
        closePopover={closePopover}
        button={button}
      >
        <RiCol gap="s">
          <RiFlexItem grow className={styles.row} />
          <RiFlexItem grow className={styles.row}>
            <RiAutoTag
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
          </RiFlexItem>
          <RiFlexItem className={styles.row}>
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
          </RiFlexItem>
          <RiFlexItem className={styles.row}>
            <div className={styles.footer}>
              <RiSecondaryButton
                size="s"
                data-testid="tree-view-cancel-btn"
                onClick={closePopover}
              >
                Cancel
              </RiSecondaryButton>
              <RiPrimaryButton
                size="s"
                data-testid="tree-view-apply-btn"
                onClick={handleApply}
              >
                Apply
              </RiPrimaryButton>
            </div>
          </RiFlexItem>
        </RiCol>
      </RiPopover>
    </div>
  )
}

export default React.memo(KeyTreeSettings)
