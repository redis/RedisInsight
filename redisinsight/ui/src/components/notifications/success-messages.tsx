import React from 'react'
import { RiFlexItem, RiRow } from 'uiBase/layout'
import { RiText } from 'uiBase/text'
import { EXTERNAL_LINKS } from 'uiSrc/constants/links'
import {
  IBulkActionOverview,
  RedisResponseBuffer,
} from 'uiSrc/slices/interfaces'
import {
  bufferToString,
  formatLongName,
  formatNameShort,
  Maybe,
  millisecondsFormat,
} from 'uiSrc/utils'
import { numberWithSpaces } from 'uiSrc/utils/numbers'
import styles from './styles.module.scss'

// TODO: use i18n file for texts
export default {
  ADDED_NEW_INSTANCE: (instanceName: string) => ({
    title: 'Database has been added',
    message: (
      <>
        <b>{formatNameShort(instanceName)}</b> has been added to Redis Insight.
      </>
    ),
  }),
  ADDED_NEW_RDI_INSTANCE: (instanceName: string) => ({
    title: 'Instance has been added',
    message: (
      <>
        <b>{formatNameShort(instanceName)}</b> has been added to RedisInsight.
      </>
    ),
  }),
  DELETE_INSTANCE: (instanceName: string) => ({
    title: 'Database has been deleted',
    message: (
      <>
        <b>{formatNameShort(instanceName)}</b> has been deleted from Redis
        Insight.
      </>
    ),
  }),
  DELETE_RDI_INSTANCE: (instanceName: string) => ({
    title: 'Instance has been deleted',
    message: (
      <>
        <b>{formatNameShort(instanceName)}</b> has been deleted from
        RedisInsight.
      </>
    ),
  }),
  DELETE_INSTANCES: (instanceNames: Maybe<string>[]) => {
    const limitShowRemovedInstances = 10
    return {
      title: 'Databases have been deleted',
      message: (
        <>
          <span>
            <b>{instanceNames.length}</b> databases have been deleted from Redis
            Insight:
          </span>
          <ul style={{ marginBottom: 0 }}>
            {instanceNames.slice(0, limitShowRemovedInstances).map((el, i) => (
              // eslint-disable-next-line react/no-array-index-key
              <li className={styles.list} key={i}>
                {formatNameShort(el)}
              </li>
            ))}
            {instanceNames.length >= limitShowRemovedInstances && <li>...</li>}
          </ul>
        </>
      ),
    }
  },
  DELETE_RDI_INSTANCES: (instanceNames: Maybe<string>[]) => {
    const limitShowRemovedInstances = 10
    return {
      title: 'Instances have been deleted',
      message: (
        <>
          <span>
            <b>{instanceNames.length}</b> instances have been deleted from
            RedisInsight:
          </span>
          <ul style={{ marginBottom: 0 }}>
            {instanceNames.slice(0, limitShowRemovedInstances).map((el, i) => (
              // eslint-disable-next-line react/no-array-index-key
              <li className={styles.list} key={i}>
                {formatNameShort(el)}
              </li>
            ))}
            {instanceNames.length >= limitShowRemovedInstances && <li>...</li>}
          </ul>
        </>
      ),
    }
  },
  ADDED_NEW_KEY: (keyName: RedisResponseBuffer) => ({
    title: 'Key has been added',
    message: (
      <>
        <b>{formatNameShort(bufferToString(keyName))}</b> has been added.
      </>
    ),
  }),
  DELETED_KEY: (keyName: RedisResponseBuffer) => ({
    title: 'Key has been deleted',
    message: (
      <>
        <b>{formatNameShort(bufferToString(keyName))}</b> has been deleted.
      </>
    ),
  }),
  REMOVED_KEY_VALUE: (
    keyName: RedisResponseBuffer,
    keyValue: RedisResponseBuffer,
    valueType: string,
  ) => ({
    title: (
      <>
        <span>{valueType}</span> has been removed
      </>
    ),
    message: (
      <>
        <b>{formatNameShort(bufferToString(keyValue))}</b> has been removed from
        &nbsp;
        <b>{formatNameShort(bufferToString(keyName))}</b>
      </>
    ),
  }),
  REMOVED_LIST_ELEMENTS: (
    keyName: RedisResponseBuffer,
    numberOfElements: number,
    listOfElements: RedisResponseBuffer[],
  ) => {
    const limitShowRemovedElements = 10
    return {
      title: 'Elements have been removed',
      message: (
        <>
          <span>
            {`${numberOfElements} Element(s) removed from ${formatNameShort(bufferToString(keyName))}:`}
          </span>
          <ul style={{ marginBottom: 0 }}>
            {listOfElements.slice(0, limitShowRemovedElements).map((el, i) => (
              // eslint-disable-next-line react/no-array-index-key
              <li className={styles.list} key={i}>
                {formatNameShort(bufferToString(el))}
              </li>
            ))}
            {listOfElements.length >= limitShowRemovedElements && <li>...</li>}
          </ul>
        </>
      ),
    }
  },
  INSTALLED_NEW_UPDATE: (
    updateDownloadedVersion: string,
    onClickLink?: () => void,
  ) => ({
    title: 'Application updated',
    message: (
      <>
        <span>{`Your application has been updated to ${updateDownloadedVersion}. Find more information in `}</span>
        <a
          href={EXTERNAL_LINKS.releaseNotes}
          onClick={() => onClickLink?.()}
          className="link-underline"
          target="_blank"
          rel="noreferrer"
        >
          Release Notes.
        </a>
      </>
    ),
    group: 'upgrade',
  }),
  // only one message is being processed at the moment
  MESSAGE_ACTION: (message: string, actionName: string) => ({
    title: <>Message has been {actionName}</>,
    message: (
      <>
        <b>{message}</b> has been successfully {actionName}.
      </>
    ),
  }),
  NO_CLAIMED_MESSAGES: () => ({
    title: 'No messages claimed',
    message: 'No messages exceed the minimum idle time.',
  }),
  CREATE_INDEX: () => ({
    title: 'Index has been created',
    message: 'Open the list of indexes to see it.',
  }),
  TEST_CONNECTION: () => ({
    title: 'Connection is successful',
  }),
  UPLOAD_DATA_BULK: (data?: IBulkActionOverview, fileName?: string) => {
    const { processed = 0, succeed = 0, failed = 0 } = data?.summary ?? {}
    return {
      title: (
        <>
          Action completed
          {fileName ? (
            <>
              <br />
              <RiText color="ghost">Commands executed from file:</RiText>
              <RiText color="ghost">{formatLongName(fileName, 34, 5)}</RiText>
            </>
          ) : null}
        </>
      ),
      message: (
        <RiRow align="start" className={styles.summary}>
          <RiFlexItem>
            <RiText color="ghost" className={styles.summaryValue}>
              {numberWithSpaces(processed)}
            </RiText>
            <RiText size="xs" className={styles.summaryLabel}>
              Commands Processed
            </EuiText>
          </FlexItem>
          <FlexItem>
            <EuiText color="ghost" className={styles.summaryValue}>
              {numberWithSpaces(succeed)}
            </RiText>
            <RiText size="xs" className={styles.summaryLabel}>
              Success
            </RiText>
          </RiFlexItem>
          <RiFlexItem>
            <RiText color="ghost" className={styles.summaryValue}>
              {numberWithSpaces(failed)}
            </RiText>
            <RiText size="xs" className={styles.summaryLabel}>
              Errors
            </RiText>
          </RiFlexItem>
          <RiFlexItem>
            <RiText color="ghost" className={styles.summaryValue}>
              {millisecondsFormat(data?.duration || 0, 'H:mm:ss.SSS')}
            </RiText>
            <RiText size="xs" className={styles.summaryLabel}>
              Time Taken
            </RiText>
          </RiFlexItem>
        </RiRow>
      ),
      className: 'dynamic',
    }
  },
  DELETE_LIBRARY: (libraryName: string) => ({
    title: 'Library has been deleted',
    message: (
      <>
        <b>{formatNameShort(libraryName)}</b> has been deleted.
      </>
    ),
  }),
  ADD_LIBRARY: (libraryName: string) => ({
    title: 'Library has been added',
    message: (
      <>
        <b>{formatNameShort(libraryName)}</b> has been added.
      </>
    ),
  }),
  REMOVED_ALL_CAPI_KEYS: () => ({
    title: 'API keys have been removed',
    message: 'All API keys have been removed from Redis Insight.',
  }),
  REMOVED_CAPI_KEY: (name: string) => ({
    title: 'API Key has been removed',
    message: `${formatNameShort(name)} has been removed from Redis Insight.`,
  }),
  DATABASE_ALREADY_EXISTS: () => ({
    title: 'Database already exists',
    message: 'No new database connections have been added.',
  }),
  SUCCESS_RESET_PIPELINE: () => ({
    title: 'Pipeline has been reset',
    message:
      'The RDI pipeline has been reset, consider flushing the target Redis database.',
  }),
  SUCCESS_TAGS_UPDATED: () => ({
    title: 'Tags updated successfully.',
  }),
}
