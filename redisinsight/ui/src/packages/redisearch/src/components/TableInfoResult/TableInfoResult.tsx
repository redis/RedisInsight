/* eslint-disable react/prop-types */
import React, { useEffect, useState } from 'react'
import cx from 'classnames'
import { toUpper, flatten, isArray, isEmpty, map, uniq } from 'lodash'
import { Table, ColumnDefinition } from 'uiSrc/components/base/layout/table'

import { RiIcon } from 'uiSrc/components/base/icons/RiIcon'
import { ColorText, Text } from '../../../../../components/base/text'
import { LoadingContent, Spacer } from '../../../../../components/base/layout'
import GroupBadge from '../GroupBadge'
import { InfoAttributesBoolean } from '../../constants'
import { FlexGroup } from 'uiSrc/components/base/layout/flex'

export interface Props {
  query: string
  result: any
}

const noResultsMessage = 'No results found.'
const noOptionsMessage = 'No options found'

const TableInfoResult = React.memo((props: Props) => {
  const { result: resultProp, query } = props

  const [result, setResult] = useState(resultProp)
  const [items, setItems] = useState([])

  useEffect(() => {
    setResult(resultProp)

    const items = resultProp?.attributes || resultProp?.fields
    if (!items?.length) {
      return
    }

    setItems(items)
  }, [resultProp, query])

  const isBooleanColumn = (title = '') =>
    InfoAttributesBoolean.indexOf(title) !== -1

  const uniqColumns =
    uniq(flatten(map(items, (item) => Object.keys(item)))) ?? []

  const columns: ColumnDefinition<any>[] = uniqColumns.map(
    (title: string = ' ') => ({
      header: toUpper(title),
      id: title,
      accessorKey: title,
      enableSorting: false,
      cell: ({ row: { original } }) => {
        const initValue = original[title]
        if (isBooleanColumn(title)) {
          return (
            <div className="icon" data-testid={`query-column-${title}`}>
              <RiIcon
                type={initValue ? 'CheckThinIcon' : 'CancelSlimIcon'}
                color={initValue ? 'primary500' : 'danger600'}
              />
            </div>
          )
        }
        return <Text>{initValue}</Text>
      },
    }),
  )

  const Header = () => (
    <div>
      {result ? (
        <>
          <Text className="row" size="s">
            Indexing
            <GroupBadge
              type={result?.index_definition?.key_type?.toLowerCase()}
              className="badge"
            />
            documents prefixed by{' '}
            {result?.index_definition?.prefixes
              ?.map((prefix: any) => `"${prefix}"`)
              .join(',')}
          </Text>
          <Text className="row" size="s">
            Options:{' '}
            {result?.index_options?.length ? (
              <ColorText style={{ color: 'var(--euiColorFullShade)' }}>
                {result?.index_options?.join(', ')}
              </ColorText>
            ) : (
              <span className="italic">{noOptionsMessage}</span>
            )}
          </Text>
        </>
      ) : (
        <LoadingContent lines={2} />
      )}
    </div>
  )
  const Footer = () => (
    <div>
      {result ? (
        <Text className="row" size="s">
          {`Number of docs: ${result?.num_docs || '0'} (max ${result?.max_doc_id || '0'}) | `}
          {`Number of records: ${result?.num_records || '0'} | `}
          {`Number of terms: ${result?.num_terms || '0'}`}
        </Text>
      ) : (
        <LoadingContent lines={1} />
      )}
    </div>
  )

  const isDataArr =
    !React.isValidElement(result) && !(isArray(result) && isEmpty(result))
  const isDataEl = React.isValidElement(result)

  return (
    <div className="container">
      {isDataArr && (
        <FlexGroup
          direction="column"
          gap="m"
          className="content"
          data-testid={`query-table-result-${query}`}
        >
          {Header()}
          <Table columns={columns} data={items ?? []} />
          {Footer()}
        </FlexGroup>
      )}
      {isDataEl && <div className={cx('resultEl')}>{result}</div>}
      {!isDataArr && !isDataEl && (
        <div className={cx('resultEl')} data-testid="query-table-no-results">
          {noResultsMessage}
        </div>
      )}
    </div>
  )
})

export default TableInfoResult
