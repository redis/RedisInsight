import React, { useEffect, useState } from 'react'
import { map, pick } from 'lodash'

import { InstanceRedisCloud } from 'uiSrc/slices/interfaces'
import validationErrors from 'uiSrc/constants/validationErrors'
import { AutodiscoveryPageTemplate } from 'uiSrc/templates'

import { Col, FlexItem, Row } from 'uiSrc/components/base/layout/flex'
import { InfoIcon } from 'uiSrc/components/base/icons'
import {
  DestructiveButton,
  PrimaryButton,
  SecondaryButton,
} from 'uiSrc/components/base/forms/buttons'
import { RiPopover, RiTooltip } from 'uiSrc/components/base'
import { Text } from 'uiSrc/components/base/text'
import {
  ColumnDef,
  RowSelectionState,
  Table,
} from 'uiSrc/components/base/layout/table'
import styles from '../styles.module.scss'
import { Spacer } from 'uiSrc/components/base/layout'
import {
  DatabaseContainer,
  DatabaseWrapper,
  Footer,
  Header,
} from 'uiSrc/components/auto-discover'

export interface Props {
  columns: ColumnDef<InstanceRedisCloud>[]
  instances: InstanceRedisCloud[]
  selection: InstanceRedisCloud[]
  loading: boolean
  onSelectionChange: (currentSelected: RowSelectionState) => void
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
  'Your Redis Enterprise Cloud has no databases available'

const RedisCloudDatabasesPage = ({
  columns,
  selection,
  instances,
  loading,
  onSelectionChange,
  onClose,
  onBack,
  onSubmit,
}: Props) => {
  const [items, setItems] = useState<InstanceRedisCloud[]>([])
  const [message, setMessage] = useState(loadingMsg)
  const [isPopoverOpen, setIsPopoverOpen] = useState(false)
  const [rowSelection, setRowSelection] = useState<
    Record<NonNullable<InstanceRedisCloud['id']>, boolean>
  >({})

  useEffect(() => {
    if (!selection) return
    setRowSelection(
      selection.reduce(
        (acc, item) => {
          if (item.id) {
            acc[item.id] = true
          }
          return acc
        },
        {} as Record<NonNullable<InstanceRedisCloud['id']>, boolean>,
      ),
    )
  }, [selection])

  // const history = useHistory()

  // const { loading, data: instances } = useSelector(cloudSelector)

  useEffect(() => {
    if (instances !== null) {
      setItems(instances)
    }

    if (instances?.length === 0 && !loading) {
      setMessage(noResultsMessage)
    }
  }, [instances, loading])

  // useEffect(() => {
  //   if (instances === null) {
  //     history.push(Pages.home)
  //   }
  // }, [])

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
        <SecondaryButton
          onClick={showPopover}
          className="btn-cancel"
          data-testid="btn-cancel"
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
          data-testid="btn-cancel-proceed"
        >
          Proceed
        </DestructiveButton>
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
      <PrimaryButton
        size="m"
        disabled={isDisabled}
        onClick={handleSubmit}
        loading={loading}
        icon={isDisabled ? InfoIcon : undefined}
        data-testid="btn-add-databases"
      >
        Add selected Databases
      </PrimaryButton>
    </RiTooltip>
  )

  return (
    <AutodiscoveryPageTemplate>
      <DatabaseContainer justify="start">
        <Header
          title="Redis Cloud Databases"
          onBack={onBack}
          onQueryChange={onQueryChange}
          subTitle={`
            These are ${items.length > 1 ? 'databases ' : 'database '}
            in your Redis Cloud. Select the
            ${items.length > 1 ? ' databases ' : ' database '} that you want to
            add.`}
        />
        <Spacer size="m" />
        <DatabaseWrapper>
          <Table
            rowSelectionMode="multiple"
            // getRowCanSelect={canSelectRow}
            rowSelection={rowSelection}
            onRowSelectionChange={onSelectionChange}
            getRowId={(row) => `${row.id}`}
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
            pageSizes={[5, 10, 25, 50, 100]}
            emptyState={() => (
              <Col centered full>
                <FlexItem padding={13}>
                  <Text size="L">{message}</Text>
                </FlexItem>
              </Col>
            )}
          />
          {!items.length && (
            <Col centered full>
              <Text size="L">{message}</Text>
            </Col>
          )}
        </DatabaseWrapper>
      </DatabaseContainer>
      <Footer>
        <Row justify="end">
          <Row gap="m" grow={false}>
            <CancelButton isPopoverOpen={isPopoverOpen} />
            <SubmitButton isDisabled={selection.length < 1} />
          </Row>
        </Row>
      </Footer>
    </AutodiscoveryPageTemplate>
  )
}

export default RedisCloudDatabasesPage
