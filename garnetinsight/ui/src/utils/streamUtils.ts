import { format } from 'date-fns'
import { orderBy } from 'lodash'
import { SortOrder } from 'uiSrc/constants'
import {
  SCAN_STREAM_START_DEFAULT,
  SCAN_STREAM_END_DEFAULT,
} from 'uiSrc/constants/api'
import { RedisResponseBuffer } from 'uiSrc/slices/interfaces'
import {
  ClaimPendingEntryDto,
  ConsumerDto,
  ConsumerGroupDto,
  PendingEntryDto,
} from 'apiSrc/modules/browser/stream/dto'
import { isEqualBuffers } from './formatters'

export enum ClaimTimeOptions {
  RELATIVE = 'idle',
  ABSOLUTE = 'time',
}

interface IForm {
  consumerName: string
  minIdleTime: string
  timeCount: string
  timeOption: ClaimTimeOptions
  retryCount: string
  force: boolean
}

export const getFormatTime = (time: string = '') =>
  format(new Date(+time), 'HH:mm:ss.SSS d MMM yyyy')

export const getTimestampFromId = (id: string = ''): number =>
  parseInt(id.split('-')[0], 10)

export const getStreamRangeStart = (start: string, firstEntryId: string) => {
  if (
    start === '' ||
    !firstEntryId ||
    start === getTimestampFromId(firstEntryId).toString()
  ) {
    return SCAN_STREAM_START_DEFAULT
  }
  return start
}

export const getStreamRangeEnd = (end: string, endEtryId: string) => {
  if (
    end === '' ||
    !endEtryId ||
    end === getTimestampFromId(endEtryId).toString()
  ) {
    return SCAN_STREAM_END_DEFAULT
  }
  return end
}

export const getNextId = (id: string, sortOrder: SortOrder): string => {
  const splittedId = id.split('-')
  // if we don't have prefix
  if (splittedId.length === 1) {
    return `${id}-1`
  }
  if (sortOrder === SortOrder.DESC) {
    return splittedId[1] === '0'
      ? `${parseInt(splittedId[0], 10) - 1}`
      : `${splittedId[0]}-${+splittedId[1] - 1}`
  }
  return `${splittedId[0]}-${+splittedId[1] + 1}`
}

export const getDefaultConsumer = (consumers: ConsumerDto[]): ConsumerDto => {
  const sortedConsumers = orderBy(
    consumers,
    ['pending', 'name'],
    ['asc', 'asc'],
  )
  return sortedConsumers[0]
}

export const prepareDataForClaimRequest = (
  values: IForm,
  entries: string[],
  isOptionalAvailable: boolean,
): Partial<ClaimPendingEntryDto> => {
  const {
    consumerName,
    minIdleTime,
    timeCount,
    timeOption,
    retryCount,
    force,
  } = values
  if (isOptionalAvailable) {
    return {
      consumerName,
      minIdleTime: minIdleTime ? parseInt(minIdleTime, 10) : 0,
      [timeOption]: timeCount ? parseInt(timeCount, 10) : 0,
      retryCount: retryCount ? parseInt(retryCount, 10) : 0,
      force,
      entries,
    }
  }
  return {
    consumerName,
    minIdleTime: minIdleTime ? parseInt(minIdleTime, 10) : 0,
    entries,
  }
}

export const updateConsumerGroups = (
  groups: ConsumerGroupDto[],
  groupName: RedisResponseBuffer,
  consumers: ConsumerDto[],
) =>
  groups?.map((group: ConsumerGroupDto) => {
    if (isEqualBuffers(group.name, groupName)) {
      group.consumers = consumers?.length
      group.pending = consumers?.reduce((a, { pending }) => a + pending, 0)
    }
    return group
  })

export const updateConsumers = (
  consumers: ConsumerDto[],
  consumerName: RedisResponseBuffer,
  messages: PendingEntryDto[],
) =>
  consumers?.map((consumer: ConsumerDto) => {
    if (isEqualBuffers(consumer.name, consumerName)) {
      consumer.pending = messages?.length
    }
    return consumer
  })
