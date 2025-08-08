import React, { useEffect, useState } from 'react'
import { CategoryValueList, Section, SectionProps } from '@redis-ui/components'
import { useDispatch, useSelector } from 'react-redux'
import { CategoryValueListItem } from '@redis-ui/components/dist/Section/components/Header/components/CategoryValueList'
import { RedisString } from 'uiSrc/slices/interfaces'
import { bufferToString, formatLongName, stringToBuffer } from 'uiSrc/utils'
import { sendEventTelemetry, TelemetryEvent } from 'uiSrc/telemetry'
import { connectedInstanceSelector } from 'uiSrc/slices/instances/instances'
import {
  deleteRedisearchIndexAction,
  fetchRedisearchInfoAction,
} from 'uiSrc/slices/browser/redisearch'
import {
  IndexInfoDto,
  IndexDeleteRequestBodyDto,
} from 'apiSrc/modules/browser/redisearch/dto'
import { IndexAttributesList } from './IndexAttributesList'

export interface IndexSectionProps extends Omit<SectionProps, 'label'> {
  index: RedisString
}

export const IndexSection = ({ index, ...rest }: IndexSectionProps) => {
  const dispatch = useDispatch()
  const indexName = bufferToString(index)
  const { id: instanceId } = useSelector(connectedInstanceSelector)

  const [indexInfo, setIndexInfo] = useState<IndexInfoDto>()
  const [indexSummaryInfo, setIndexSummaryInfo] = useState<
    CategoryValueListItem[]
  >(parseIndexSummaryInfo({} as IndexInfoDto))

  useEffect(() => {
    dispatch(
      fetchRedisearchInfoAction(indexName, (data) => {
        const indexInfo = data as unknown as IndexInfoDto

        setIndexInfo(indexInfo)
        setIndexSummaryInfo(parseIndexSummaryInfo(indexInfo))
      }),
    )
  }, [indexName, dispatch])

  const handleDelete = () => {
    // TODO: Replace with confirmation popup once the design is ready
    // eslint-disable-next-line no-restricted-globals
    const result = confirm('Are you sure you want to delete this index?')

    if (result) {
      const data: IndexDeleteRequestBodyDto = {
        index: stringToBuffer(indexName),
      }

      dispatch(deleteRedisearchIndexAction(data, onDeletedIndexSuccess))
    }
  }

  const onDeletedIndexSuccess = () => {
    sendEventTelemetry({
      event: TelemetryEvent.SEARCH_MANAGE_INDEX_DELETED,
      eventData: {
        databaseId: instanceId,
      },
    })
  }

  const handleOpenChange = (open: boolean) => {
    sendEventTelemetry({
      event: open
        ? TelemetryEvent.SEARCH_MANAGE_INDEX_DETAILS_OPENED
        : TelemetryEvent.SEARCH_MANAGE_INDEX_DETAILS_CLOSED,
      eventData: {
        databaseId: instanceId,
      },
    })
  }

  return (
    <Section
      collapsible
      collapsedInfo={<CategoryValueList categoryValueList={indexSummaryInfo} />}
      content={<IndexAttributesList indexInfo={indexInfo} />}
      // TODO: Add FieldTag component to list the types of the different fields
      label={formatLongName(indexName)}
      defaultOpen={false}
      actionButtonText="Delete" // TODO: Replace with an icon of a trash can
      onAction={handleDelete}
      onOpenChange={handleOpenChange}
      data-testid={`manage-indexes-list--item--${indexName}`}
      {...rest}
    />
  )
}

const parseIndexSummaryInfo = (
  indexInfo: IndexInfoDto,
): CategoryValueListItem[] => [
  {
    category: 'Records',
    value: indexInfo?.num_records?.toString() || '',
    key: 'num_records',
  },
  {
    category: 'Terms',
    value: indexInfo?.num_terms?.toString() || '',
    key: 'num_terms',
  },
  {
    category: 'Fields',
    value: indexInfo?.attributes?.length.toString() || '',
    key: 'num_fields',
  },
  // TODO: Date info not available in IndexInfoDto
  // {
  //   category: 'Date',
  //   value: '',
  //   key: 'date',
  // },
]
