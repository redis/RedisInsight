import React from 'react'
import styled from 'styled-components'
import i18n, { Trans } from 'uiSrc/i18n'
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
import { getIndexDisplayName } from 'uiSrc/pages/vector-search/utils'
import { FlexItem, Row } from 'uiSrc/components/base/layout/flex'
import { Text } from 'uiSrc/components/base/text'
import { Spacer } from 'uiSrc/components/base/layout'

const Li = styled.li<React.HTMLAttributes<HTMLLIElement>>`
  padding-bottom: 10px;

  &:first-of-type {
    padding-top: 10px;
  }
`

// Bold span reused as the <bold> slot for <Trans> interpolated messages.
// <Trans> injects the translated text as children, so the placeholder is unused.
const bold = (
  <Text variant="semiBold" component="span">
    {''}
  </Text>
)

export default {
  ADDED_NEW_INSTANCE: (instanceName: string) => ({
    title: i18n.t('notification.success.addedInstance.title'),
    message: (
      <Text component="span">
        <Trans
          i18nKey="notification.success.addedInstance.message"
          values={{ name: formatNameShort(instanceName) }}
          components={{ bold }}
        />
      </Text>
    ),
  }),
  ADDED_NEW_RDI_INSTANCE: (instanceName: string) => ({
    title: i18n.t('notification.success.addedRdiInstance.title'),
    message: (
      <Text component="span">
        <Trans
          i18nKey="notification.success.addedRdiInstance.message"
          values={{ name: formatNameShort(instanceName) }}
          components={{ bold }}
        />
      </Text>
    ),
  }),
  DELETE_INSTANCE: (instanceName: string) => ({
    title: i18n.t('notification.success.deleteInstance.title'),
    message: (
      <Text component="span">
        <Trans
          i18nKey="notification.success.deleteInstance.message"
          values={{ name: formatNameShort(instanceName) }}
          components={{ bold }}
        />
      </Text>
    ),
  }),
  DELETE_RDI_INSTANCE: (instanceName: string) => ({
    title: i18n.t('notification.success.deleteRdiInstance.title'),
    message: (
      <Text component="span">
        <Trans
          i18nKey="notification.success.deleteRdiInstance.message"
          values={{ name: formatNameShort(instanceName) }}
          components={{ bold }}
        />
      </Text>
    ),
  }),
  DELETE_INSTANCES: (instanceNames: Maybe<string>[]) => {
    const limitShowRemovedInstances = 10
    return {
      title: i18n.t('notification.success.deleteInstances.title'),
      message: (
        <>
          <Text component="span">
            <Trans
              i18nKey="notification.success.deleteInstances.message"
              values={{ total: instanceNames.length }}
              components={{ bold }}
            />
          </Text>
          <ul style={{ marginBottom: 0 }}>
            {instanceNames.slice(0, limitShowRemovedInstances).map((el, i) => (
              // eslint-disable-next-line react/no-array-index-key
              <Li key={i}>
                <Text component="div" size="S">
                  {formatNameShort(el)}
                </Text>
              </Li>
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
      title: i18n.t('notification.success.deleteRdiInstances.title'),
      message: (
        <>
          <Text component="span">
            <Trans
              i18nKey="notification.success.deleteRdiInstances.message"
              values={{ total: instanceNames.length }}
              components={{ bold }}
            />
          </Text>
          <ul style={{ marginBottom: 0 }}>
            {instanceNames.slice(0, limitShowRemovedInstances).map((el, i) => (
              // eslint-disable-next-line react/no-array-index-key
              <Li key={i}>
                <Text component="div" size="S">
                  {formatNameShort(el)}
                </Text>
              </Li>
            ))}
            {instanceNames.length >= limitShowRemovedInstances && <li>...</li>}
          </ul>
        </>
      ),
    }
  },
  ADDED_NEW_KEY: (keyName: RedisResponseBuffer) => ({
    title: i18n.t('notification.success.addedKey.title'),
    message: (
      <Text component="span">
        <Trans
          i18nKey="notification.success.addedKey.message"
          values={{ name: formatNameShort(bufferToString(keyName)) }}
          components={{ bold }}
        />
      </Text>
    ),
  }),
  DELETED_KEY: (keyName: RedisResponseBuffer) => ({
    title: i18n.t('notification.success.deletedKey.title'),
    message: (
      <Text component="span">
        <Trans
          i18nKey="notification.success.deletedKey.message"
          values={{ name: formatNameShort(bufferToString(keyName)) }}
          components={{ bold }}
        />
      </Text>
    ),
  }),
  REMOVED_KEY_VALUE: (
    keyName: RedisResponseBuffer,
    keyValue: RedisResponseBuffer,
    valueType: string,
  ) => ({
    title: i18n.t(
      `notification.success.removedKeyValue.title.${valueType}` as never,
    ),
    message: (
      <Trans
        i18nKey="notification.success.removedKeyValue.message"
        values={{
          value: formatNameShort(bufferToString(keyValue)),
          name: formatNameShort(bufferToString(keyName)),
        }}
        components={{ bold }}
      />
    ),
  }),
  REMOVED_LIST_ELEMENTS: (
    keyName: RedisResponseBuffer,
    numberOfElements: number,
    listOfElements: RedisResponseBuffer[],
  ) => {
    const limitShowRemovedElements = 10
    return {
      title: i18n.t('notification.success.removedListElements.title'),
      message: (
        <>
          <span>
            {i18n.t('notification.success.removedListElements.message', {
              total: numberOfElements,
              name: formatNameShort(bufferToString(keyName)),
            })}
          </span>
          <ul style={{ marginBottom: 0 }}>
            {listOfElements.slice(0, limitShowRemovedElements).map((el, i) => (
              // eslint-disable-next-line react/no-array-index-key
              <Li key={i}>
                <Text component="div" size="S">
                  {formatNameShort(bufferToString(el))}
                </Text>
              </Li>
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
    title: i18n.t('notification.success.installedUpdate.title'),
    message: (
      <Trans
        i18nKey="notification.success.installedUpdate.message"
        values={{ version: updateDownloadedVersion }}
        components={{
          releaseNotesLink: (
            <a
              href={EXTERNAL_LINKS.releaseNotes}
              onClick={() => onClickLink?.()}
              className="link-underline"
              target="_blank"
              rel="noreferrer"
            />
          ),
        }}
      />
    ),
    group: 'upgrade',
  }),
  // only one message is being processed at the moment
  MESSAGE_ACTION: (id: string, action: 'claimed' | 'acknowledged') => {
    // Translate the action word too, then interpolate it into the sentence.
    const actionText = i18n.t(
      `notification.success.messageAction.action.${action}`,
    )
    return {
      title: i18n.t('notification.success.messageAction.title', {
        action: actionText,
      }),
      message: (
        <Text component="span">
          <Trans
            i18nKey="notification.success.messageAction.message"
            values={{ id, action: actionText }}
            components={{ bold }}
          />
        </Text>
      ),
    }
  },
  NO_CLAIMED_MESSAGES: () => ({
    title: i18n.t('notification.success.noClaimedMessages.title'),
    message: i18n.t('notification.success.noClaimedMessages.message'),
  }),
  CREATE_INDEX: () => ({
    title: i18n.t('notification.success.createIndex.title'),
    message: i18n.t('notification.success.createIndex.message'),
  }),
  DELETE_INDEX: (indexName: string) => ({
    title: i18n.t('notification.success.deleteIndex.title'),
    message: (
      <Text component="span">
        <Trans
          i18nKey="notification.success.deleteIndex.message"
          values={{ name: formatNameShort(getIndexDisplayName(indexName)) }}
          components={{ bold }}
        />
      </Text>
    ),
  }),
  TEST_CONNECTION: () => ({
    title: i18n.t('notification.success.testConnection.title'),
  }),
  UPLOAD_DATA_BULK: (data?: IBulkActionOverview, fileName?: string) => {
    const { processed = 0, succeed = 0, failed = 0 } = data?.summary ?? {}
    return {
      title: (
        <>
          <Text component="span" variant="semiBold">
            {i18n.t('notification.success.uploadDataBulk.title')}
          </Text>
          {fileName ? (
            <>
              <Spacer size="s" />
              <Text component="span">
                {i18n.t('notification.success.uploadDataBulk.fileLabel')}
              </Text>
              <Text component="span">{formatLongName(fileName, 34, 5)}</Text>
            </>
          ) : null}
          <Spacer size="m" />
        </>
      ),
      message: (
        <Row align="start" gap="xl">
          <FlexItem>
            <Text>{numberWithSpaces(processed)}</Text>
            <Text size="xs" style={{ whiteSpace: 'nowrap' }}>
              {i18n.t('notification.success.uploadDataBulk.commandsProcessed')}
            </Text>
          </FlexItem>
          <FlexItem>
            <Text>{numberWithSpaces(succeed)}</Text>
            <Text size="xs" style={{ whiteSpace: 'nowrap' }}>
              {i18n.t('notification.success.uploadDataBulk.success')}
            </Text>
          </FlexItem>
          <FlexItem>
            <Text>{numberWithSpaces(failed)}</Text>
            <Text size="xs" style={{ whiteSpace: 'nowrap' }}>
              {i18n.t('notification.success.uploadDataBulk.errors')}
            </Text>
          </FlexItem>
          <FlexItem>
            <Text>
              {millisecondsFormat(data?.duration || 0, 'H:mm:ss.SSS')}
            </Text>
            <Text size="xs" style={{ whiteSpace: 'nowrap' }}>
              {i18n.t('notification.success.uploadDataBulk.timeTaken')}
            </Text>
          </FlexItem>
        </Row>
      ),
      className: 'dynamic',
      actions: {}, // Make sure we don't show the default OK button
    }
  },
  DELETE_LIBRARY: (libraryName: string) => ({
    title: i18n.t('notification.success.deleteLibrary.title'),
    message: (
      <Text component="span">
        <Trans
          i18nKey="notification.success.deleteLibrary.message"
          values={{ name: formatNameShort(libraryName) }}
          components={{ bold }}
        />
      </Text>
    ),
  }),
  ADD_LIBRARY: (libraryName: string) => ({
    title: i18n.t('notification.success.addLibrary.title'),
    message: (
      <Text component="span">
        <Trans
          i18nKey="notification.success.addLibrary.message"
          values={{ name: formatNameShort(libraryName) }}
          components={{ bold }}
        />
      </Text>
    ),
  }),
  REMOVED_ALL_CAPI_KEYS: () => ({
    title: i18n.t('notification.success.removedAllCapiKeys.title'),
    message: i18n.t('notification.success.removedAllCapiKeys.message'),
  }),
  REMOVED_CAPI_KEY: (name: string) => ({
    title: i18n.t('notification.success.removedCapiKey.title'),
    message: i18n.t('notification.success.removedCapiKey.message', {
      name: formatNameShort(name),
    }),
  }),
  DATABASE_ALREADY_EXISTS: () => ({
    title: i18n.t('notification.success.databaseAlreadyExists.title'),
    message: i18n.t('notification.success.databaseAlreadyExists.message'),
  }),
  SUCCESS_RESET_PIPELINE: () => ({
    title: i18n.t('notification.success.resetPipeline.title'),
    message: i18n.t('notification.success.resetPipeline.message'),
  }),
  SUCCESS_TAGS_UPDATED: () => ({
    title: i18n.t('notification.success.tagsUpdated.title'),
  }),
  AZURE_AUTH_SUCCESS: (username: string) => ({
    title: i18n.t('notification.success.azureAuthSuccess.title'),
    message: (
      <Text component="span">
        <Trans
          i18nKey="notification.success.azureAuthSuccess.message"
          values={{ username }}
          components={{ bold }}
        />
      </Text>
    ),
  }),
}
