import React, { useEffect, useState } from 'react'
import { useSelector } from 'react-redux'

import { sentinelSelector } from 'uiSrc/slices/instances/sentinel'
import { ModifiedSentinelMaster } from 'uiSrc/slices/interfaces'
import validationErrors from 'uiSrc/constants/validationErrors'
import { AutodiscoveryPageTemplate } from 'uiSrc/templates'

import { Col, FlexItem, Row } from 'uiSrc/components/base/layout/flex'
import {
  DestructiveButton,
  PrimaryButton,
  SecondaryButton,
} from 'uiSrc/components/base/forms/buttons'
import { RiIcon } from 'uiSrc/components/base/icons'
import { Text } from 'uiSrc/components/base/text'
import { RiPopover, RiTooltip } from 'uiSrc/components/base'
import {
  ColumnDef,
  RowSelectionState,
  Table,
} from 'uiSrc/components/base/layout/table'
import {
  DatabaseContainer,
  DatabaseWrapper,
  Footer,
} from 'uiSrc/components/auto-discover'

import { Spacer } from 'uiSrc/components/base/layout'
import { Header } from 'uiSrc/components/auto-discover/Header'
import { getRowId } from '../../useSentinelDatabasesConfig'

import styles from '../../../styles.module.scss'

export interface Props {
  columns: ColumnDef<ModifiedSentinelMaster>[]
  masters: ModifiedSentinelMaster[]
  selection: ModifiedSentinelMaster[]
  onSelectionChange: (state: RowSelectionState) => void
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
  onSelectionChange,
  onClose,
  onBack,
  onSubmit,
  masters,
  selection,
}: Props) => {
  const [items, setItems] = useState<ModifiedSentinelMaster[]>(masters)
  const [rowSelection, setRowSelection] = useState<
    Record<NonNullable<ModifiedSentinelMaster['id']>, boolean>
  >({})

  useEffect(() => {
    setRowSelection(
      selection.reduce(
        (acc, item) => {
          if (item.id) {
            acc[item.id as string] = true
          }
          return acc
        },
        {} as Record<NonNullable<ModifiedSentinelMaster['id']>, boolean>,
      ),
    )
  }, [selection])

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
          data-testid="btn-cancel"
        >
          Cancel
        </SecondaryButton>
      }
    >
      <Text size="S">
        Your changes have not been saved.&#10;&#13; Do you want to proceed to
        the list of databases?
      </Text>
      <br />
      <div>
        <DestructiveButton
          size="s"
          onClick={onClose}
          data-testid="btn-cancel-proceed"
        >
          Proceed
        </DestructiveButton>
      </div>
    </RiPopover>
  )

  const SubmitButton = ({ onClick }: { onClick: () => void }) => {
    let title: string | null = null
    let content: string | null = null
    const emptyAliases = selection.filter(({ alias }) => !alias)

    if (selection.length < 1) {
      title = validationErrors.SELECT_AT_LEAST_ONE('primary group')
      content = validationErrors.NO_PRIMARY_GROUPS_SENTINEL
    }

    if (emptyAliases.length !== 0) {
      title = validationErrors.REQUIRED_TITLE(emptyAliases.length)
      content = 'Database Alias'
    }
    const TooltipIcon = () => (
      <RiTooltip position="top" title={title} content={<span>{content}</span>}>
        <RiIcon type="InfoIcon" />
      </RiTooltip>
    )

    return (
      <PrimaryButton
        type="submit"
        onClick={onClick}
        disabled={isSubmitDisabled()}
        loading={loading}
        icon={isSubmitDisabled() ? TooltipIcon : undefined}
        data-testid="btn-add-primary-group"
      >
        Add Primary Group
      </PrimaryButton>
    )
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
              <>
                Redis Sentinel instance found. <br />
                Here is a list of primary groups your Sentinel instance is
                managing. Select the primary group(s) you want to add:
              </>
            )
          }
        />
        <Spacer size="m" />
        <DatabaseWrapper>
          <Table
            rowSelectionMode="multiple"
            rowSelection={rowSelection}
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
            stripedRows
            emptyState={() => (
              <Col centered full>
                <FlexItem padding={13}>
                  <Text size="L">{message}</Text>
                </FlexItem>
              </Col>
            )}
          />
          {!masters.length && (
            <Col centered full>
              <Text size="L">{notMastersMsg}</Text>
            </Col>
          )}
        </DatabaseWrapper>
      </DatabaseContainer>
      <Footer>
        <Row justify="end">
          <Row gap="m" grow={false}>
            <CancelButton isPopoverOpen={isPopoverOpen} />
            <SubmitButton onClick={handleSubmit} />
          </Row>
        </Row>
      </Footer>
    </AutodiscoveryPageTemplate>
  )
}

export default SentinelDatabases
