import React, { useEffect, useState } from 'react'
import { map } from 'lodash'
import { Maybe } from 'uiSrc/utils'
import { RiPopover, RiTooltip } from 'uiSrc/components/base'
import { InstanceRedisCluster } from 'uiSrc/slices/interfaces'
import validationErrors from 'uiSrc/constants/validationErrors'
import { AutodiscoveryPageTemplate } from 'uiSrc/templates'

import { Col, FlexItem, Row } from 'uiSrc/components/base/layout/flex'
import { InfoIcon } from 'uiSrc/components/base/icons'
import {
  DestructiveButton,
  PrimaryButton,
  SecondaryButton,
} from 'uiSrc/components/base/forms/buttons'
import { Text } from 'uiSrc/components/base/text'
import { ColumnDef, Table } from 'uiSrc/components/base/layout/table'
import styles from './styles.module.scss'
import {
  DatabaseContainer,
  DatabaseWrapper,
  Footer,
  Header,
} from 'uiSrc/components/auto-discover'
import { Spacer } from 'uiSrc/components/base/layout'

interface Props {
  columns: ColumnDef<InstanceRedisCluster>[]
  onClose: () => void
  onBack: () => void
  onSubmit: (uids: Maybe<number>[]) => void
  instances: InstanceRedisCluster[]
  loading: boolean
}

interface IPopoverProps {
  isPopoverOpen: boolean
}

const loadingMsg = 'loading...'
const notFoundMsg = 'Not found'
const noResultsMessage =
  'Your Redis Enterprise Cluster has no databases available.'

function getSubtitle(items: InstanceRedisCluster[]) {
  if (!items.length) {
    return null
  }

  return `
          These are the ${items.length > 1 ? 'databases ' : 'database '}
          in your Redis Enterprise Cluster. Select the
          ${items.length > 1 ? ' databases ' : ' database '} that you want
          to add.
          `
}

const RedisClusterDatabases = ({
  columns,
  onClose,
  onBack,
  onSubmit,
  instances,
  loading,
}: Props) => {
  const [items, setItems] = useState<InstanceRedisCluster[]>([])
  const [message, setMessage] = useState(loadingMsg)
  const [isPopoverOpen, setIsPopoverOpen] = useState(false)

  const [selection, setSelection] = useState<InstanceRedisCluster[]>([])

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
      <DatabaseContainer className="databaseContainer">
        <Header
          title="Auto-Discover Redis Enterprise Databases"
          onBack={onBack}
          onQueryChange={onQueryChange}
          subTitle={getSubtitle(items)}
        />
        <Spacer size="m" />
        <DatabaseWrapper>
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
            paginationEnabled={items.length > 10}
            stripedRows
            pageSizes={[5, 10, 25, 50, 100]}
            emptyState={() => (
              <Col centered full>
                <FlexItem padding={13}>
                  <Text size="L">{message}</Text>
                </FlexItem>
              </Col>
            )}
          />
        </DatabaseWrapper>
      </DatabaseContainer>
      <Footer>
        <Row justify="end" gap="m">
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
        </Row>
      </Footer>
    </AutodiscoveryPageTemplate>
  )
}

export default RedisClusterDatabases
