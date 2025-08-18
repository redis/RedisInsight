import React, { useEffect, useState } from 'react'
import cx from 'classnames'
import { map } from 'lodash'
import { useSelector } from 'react-redux'
import { RiSearchInput } from 'uiBase/inputs'
import { RiPopover, RiTooltip } from 'uiBase/display'
import { RiFlexItem, RiRow, RiTable, ColumnDefinition } from 'uiBase/layout'
import { InfoIcon } from 'uiBase/icons'
import {
  RiDestructiveButton,
  RiPrimaryButton,
  RiSecondaryButton,
  RiFormField,
} from 'uiBase/forms'
import { RiTitle, RiText } from 'uiBase/text'
import { Maybe } from 'uiSrc/utils'
import { InstanceRedisCluster } from 'uiSrc/slices/interfaces'
import { clusterSelector } from 'uiSrc/slices/instances/cluster'
import validationErrors from 'uiSrc/constants/validationErrors'
import { AutodiscoveryPageTemplate } from 'uiSrc/templates'

import styles from './styles.module.scss'

interface Props {
  columns: ColumnDefinition<InstanceRedisCluster>[]
  onClose: () => void
  onBack: () => void
  onSubmit: (uids: Maybe<number>[]) => void
}

interface IPopoverProps {
  isPopoverOpen: boolean
}

const loadingMsg = 'loading...'
const notFoundMsg = 'Not found'
const noResultsMessage =
  'Your Redis Enterprise Cluster has no databases available.'

const RedisClusterDatabases = ({
  columns,
  onClose,
  onBack,
  onSubmit,
}: Props) => {
  const [items, setItems] = useState<InstanceRedisCluster[]>([])
  const [message, setMessage] = useState(loadingMsg)
  const [isPopoverOpen, setIsPopoverOpen] = useState(false)

  const [selection, setSelection] = useState<InstanceRedisCluster[]>([])

  const { data: instances, loading } = useSelector(clusterSelector)

  useEffect(() => {
    if (instances !== null) {
      setItems(instances)
    }
  }, [instances])

  useEffect(() => {
    if (instances?.length === 0) {
      setMessage(noResultsMessage)
    }
  }, [instances])

  const handleSubmit = () => {
    onSubmit(map(selection, 'uid'))
  }

  const showPopover = () => {
    setIsPopoverOpen(true)
  }

  const closePopover = () => {
    setIsPopoverOpen(false)
  }

  const isSubmitDisabled = () => selection.length < 1

  const selectionValue = {
    onSelectionChange: (selected: InstanceRedisCluster) =>
      setSelection((previous) => {
        const isSelected = previous.some((item) => item.uid === selected.uid)
        if (isSelected) {
          return previous.filter((item) => item.uid !== selected.uid)
        }
        return [...previous, selected]
      }),
  }

  const onQueryChange = (term: string) => {
    const value = term?.toLowerCase()
    const itemsTemp =
      instances?.filter(
        (item: InstanceRedisCluster) =>
          item.name?.toLowerCase().indexOf(value) !== -1 ||
          item.dnsName?.toLowerCase().indexOf(value) !== -1 ||
          item.port?.toString().toLowerCase().indexOf(value) !== -1,
      ) ?? []

    if (!itemsTemp?.length) {
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
          data-testid="btn-back"
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
          data-testid="btn-back-proceed"
        >
          Proceed
        </RiDestructiveButton>
      </div>
    </RiPopover>
  )

  return (
    <AutodiscoveryPageTemplate>
      <div className="databaseContainer">
        <RiTitle size="M" className={styles.title} data-testid="title">
          Auto-Discover Redis Enterprise Databases
        </RiTitle>
        <RiRow align="end" responsive gap="s">
          <RiFlexItem grow>
            {!!items.length && (
              <RiText color="subdued" className={styles.subTitle}>
                These are the {items.length > 1 ? 'databases ' : 'database '}
                in your Redis Enterprise Cluster. Select the
                {items.length > 1 ? ' databases ' : ' database '} that you want
                to add.
              </RiText>
            )}
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
        <div
          className={cx(
            'itemList databaseList clusterDatabaseList',
            styles.databaseListWrapper,
          )}
        >
          <RiTable
            columns={columns}
            data={items}
            onRowClick={selectionValue.onSelectionChange}
            defaultSorting={[
              {
                id: 'name',
                desc: false,
              },
            ]}
          />
          {!items.length && (
            <RiText className={styles.noDatabases}>{message}</RiText>
          )}
        </div>
      </div>
      <RiFlexItem>
        <RiRow
          justify="between"
          className={cx(
            styles.footer,
            'footerAddDatabase',
            styles.footerClusterDatabases,
          )}
        >
          <RiSecondaryButton
            onClick={onBack}
            className="btn-cancel btn-back"
            data-testid="btn-back-to-adding"
          >
            Back to adding databases
          </RiSecondaryButton>
          <RiFlexItem direction="row" className={styles.footerButtonsGroup}>
            <CancelButton isPopoverOpen={isPopoverOpen} />
            <RiTooltip
              position="top"
              anchorClassName="euiToolTip__btn-disabled"
              title={
                isSubmitDisabled()
                  ? validationErrors.SELECT_AT_LEAST_ONE('database')
                  : null
              }
              content={
                isSubmitDisabled() ? (
                  <span>{validationErrors.NO_DBS_SELECTED}</span>
                ) : null
              }
            >
              <RiPrimaryButton
                size="m"
                disabled={isSubmitDisabled()}
                onClick={handleSubmit}
                loading={loading}
                color="secondary"
                icon={isSubmitDisabled() ? InfoIcon : undefined}
                data-testid="btn-add-databases"
              >
                Add selected Databases
              </RiPrimaryButton>
            </RiTooltip>
          </RiFlexItem>
        </RiRow>
      </RiFlexItem>
    </AutodiscoveryPageTemplate>
  )
}

export default RedisClusterDatabases
