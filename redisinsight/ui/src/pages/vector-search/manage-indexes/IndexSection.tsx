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
import { parseIndexSummaryInfo } from 'uiSrc/pages/vector-search/manage-indexes/utils/indexSection'
import {
  IndexInfoDto,
  IndexDeleteRequestBodyDto,
} from 'apiSrc/modules/browser/redisearch/dto'
import { IndexAttributesList } from './IndexAttributesList'
import DeleteConfirmationButton from './DeleteConfirmationButton'
import {
  collectManageIndexesDeleteTelemetry,
  collectManageIndexesDetailsToggleTelemetry,
} from '../telemetry'

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
        const indexInfoDto = data as unknown as IndexInfoDto

        setIndexInfo(indexInfoDto)
        setIndexSummaryInfo(parseIndexSummaryInfo(indexInfoDto))
      }),
    )
  }, [indexName, dispatch])

  const onDeletedIndexSuccess = () => {
    collectManageIndexesDeleteTelemetry({
      instanceId,
    })
  }

  const handleDelete = () => {
    const data: IndexDeleteRequestBodyDto = {
      index: stringToBuffer(indexName),
    }

    dispatch(deleteRedisearchIndexAction(data, onDeletedIndexSuccess))
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
      <Section.Header.Compose>
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
          <Section.Header.CollapseButton />
        </Section.Header.Group>
      </Section.Header.Compose>
      <Section.Body>
        <IndexAttributesList indexInfo={indexInfo} />
      </Section.Body>
      <Section.SummaryBar>
        <div data-testid="index-collapsed-info">
          <CategoryValueList categoryValueList={indexSummaryInfo} />
        </div>
      </Section.SummaryBar>
    </Section.Compose>
  )
}
