import React, { useState, useEffect } from 'react'
import { map, pick } from 'lodash'
import { useSelector } from 'react-redux'
import { useHistory } from 'react-router-dom'

import { RiFlexItem, RiRow, RiTable, ColumnDefinition } from 'uiBase/layout'
import { InfoIcon } from 'uiBase/icons'
import {
  RiDestructiveButton,
  RiPrimaryButton,
  RiSecondaryButton,
  RiFormField,
} from 'uiBase/forms'
import { RiPopover, RiTooltip } from 'uiBase/index'
import { RiTitle, RiText } from 'uiBase/text'
import { RiSearchInput } from 'uiBase/inputs'
import { Pages } from 'uiSrc/constants'
import { AutodiscoveryPageTemplate } from 'uiSrc/templates'
import validationErrors from 'uiSrc/constants/validationErrors'
import { InstanceRedisCloud } from 'uiSrc/slices/interfaces'
import { cloudSelector } from 'uiSrc/slices/instances/cloud'
import styles from '../styles.module.scss'

export interface Props {
  columns: ColumnDefinition<InstanceRedisCloud>[]
  onClose: () => void
  onBack: () => void
  onSubmit: (
    databases: Pick<
      InstanceRedisCloud,
      'subscriptionId' | 'subscriptionType' | 'databaseId' | 'free'
    >[],
  ) => void
}

interface IPopoverProps {
  isPopoverOpen: boolean
}

const loadingMsg = 'loading...'
const notFoundMsg = 'Not found'
const noResultsMessage =
  'Your Redis Enterprise Сloud has no databases available'

const RedisCloudDatabasesPage = ({
  columns,
  onClose,
  onBack,
  onSubmit,
}: Props) => {
  const [items, setItems] = useState<InstanceRedisCloud[]>([])
  const [message, setMessage] = useState(loadingMsg)
  const [isPopoverOpen, setIsPopoverOpen] = useState(false)

  const [selection, setSelection] = useState<InstanceRedisCloud[]>([])

  const history = useHistory()

  const { loading, data: instances } = useSelector(cloudSelector)

  useEffect(() => {
    if (instances !== null) {
      setItems(instances)
    }
  }, [instances])

  useEffect(() => {
    if (instances === null) {
      history.push(Pages.home)
    }
  }, [])

  useEffect(() => {
    if (instances?.length === 0) {
      setMessage(noResultsMessage)
    }
  }, [instances])

  const handleSubmit = () => {
    onSubmit(
      map(selection, (i) =>
        pick(i, 'subscriptionId', 'subscriptionType', 'databaseId', 'free'),
      ),
    )
  }

  const showPopover = () => {
    setIsPopoverOpen(true)
  }

  const closePopover = () => {
    setIsPopoverOpen(false)
  }

  const selectionValue = {
    onSelectionChange: (selected: InstanceRedisCloud) =>
      setSelection((previous) => {
        const isSelected = previous.some(
          (item) => item.databaseId === selected.databaseId,
        )
        if (isSelected) {
          return previous.filter(
            (item) => item.databaseId !== selected.databaseId,
          )
        }
        return [...previous, selected]
      }),
  }

  const onQueryChange = (term: string) => {
    const value = term?.toLowerCase()

    const itemsTemp =
      instances?.filter(
        (item: InstanceRedisCloud) =>
          item.name?.toLowerCase().indexOf(value) !== -1 ||
          item.publicEndpoint?.toLowerCase().indexOf(value) !== -1 ||
          item.subscriptionId?.toString()?.indexOf(value) !== -1 ||
          item.subscriptionName?.toLowerCase().indexOf(value) !== -1 ||
          item.databaseId?.toString()?.indexOf(value) !== -1,
      ) || []

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

  const SubmitButton = ({ isDisabled }: { isDisabled: boolean }) => (
    <RiTooltip
      position="top"
      anchorClassName="euiToolTip__btn-disabled"
      title={
        isDisabled ? validationErrors.SELECT_AT_LEAST_ONE('database') : null
      }
      content={
        isDisabled ? <span>{validationErrors.NO_DBS_SELECTED}</span> : null
      }
    >
      <RiPrimaryButton
        size="m"
        disabled={isDisabled}
        onClick={handleSubmit}
        loading={loading}
        icon={isDisabled ? InfoIcon : undefined}
        data-testid="btn-add-databases"
      >
        Add selected Databases
      </RiPrimaryButton>
    </RiTooltip>
  )

  return (
    <AutodiscoveryPageTemplate>
      <div className="databaseContainer">
        <RiTitle size="XXL" className={styles.title} data-testid="title">
          Redis Cloud Databases
        </RiTitle>

        <RiRow align="end" gap="s">
          <RiFlexItem grow>
            <RiText
              color="subdued"
              className={styles.subTitle}
              component="span"
            >
              These are {items.length > 1 ? 'databases ' : 'database '}
              in your Redis Cloud. Select the
              {items.length > 1 ? ' databases ' : ' database '} that you want to
              add.
            </RiText>
          </RiFlexItem>
        </RiRow>
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
        <br />

        <div className="itemList databaseList cloudDatabaseList">
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
          {!items.length && <RiText>{message}</RiText>}
        </div>
      </div>
      <RiFlexItem padding={4}>
        <RiRow justify="between" gap="m">
          <RiSecondaryButton
            onClick={onBack}
            className="btn-cancel btn-back"
            data-testid="btn-back-to-adding"
          >
            Back to adding databases
          </RiSecondaryButton>
          <div>
            <CancelButton isPopoverOpen={isPopoverOpen} />
            <SubmitButton isDisabled={selection.length < 1} />
          </div>
        </RiRow>
      </RiFlexItem>
    </AutodiscoveryPageTemplate>
  )
}

export default RedisCloudDatabasesPage
