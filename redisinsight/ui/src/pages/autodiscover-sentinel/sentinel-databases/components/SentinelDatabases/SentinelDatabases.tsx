import React, { useState, useEffect } from 'react'
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
import { InfoIcon } from 'uiSrc/components/base/icons'
import { SearchInput } from 'uiSrc/components/base/inputs'
import { Text } from 'uiSrc/components/base/text'
import { RiPopover, RiTooltip } from 'uiSrc/components/base'
import {
  Table,
  ColumnDef,
  RowSelectionState,
} from 'uiSrc/components/base/layout/table'
import {
  DatabaseWrapper,
  Footer,
  PageSubTitle,
  PageTitle,
  SearchContainer,
  SearchForm,
} from 'uiSrc/components/auto-discover'

import styles from '../../../styles.module.scss'
import { getRowId } from 'uiSrc/pages/autodiscover-sentinel/sentinel-databases/useSentinelDatabasesConfig'
import { Spacer } from 'uiSrc/components/base/layout'

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
          color="secondary"
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
        title={title}
        content={isSubmitDisabled() ? <span>{content}</span> : null}
      >
        <PrimaryButton
          type="submit"
          onClick={onClick}
          disabled={isSubmitDisabled()}
          loading={loading}
          icon={isSubmitDisabled() ? InfoIcon : undefined}
          data-testid="btn-add-primary-group"
        >
          Add Primary Group
        </PrimaryButton>
      </RiTooltip>
    )
  }

  return (
    <AutodiscoveryPageTemplate>
      <Col className="databaseContainer" justify="start">
        <PageTitle data-testid="title">
          Auto-Discover Redis Sentinel Primary Groups
        </PageTitle>

        <Row justify="between" align="center" grow={false}>
          <FlexItem grow>
            <PageSubTitle>
              Redis Sentinel instance found. <br />
              Here is a list of primary groups your Sentinel instance is
              managing. Select the primary group(s) you want to add:
            </PageSubTitle>
          </FlexItem>
          <SearchContainer>
            <SearchForm>
              <SearchInput
                placeholder="Search..."
                onChange={onQueryChange}
                aria-label="Search"
                data-testid="search"
              />
            </SearchForm>
          </SearchContainer>
        </Row>
        <Spacer size="l" />
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
          />
          {!items.length && message !== notMastersMsg && (
            <>
              <Spacer size="m" />
              <Text size="S">{message}</Text>
            </>
          )}
          {!masters.length && (
            <Col centered full>
              <Text size="L">{notMastersMsg}</Text>
            </Col>
          )}
        </DatabaseWrapper>
      </Col>
      <Footer>
        <Row justify="between">
          <SecondaryButton
            onClick={onBack}
            className="btn-cancel btn-back"
            data-testid="btn-back-to-adding"
          >
            Back to adding databases
          </SecondaryButton>
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
