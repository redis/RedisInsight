import React from 'react'
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
import { FlexItem, Row } from 'uiSrc/components/base/layout/flex'
import { Text } from 'uiSrc/components/base/text'
import styles from './styles.module.scss'

// TODO: use i18n file for texts
export default {
  ADDED_NEW_INSTANCE: (instanceName: string) => ({
    title: 'Database has been added',
    message: (
      <Text component="span">
        <Text variant="semiBold" component="span">
          {formatNameShort(instanceName)}
        </Text>{' '}
        has been added to Redis Insight.
      </Text>
    ),
  }),
  ADDED_NEW_RDI_INSTANCE: (instanceName: string) => ({
    title: 'Instance has been added',
    message: (
      <Text component="span">
        <Text variant="semiBold" component="span">
          {formatNameShort(instanceName)}
        </Text>{' '}
        has been added to RedisInsight.
      </Text>
    ),
  }),
  DELETE_INSTANCE: (instanceName: string) => ({
    title: 'Database has been deleted',
    message: (
      <Text component="span">
        <Text variant="semiBold" component="span">
          {formatNameShort(instanceName)}
        </Text>{' '}
        has been deleted from Redis Insight.
      </Text>
    ),
  }),
  DELETE_RDI_INSTANCE: (instanceName: string) => ({
    title: 'Instance has been deleted',
    message: (
      <Text component="span">
        <Text variant="semiBold" component="span">
          {formatNameShort(instanceName)}
        </Text>{' '}
        has been deleted from RedisInsight.
      </Text>
    ),
  }),
  DELETE_INSTANCES: (instanceNames: Maybe<string>[]) => {
    const limitShowRemovedInstances = 10
    return {
      title: 'Databases have been deleted',
      message: (
        <>
          <Text component="span">
            <Text variant="semiBold" component="span">
              {instanceNames.length}
            </Text>{' '}
            databases have been deleted from Redis Insight:
          </Text>
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
          <Text component="span">
            <Text variant="semiBold" component="span">
              {instanceNames.length}
            </Text>{' '}
            instances have been deleted from RedisInsight:
          </Text>
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
      <Text component="span">
        <Text variant="semiBold" component="span">
          {formatNameShort(bufferToString(keyName))}
        </Text>{' '}
        has been added.
      </Text>
    ),
  }),
  DELETED_KEY: (keyName: RedisResponseBuffer) => ({
    title: 'Key has been deleted',
    message: (
      <Text component="span">
        <Text variant="semiBold" component="span">
          {formatNameShort(bufferToString(keyName))}
        </Text>{' '}
        has been deleted.
      </Text>
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
        <Text variant="semiBold" component="span">
          {formatNameShort(bufferToString(keyValue))}
        </Text>{' '}
        has been removed from &nbsp;
        <Text variant="semiBold" component="span">
          {formatNameShort(bufferToString(keyName))}
        </Text>
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
      <Text component="span">
        <Text variant="semiBold" component="span">
          {message}
        </Text>{' '}
        has been successfully {actionName}.
      </Text>
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
  DELETE_INDEX: (indexName: string) => ({
    title: 'Index has been deleted',
    message: (
      <Text component="span">
        <Text variant="semiBold" component="span">
          {formatNameShort(indexName)}
        </Text>{' '}
        has been deleted.
      </Text>
    ),
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
              <Text color="ghost">Commands executed from file:</Text>
              <Text color="ghost">{formatLongName(fileName, 34, 5)}</Text>
            </>
          ) : null}
        </>
      ),
      message: (
        <Row align="start" className={styles.summary}>
          <FlexItem>
            <Text color="ghost" className={styles.summaryValue}>
              {numberWithSpaces(processed)}
            </Text>
            <Text size="xs" className={styles.summaryLabel}>
              Commands Processed
            </Text>
          </FlexItem>
          <FlexItem>
            <Text color="ghost" className={styles.summaryValue}>
              {numberWithSpaces(succeed)}
            </Text>
            <Text size="xs" className={styles.summaryLabel}>
              Success
            </Text>
          </FlexItem>
          <FlexItem>
            <Text color="ghost" className={styles.summaryValue}>
              {numberWithSpaces(failed)}
            </Text>
            <Text size="xs" className={styles.summaryLabel}>
              Errors
            </Text>
          </FlexItem>
          <FlexItem>
            <Text color="ghost" className={styles.summaryValue}>
              {millisecondsFormat(data?.duration || 0, 'H:mm:ss.SSS')}
            </Text>
            <Text size="xs" className={styles.summaryLabel}>
              Time Taken
            </Text>
          </FlexItem>
        </Row>
      ),
      className: 'dynamic',
    }
  },
  DELETE_LIBRARY: (libraryName: string) => ({
    title: 'Library has been deleted',
    message: (
      <Text component="span">
        <Text variant="semiBold" component="span">
          {formatNameShort(libraryName)}
        </Text>{' '}
        has been deleted.
      </Text>
    ),
  }),
  ADD_LIBRARY: (libraryName: string) => ({
    title: 'Library has been added',
    message: (
      <Text component="span">
        <Text variant="semiBold" component="span">
          {formatNameShort(libraryName)}
        </Text>{' '}
        has been added.
      </Text>
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
