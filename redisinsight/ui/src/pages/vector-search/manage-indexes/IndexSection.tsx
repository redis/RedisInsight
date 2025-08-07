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
import { RiPopover } from 'uiSrc/components'
import { RiIcon, DeleteIcon } from 'uiSrc/components/base/icons'
import { Button } from 'uiSrc/components/base/forms/buttons'

import {
  ButtonWrapper,
  IconAndTitleWrapper,
  IconWrapper,
  PopoverContent,
  Title,
} from './styles'

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

  const DeleteButton = () => (
    <RiPopover
      id="bulk-upload-warning-popover"
      anchorPosition="upCenter"
      isOpen={isPopoverOpen}
      closePopover={() => setIsPopoverOpen(false)}
      panelPaddingSize="none"
      button={<DeleteIcon />}
    >
      <PopoverContent>
        <IconAndTitleWrapper>
          <IconWrapper>
            <RiIcon color="danger600" type="ToastDangerIcon" />
          </IconWrapper>

          <Title color="danger">
            Are you sure you want to delete this index?
          </Title>
        </IconAndTitleWrapper>

        <ButtonWrapper>
          <Button
            variant="destructive"
            onClick={handleDelete}
            data-testid="manage-index-delete-btn"
          >
            Delete
          </Button>
        </ButtonWrapper>
      </PopoverContent>
    </RiPopover>
  )

  return (
    <Section
      collapsible
      collapsedInfo={<CategoryValueList categoryValueList={indexSummaryInfo} />}
      content={<IndexAttributesList indexInfo={indexInfo} />}
      // TODO: Add FieldTag component to list the types of the different fields
      label={formatLongName(indexName)}
      defaultOpen={false}
      onOpenChange={handleOpenChange}
      actionButtonText={<DeleteButton />}
      onAction={() => setIsPopoverOpen(true)}
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
