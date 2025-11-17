import React, { useEffect, useState } from 'react'
import { map } from 'lodash'
import type { Maybe } from 'uiSrc/utils'
import { RiTooltip } from 'uiSrc/components/base'
import type { InstanceRedisCluster } from 'uiSrc/slices/interfaces'
import validationErrors from 'uiSrc/constants/validationErrors'
import { AutodiscoveryPageTemplate } from 'uiSrc/templates'

import { Row } from 'uiSrc/components/base/layout/flex'
import { InfoIcon } from 'uiSrc/components/base/icons'
import { PrimaryButton } from 'uiSrc/components/base/forms/buttons'
import {
  type ColumnDef,
  type RowSelectionState,
  Table,
} from 'uiSrc/components/base/layout/table'
import {
  DatabaseContainer,
  DatabaseWrapper,
  EmptyState,
  Footer,
  Header,
} from 'uiSrc/components/auto-discover'
import { Spacer } from 'uiSrc/components/base/layout'
import { CancelButton } from './components'

interface Props {
  columns: ColumnDef<InstanceRedisCluster>[]
  onClose: () => void
  onBack: () => void
  onSubmit: (uids: Maybe<number>[]) => void
  instances: InstanceRedisCluster[]
  loading: boolean
}

const loadingMsg = 'loading...'
const notFoundMsg = 'Not found'
const noResultsMessage =
  'Your Redis Enterprise Cluster has no databases available.'

function getSubtitle(items: InstanceRedisCluster[]) {
  if (!items.length) {
    return null
  }

  return `These are the ${items.length > 1 ? 'databases ' : 'database '}
in your Redis Enterprise Cluster. Select the
${items.length > 1 ? ' databases ' : ' database '} that you want
to add.`
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

  const onSelectionChange = (selection: RowSelectionState) => {
    // Map rowSelection state to the selected items list using uid as row id
    const selectedItems = items.filter((i) => selection[`${i.uid}`])
    setSelection(selectedItems)
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

  return (
    <AutodiscoveryPageTemplate>
      <DatabaseContainer>
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
            rowSelectionMode="multiple"
            getRowId={(row) => `${row.uid}`}
            onRowSelectionChange={onSelectionChange}
            defaultSorting={[{ id: 'name', desc: false }]}
            paginationEnabled={items.length > 10}
            stripedRows
            emptyState={() => <EmptyState message={message} />}
          />
        </DatabaseWrapper>
      </DatabaseContainer>
      <Footer>
        <Row justify="end" gap="m">
          <CancelButton
            isPopoverOpen={isPopoverOpen}
            onShowPopover={showPopover}
            onClosePopover={closePopover}
            onProceed={onClose}
          />
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
