import React, { useEffect, useState } from 'react'
import { CategoryValueList, Section, SectionProps } from '@redis-ui/components'
import { useDispatch, useSelector } from 'react-redux'
import { CategoryValueListItem } from '@redis-ui/components/dist/Section/components/Header/components/CategoryValueList'
import { RedisString } from 'uiSrc/slices/interfaces'
import { bufferToString, formatLongName, stringToBuffer } from 'uiSrc/utils'
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
import {
  collectManageIndexesDeleteTelemetry,
  collectManageIndexesDetailsToggleTelemetry,
} from '../telemetry'
import DeleteConfirmationButton from './DeleteConfirmationButton'

export interface IndexSectionProps extends Omit<SectionProps, 'label'> {
  index: RedisString
}

export const IndexSection = ({ index, ...rest }: IndexSectionProps) => {
  const dispatch = useDispatch()
  const indexName = bufferToString(index)
  const [isPopoverOpen, setIsPopoverOpen] = useState(false)
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
    const data: IndexDeleteRequestBodyDto = {
      index: stringToBuffer(indexName),
    }

    dispatch(deleteRedisearchIndexAction(data, onDeletedIndexSuccess))
  }

  const onDeletedIndexSuccess = () => {
    collectManageIndexesDeleteTelemetry({
      instanceId,
    })
  }

  const handleOpenChange = (open: boolean) => {
    collectManageIndexesDetailsToggleTelemetry({
      instanceId,
      isOpen: open,
    })
  }

  // TODO: Add FieldTag component to list the types of the different fields
  return (
    <Section.Compose
      collapsible
      defaultOpen={false}
      onOpenChange={handleOpenChange}
      data-testid={`manage-indexes-list--item--${indexName}`}
      {...rest}
    >
      <Section.Header.Compose
        collapsedInfo={
          <div data-testid="index-collapsed-info">
            <CategoryValueList categoryValueList={indexSummaryInfo} />
          </div>
        }
      >
        <Section.Header.Group>
          <Section.Header.Label label={formatLongName(indexName)} />
          {/* // TODO: Add FieldTag component to list the types of the different fields */}
        </Section.Header.Group>
        <Section.Header.Group>
          <Section.Header.ActionButton onClick={() => setIsPopoverOpen(true)}>
            <DeleteConfirmationButton
              isOpen={isPopoverOpen}
              closePopover={() => setIsPopoverOpen(false)}
              onConfirm={handleDelete}
            />
          </Section.Header.ActionButton>
          <Section.Header.CollapseIndicator />
        </Section.Header.Group>
      </Section.Header.Compose>
      <Section.Body content={<IndexAttributesList indexInfo={indexInfo} />} />
    </Section.Compose>
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
