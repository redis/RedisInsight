import React, { useState, useEffect } from 'react'
import cx from 'classnames'
import { useSelector } from 'react-redux'

import { sentinelSelector } from 'uiSrc/slices/instances/sentinel'
import { ModifiedSentinelMaster } from 'uiSrc/slices/interfaces'
import validationErrors from 'uiSrc/constants/validationErrors'
import { AutodiscoveryPageTemplate } from 'uiSrc/templates'

import {
  RiFlexItem,
  RiRow,
  RiTable,
  ColumnDefinition,
} from 'uiSrc/components/base/layout'
import {
  RiDestructiveButton,
  RiPrimaryButton,
  RiSecondaryButton,
  RiFormField,
} from 'uiSrc/components/base/forms'
import { InfoIcon } from 'uiSrc/components/base/icons'
import { RiSearchInput } from 'uiSrc/components/base/inputs'
import { RiTitle, RiText } from 'uiSrc/components/base/text'
import { RiPopover, RiTooltip } from 'uiSrc/components/base'
import styles from '../../../styles.module.scss'

export interface Props {
  columns: ColumnDefinition<ModifiedSentinelMaster>[]
  masters: ModifiedSentinelMaster[]
  onClose: () => void
  onBack: () => void
  onSubmit: (databases: ModifiedSentinelMaster[]) => void
}

interface IPopoverProps {
  isPopoverOpen: boolean
}

const loadingMsg = 'loading...'
const notMastersMsg = 'Your Redis Sentinel has no primary groups available.'
const notFoundMsg = 'Not found.'

const SentinelDatabases = ({
  columns,
  onClose,
  onBack,
  onSubmit,
  masters,
}: Props) => {
  const [items, setItems] = useState<ModifiedSentinelMaster[]>(masters)
  const [message, setMessage] = useState(loadingMsg)
  const [isPopoverOpen, setIsPopoverOpen] = useState(false)
  const [selection, setSelection] = useState<ModifiedSentinelMaster[]>([])

  const { loading } = useSelector(sentinelSelector)

  const updateSelection = (
    selected: ModifiedSentinelMaster[],
    masters: ModifiedSentinelMaster[],
  ) =>
    selected.map(
      (select) => masters.find((master) => master.id === select.id) ?? select,
    )

  useEffect(() => {
    if (masters.length) {
      setItems(masters)
      setSelection((prevState) => updateSelection(prevState, masters))
    }

    if (!masters.length) {
      setMessage(notMastersMsg)
    }
  }, [masters])

  const handleSubmit = () => {
    onSubmit(selection)
  }

  const showPopover = () => {
    setIsPopoverOpen(true)
  }

  const closePopover = () => {
    setIsPopoverOpen(false)
  }

  const isSubmitDisabled = () => {
    const selected = selection.length < 1
    const emptyAliases = selection.filter(({ alias }) => !alias)
    return selected || emptyAliases.length !== 0
  }

  const selectionValue = {
    onSelectionChange: (selected: ModifiedSentinelMaster) =>
      setSelection((previous) => {
        const isSelected = previous.some((item) => item.id === selected.id)
        if (isSelected) {
          return previous.filter((item) => item.id !== selected.id)
        }
        return [...previous, selected]
      }),
  }

  const onQueryChange = (term: string) => {
    const value = term?.toLowerCase()

    const itemsTemp = masters.filter(
      (item: ModifiedSentinelMaster) =>
        item.name?.toLowerCase().includes(value) ||
        item.host?.toLowerCase().includes(value) ||
        item.alias?.toLowerCase().includes(value) ||
        item.username?.toLowerCase().includes(value) ||
        item.port?.toString()?.includes(value) ||
        item.numberOfSlaves?.toString().includes(value),
    )

    if (!itemsTemp.length) {
      setMessage(notFoundMsg)
    }
    setItems(itemsTemp)
  }

  const CancelButton = ({ isPopoverOpen: popoverIsOpen }: IPopoverProps) => (
    <RiPopover
      anchorPosition="upCenter"
      isOpen={popoverIsOpen}
      closePopover={closePopover}
      panelClassName={styles.panelCancelBtn}
      panelPaddingSize="l"
      button={
        <RiSecondaryButton
          onClick={showPopover}
          color="secondary"
          className="btn-cancel"
          data-testid="btn-cancel"
        >
          Cancel
        </RiSecondaryButton>
      }
    >
      <RiText size="m">
        Your changes have not been saved.&#10;&#13; Do you want to proceed to
        the list of databases?
      </RiText>
      <br />
      <div>
        <RiDestructiveButton
          size="s"
          onClick={onClose}
          data-testid="btn-cancel-proceed"
        >
          Proceed
        </RiDestructiveButton>
      </div>
    </RiPopover>
  )

  const SubmitButton = ({ onClick }: { onClick: () => void }) => {
    let title = null
    let content = null
    const emptyAliases = selection.filter(({ alias }) => !alias)

    if (selection.length < 1) {
      title = validationErrors.SELECT_AT_LEAST_ONE('primary group')
      content = validationErrors.NO_PRIMARY_GROUPS_SENTINEL
    }

    if (emptyAliases.length !== 0) {
      title = validationErrors.REQUIRED_TITLE(emptyAliases.length)
      content = 'Database Alias'
    }

    return (
      <RiTooltip
        position="top"
        anchorClassName="euiToolTip__btn-disabled"
        title={title}
        content={isSubmitDisabled() ? <span>{content}</span> : null}
      >
        <RiPrimaryButton
          type="submit"
          onClick={onClick}
          disabled={isSubmitDisabled()}
          loading={loading}
          icon={isSubmitDisabled() ? InfoIcon : undefined}
          data-testid="btn-add-primary-group"
        >
          Add Primary Group
        </RiPrimaryButton>
      </RiTooltip>
    )
  }

  return (
    <AutodiscoveryPageTemplate>
      <div className="databaseContainer">
        <RiTitle size="XXL" className={styles.title} data-testid="title">
          Auto-Discover Redis Sentinel Primary Groups
        </RiTitle>

        <RiRow align="end" gap="s">
          <RiFlexItem grow>
            <RiText
              color="subdued"
              className={styles.subTitle}
              component="span"
            >
              Redis Sentinel instance found. <br />
              Here is a list of primary groups your Sentinel instance is
              managing. Select the primary group(s) you want to add:
            </RiText>
          </RiFlexItem>
          <RiFlexItem>
            <RiFormField className={styles.searchForm}>
              <RiSearchInput
                placeholder="Search..."
                onChange={onQueryChange}
                aria-label="Search"
                data-testid="search"
              />
            </RiFormField>
          </RiFlexItem>
        </RiRow>
        <br />

        <div className="itemList databaseList sentinelDatabaseList">
          <RiTable
            columns={columns}
            data={items}
            defaultSorting={[
              {
                id: 'name',
                desc: false,
              },
            ]}
            onRowClick={selectionValue.onSelectionChange}
          />
          {!items.length && <RiText color="subdued">{message}</RiText>}
          {!masters.length && (
            <RiText className={styles.notFoundMsg} color="subdued">
              {notMastersMsg}
            </RiText>
          )}
        </div>
      </div>
      <RiFlexItem>
        <RiRow
          justify="between"
          className={cx(styles.footer, 'footerAddDatabase')}
        >
          <RiSecondaryButton
            onClick={onBack}
            className="btn-cancel btn-back"
            data-testid="btn-back-to-adding"
          >
            Back to adding databases
          </RiSecondaryButton>
          <div>
            <CancelButton isPopoverOpen={isPopoverOpen} />
            <SubmitButton onClick={handleSubmit} />
          </div>
        </RiRow>
      </RiFlexItem>
    </AutodiscoveryPageTemplate>
  )
}

export default SentinelDatabases
