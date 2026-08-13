import React, { useCallback, useEffect, useState } from 'react'
import { useAppDispatch, useAppSelector } from 'uiSrc/slices/hooks'
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
  setBrowserTreePrefixLength,
  setBrowserTreeSort,
} from 'uiSrc/slices/app/context'
import { comboBoxToArray } from 'uiSrc/utils'
import { useTranslation } from 'uiSrc/i18n'
import { NumericInput } from 'uiSrc/components/base/inputs'

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

const MAX_PREFIX_LENGTH = 512

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

const KeyTreeSettings = ({ loading }: Props) => {
  const { t } = useTranslation()
  const sortOptions = [SortOrder.ASC, SortOrder.DESC].map((value) => ({
    value,
    inputDisplay: (
      <span data-testid={`tree-view-sorting-item-${value}`}>
        {t('browser.tree.settings.sortOption', { order: value })}
      </span>
    ),
  }))
  const { instanceId = '' } = useParams<{ instanceId: string }>()
  const {
    treeViewDelimiter = [DEFAULT_DELIMITER],
    treeViewSort = DEFAULT_TREE_SORTING,
    treeViewDelimiterPrefixLength = 0,
  } = useAppSelector(appContextDbConfig)
  const [sorting, setSorting] = useState<SortOrder>(treeViewSort)
  const [delimiters, setDelimiters] =
    useState<AutoTagOption[]>(treeViewDelimiter)
  const [pendingInput, setPendingInput] = useState('')
  const [prefixLength, setPrefixLength] = useState<number>(
    treeViewDelimiterPrefixLength,
  )

  const [isPopoverOpen, setIsPopoverOpen] = useState(false)

  const dispatch = useAppDispatch()

  useEffect(() => {
    setSorting(treeViewSort)
  }, [treeViewSort])

  useEffect(() => {
    setDelimiters(treeViewDelimiter)
  }, [treeViewDelimiter])

  useEffect(() => {
    setPrefixLength(treeViewDelimiterPrefixLength)
  }, [treeViewDelimiterPrefixLength])

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
    setPendingInput('')
    setPrefixLength(treeViewDelimiterPrefixLength)
  }, [treeViewSort, treeViewDelimiter, treeViewDelimiterPrefixLength])

  const button = (
    <TreeViewSettingsButton
      isPopoverOpen={isPopoverOpen}
      icon={SettingsIcon}
      onClick={onButtonClick}
      disabled={loading}
      aria-label={t('browser.tree.settings.aria')}
      data-testid="tree-view-settings-btn"
    />
  )

  const handleApply = () => {
    let finalDelimiters = delimiters
    if (pendingInput.trim()) {
      finalDelimiters = [...delimiters, { label: pendingInput.trim() }]
      setPendingInput('')
    }

    if (!isEqual(finalDelimiters, treeViewDelimiter)) {
      const delimitersValue = finalDelimiters.length
        ? finalDelimiters
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

    if (prefixLength !== treeViewDelimiterPrefixLength) {
      dispatch(setBrowserTreePrefixLength(prefixLength))
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
            label={t('browser.tree.settings.delimiter')}
            placeholder=":"
            delimiter=" "
            selectedOptions={delimiters}
            onCreateOption={(del) =>
              setDelimiters([...delimiters, { label: del }])
            }
            onChange={(selectedOptions) => setDelimiters(selectedOptions)}
            onInputChange={setPendingInput}
            data-testid="delimiter-combobox"
          />
        </FlexItem>
        <FlexItem>
          <FormField
            layout="horizontal"
            label={t(
              'browser.tree.settings.prefixLength',
              'Ignore separator in first N chars',
            )}
            infoIconProps={{
              content: t(
                'browser.tree.settings.prefixLengthHint',
                'Characters before position N are treated as a prefix — separators within that prefix are ignored. Set to 0 to disable. Large values flatten the tree.',
              ),
            }}
          >
            <NumericInput
              min={0}
              max={MAX_PREFIX_LENGTH}
              value={prefixLength}
              onChange={(next) =>
                setPrefixLength(
                  Math.min(
                    MAX_PREFIX_LENGTH,
                    Math.max(0, Math.round(Number(next ?? 0))),
                  ),
                )
              }
              data-testid="prefix-length-input"
            />
          </FormField>
        </FlexItem>
        <FlexItem>
          <FormField
            layout="horizontal"
            label={t('browser.tree.settings.sortBy')}
          >
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
              {t('browser.tree.settings.button.cancel')}
            </SecondaryButton>
            <PrimaryButton
              data-testid="tree-view-apply-btn"
              onClick={handleApply}
            >
              {t('browser.tree.settings.button.apply')}
            </PrimaryButton>
          </Row>
        </FlexItem>
      </StyledCol>
    </RiPopover>
  )
}

export default React.memo(KeyTreeSettings)
