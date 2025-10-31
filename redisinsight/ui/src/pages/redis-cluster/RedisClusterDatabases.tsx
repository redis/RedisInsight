import React, { useEffect, useState } from 'react'
import cx from 'classnames'
import { map } from 'lodash'
import { useSelector } from 'react-redux'
import { SearchInput } from 'uiSrc/components/base/inputs'
import { Maybe } from 'uiSrc/utils'
import { RiPopover, RiTooltip } from 'uiSrc/components/base'
import { InstanceRedisCluster } from 'uiSrc/slices/interfaces'
import { clusterSelector } from 'uiSrc/slices/instances/cluster'
import validationErrors from 'uiSrc/constants/validationErrors'
import { AutodiscoveryPageTemplate } from 'uiSrc/templates'

import { FlexItem, Row } from 'uiSrc/components/base/layout/flex'
import { InfoIcon } from 'uiSrc/components/base/icons'
import {
  DestructiveButton,
  PrimaryButton,
  SecondaryButton,
} from 'uiSrc/components/base/forms/buttons'
import { FormField } from 'uiSrc/components/base/forms/FormField'
import { Title } from 'uiSrc/components/base/text/Title'
import { Text } from 'uiSrc/components/base/text'
import { Table, ColumnDefinition } from 'uiSrc/components/base/layout/table'
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
        <SecondaryButton
          onClick={showPopover}
          className="btn-cancel"
          data-testid="btn-back"
        >
          Cancel
        </SecondaryButton>
      }
    >
      <Text size="m">
        Your changes have not been saved.&#10;&#13; Do you want to proceed to
        the list of databases?
      </Text>
      <br />
      <div>
        <DestructiveButton
          size="s"
          onClick={onClose}
          data-testid="btn-back-proceed"
        >
          Proceed
        </DestructiveButton>
      </div>
    </RiPopover>
  )

  return (
    <AutodiscoveryPageTemplate>
      <div className="databaseContainer">
        <Title size="M" className={styles.title} data-testid="title">
          Auto-Discover Redis Enterprise Databases
        </Title>
        <Row align="end" responsive gap="s">
          <FlexItem grow>
            {!!items.length && (
              <Text color="subdued" className={styles.subTitle}>
                These are the {items.length > 1 ? 'databases ' : 'database '}
                in your Redis Enterprise Cluster. Select the
                {items.length > 1 ? ' databases ' : ' database '} that you want
                to add.
              </Text>
            )}
          </FlexItem>
          <FlexItem>
            <FormField className={styles.searchForm}>
              <SearchInput
                placeholder="Search..."
                onChange={onQueryChange}
                aria-label="Search"
                data-testid="search"
              />
            </FormField>
          </FlexItem>
        </Row>
        <br />
        <div
          className={cx(
            'itemList databaseList clusterDatabaseList',
            styles.databaseListWrapper,
          )}
        >
          <Table
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
            <Text className={styles.noDatabases}>{message}</Text>
          )}
        </div>
      </div>
      <FlexItem>
        <Row
          justify="between"
          className={cx(
            styles.footer,
            'footerAddDatabase',
            styles.footerClusterDatabases,
          )}
        >
          <SecondaryButton
            onClick={onBack}
            className="btn-cancel btn-back"
            data-testid="btn-back-to-adding"
          >
            Back to adding databases
          </SecondaryButton>
          <FlexItem direction="row" className={styles.footerButtonsGroup}>
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
              <PrimaryButton
                size="m"
                disabled={isSubmitDisabled()}
                onClick={handleSubmit}
                loading={loading}
                color="secondary"
                icon={isSubmitDisabled() ? InfoIcon : undefined}
                data-testid="btn-add-databases"
              >
                Add selected Databases
              </PrimaryButton>
            </RiTooltip>
          </FlexItem>
        </Row>
      </FlexItem>
    </AutodiscoveryPageTemplate>
  )
}

export default RedisClusterDatabases
