import React, { useEffect, useState } from 'react'
import type { Maybe } from 'uiSrc/utils'
import { RiTooltip } from 'uiSrc/components/base'
import type { InstanceRedisCluster } from 'uiSrc/slices/interfaces'
import validationErrors from 'uiSrc/constants/validationErrors'
import { AutodiscoveryPageTemplate } from 'uiSrc/templates'
import { useTranslation } from 'uiSrc/i18n'

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

const hasSelection = (selection: RowSelectionState) =>
  Object.values(selection).some(Boolean)
const RedisClusterDatabases = ({
  columns,
  onClose,
  onBack,
  onSubmit,
  instances,
  loading,
}: Props) => {
  const { t } = useTranslation()
  const [items, setItems] = useState<InstanceRedisCluster[]>([])
  const [message, setMessage] = useState(t('cluster.loadingMsg'))
  const [isPopoverOpen, setIsPopoverOpen] = useState(false)

  const [selection, setSelection] = useState<RowSelectionState>({})

  useEffect(() => {
    if (instances !== null) {
      setItems(instances)
    }
  }, [instances])

  useEffect(() => {
    if (instances?.length === 0) {
      setMessage(t('cluster.databases.noResults'))
    }
  }, [instances])

  const handleSubmit = () => {
    // Map rowSelection state to the selected items list using uid as row id
    const selected = Object.entries(selection)
      .filter(([_uid, isSelected]) => Boolean(isSelected))
      .map(([uid]) => Number(uid))
    onSubmit(selected)
  }

  const showPopover = () => {
    setIsPopoverOpen(true)
  }

  const closePopover = () => {
    setIsPopoverOpen(false)
  }

  const isSubmitDisabled = () => !hasSelection(selection)

  const onSelectionChange = (selection: RowSelectionState) => {
    setSelection(selection)
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
      setMessage(t('cluster.notFound'))
    }
    setItems(itemsTemp)
  }

  return (
    <AutodiscoveryPageTemplate>
      <DatabaseContainer>
        <Header
          title={t('cluster.databases.title')}
          onBack={onBack}
          onQueryChange={onQueryChange}
          subTitle={
            items.length
              ? t('cluster.databases.subtitle', { count: items.length })
              : null
          }
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
              {t('cluster.databases.addButton')}
            </PrimaryButton>
          </RiTooltip>
        </Row>
      </Footer>
    </AutodiscoveryPageTemplate>
  )
}

export default RedisClusterDatabases
