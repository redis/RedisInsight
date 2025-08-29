import React, { useState, useEffect } from 'react'
import cx from 'classnames'
import { useSelector } from 'react-redux'

import { sentinelSelector } from 'uiSrc/slices/instances/sentinel'
import { ModifiedSentinelMaster } from 'uiSrc/slices/interfaces'
import validationErrors from 'uiSrc/constants/validationErrors'
import { AutodiscoveryPageTemplate } from 'uiSrc/templates'

import { FlexItem, Row } from 'uiSrc/components/base/layout/flex'
import {
  DestructiveButton,
  PrimaryButton,
  SecondaryButton,
} from 'uiSrc/components/base/forms/buttons'
import { InfoIcon } from 'uiSrc/components/base/icons'
import { SearchInput } from 'uiSrc/components/base/inputs'
import { Text } from 'uiSrc/components/base/text'
import { RiPopover, RiTooltip } from 'uiSrc/components/base'
import { Table, ColumnDefinition } from 'uiSrc/components/base/layout/table'
import {
  DatabaseWrapper,
  Footer,
  PageSubTitle,
  PageTitle,
  SearchContainer,
  SearchForm,
} from 'uiSrc/components/auto-discover'

import styles from '../../../styles.module.scss'

export interface Props {
  columns: ColumnDefinition<ModifiedSentinelMaster>[]
  masters: ModifiedSentinelMaster[]
  selection: ModifiedSentinelMaster[]
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
  }, [masters])

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
        anchorClassName="euiToolTip__btn-disabled"
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
      <div className="databaseContainer">
        <PageTitle data-testid="title">
          Auto-Discover Redis Sentinel Primary Groups
        </PageTitle>

        <Row justify="between" align="center">
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
        <br />

        <DatabaseWrapper>
          <Table
            columns={columns}
            data={items}
            defaultSorting={[
              {
                id: 'name',
                desc: false,
              },
            ]}
          />
          {!items.length && (
            <Text size="S" color="subdued">
              {message}
            </Text>
          )}
          {!masters.length && (
            <Text size="S" className={styles.notFoundMsg} color="subdued">
              {notMastersMsg}
            </Text>
          )}
        </DatabaseWrapper>
      </div>
      <Footer padding={4} grow>
        <Row
          justify="between"
          className={cx(styles.footer, 'footerAddDatabase')}
        >
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
