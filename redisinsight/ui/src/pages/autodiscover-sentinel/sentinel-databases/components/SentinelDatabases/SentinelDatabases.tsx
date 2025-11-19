import React, { useEffect, useState } from 'react'
import { useSelector } from 'react-redux'

import { sentinelSelector } from 'uiSrc/slices/instances/sentinel'
import { type ModifiedSentinelMaster } from 'uiSrc/slices/interfaces'
import { AutodiscoveryPageTemplate } from 'uiSrc/templates'

import { Row } from 'uiSrc/components/base/layout/flex'
import {
  type ColumnDef,
  type RowSelectionState,
  Table,
} from 'uiSrc/components/base/layout/table'
import { Spacer } from 'uiSrc/components/base/layout'
import {
  DatabaseContainer,
  DatabaseWrapper,
  EmptyState,
  Footer,
  Header,
} from 'uiSrc/components/auto-discover'

import { getRowId } from '../../useSentinelDatabasesConfig'
import { CancelButton, SubmitButton, NoMastersMessage } from './components'

export interface Props {
  columns: ColumnDef<ModifiedSentinelMaster>[]
  masters: ModifiedSentinelMaster[]
  selection: ModifiedSentinelMaster[]
  onSelectionChange: (state: RowSelectionState) => void
  onClose: () => void
  onBack: () => void
  onSubmit: (databases: ModifiedSentinelMaster[]) => void
}

const loadingMsg = 'loading...'
const notMastersMsg = 'Your Redis Sentinel has no primary groups available.'
const notFoundMsg = 'Not found.'

const SentinelDatabases = ({
  columns,
  onSelectionChange,
  onClose,
  onBack,
  onSubmit,
  masters,
  selection,
}: Props) => {
  const [items, setItems] = useState<ModifiedSentinelMaster[]>(masters)

  const [message, setMessage] = useState(loadingMsg)
  const [isPopoverOpen, setIsPopoverOpen] = useState(false)

  const { loading } = useSelector(sentinelSelector)

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

  useEffect(() => {
    if (masters.length) {
      setItems(masters)
    }

    if (!masters.length) {
      setMessage(notMastersMsg)
    }
  }, [masters.length])

  const onQueryChange = (term: string) => {
    const value = term?.toLowerCase()

    const itemsTemp = masters.filter(
      (item: ModifiedSentinelMaster) =>
        item.name?.toLowerCase().includes(value) ||
        (item.host?.toLowerCase() || '').includes(value) ||
        item.alias?.toLowerCase().includes(value) ||
        (item.username?.toLowerCase() || '').includes(value) ||
        item.port?.toString()?.includes(value) ||
        item.numberOfSlaves?.toString().includes(value),
    )

    if (!itemsTemp.length) {
      setMessage(notFoundMsg)
    }
    setItems(itemsTemp)
  }

  return (
    <AutodiscoveryPageTemplate>
      <DatabaseContainer justify="start">
        <Header
          title="Auto-Discover Redis Sentinel Primary Groups"
          onBack={onBack}
          onQueryChange={onQueryChange}
          subTitle={
            masters.length > 0 && (
              <Text size="m">
                Redis Sentinel instance found. Here is a list of primary groups
                your Sentinel instance is managing. <br />
                Select the primary group(s) you want to add:
              </Text>
            )
          }
        />
        <Spacer size="m" />
        <DatabaseWrapper>
          <Table
            rowSelectionMode="multiple"
            // rowSelection={rowSelection}
            onRowSelectionChange={onSelectionChange}
            getRowCanSelect={(row) => getRowId(row.original) !== ''}
            getRowId={getRowId}
            columns={columns}
            data={items}
            defaultSorting={[
              {
                id: 'name',
                desc: false,
              },
            ]}
            paginationEnabled={items.length > 10}
            stripedRows
            emptyState={() => <EmptyState message={message} />}
          />
          {!masters.length && <NoMastersMessage message={notMastersMsg} />}
        </DatabaseWrapper>
      </DatabaseContainer>
      <Footer>
        <Row justify="end">
          <Row gap="m" grow={false}>
            <CancelButton
              isPopoverOpen={isPopoverOpen}
              onClose={onClose}
              onShowPopover={showPopover}
              onClosePopover={closePopover}
            />
            <SubmitButton
              selection={selection}
              loading={loading}
              onClick={handleSubmit}
              isDisabled={isSubmitDisabled()}
            />
          </Row>
        </Row>
      </Footer>
    </AutodiscoveryPageTemplate>
  )
}

export default SentinelDatabases
