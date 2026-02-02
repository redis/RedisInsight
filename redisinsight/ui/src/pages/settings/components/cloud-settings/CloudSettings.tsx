import React, { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'

import { DeleteIcon } from 'uiSrc/components/base/icons'
import {
  getCapiKeysAction,
  oauthCapiKeysSelector,
  removeAllCapiKeysAction,
} from 'uiSrc/slices/oauth/cloud'
import { sendEventTelemetry, TelemetryEvent } from 'uiSrc/telemetry'
import { FlexItem, Row } from 'uiSrc/components/base/layout/flex'
import { Spacer } from 'uiSrc/components/base/layout/spacer'
import {
  DestructiveButton,
  PrimaryButton,
} from 'uiSrc/components/base/forms/buttons'
import { Text } from 'uiSrc/components/base/text'
import { Link } from 'uiSrc/components/base/link/Link'
import { RiPopover } from 'uiSrc/components/base'
import { EXTERNAL_LINKS, UTM_MEDIUMS } from 'uiSrc/constants/links'
import { getUtmExternalLink } from 'uiSrc/utils/links'
import UserApiKeysTable from './components/user-api-keys-table'

import * as S from './CloudSettings.styles'

const CloudSettings = () => {
  const { loading, data } = useSelector(oauthCapiKeysSelector)
  const [isDeleteOpen, setIsDeleteOpen] = useState<boolean>(false)

  const dispatch = useDispatch()

  useEffect(() => {
    dispatch(getCapiKeysAction())
  }, [])

  const handleClickDelete = () => {
    setIsDeleteOpen(true)
    sendEventTelemetry({
      event: TelemetryEvent.SETTINGS_CLOUD_API_KEYS_REMOVE_CLICKED,
    })
  }

  const handleDeleteAllKeys = () => {
    setIsDeleteOpen(false)
    dispatch(
      removeAllCapiKeysAction(() => {
        sendEventTelemetry({
          event: TelemetryEvent.SETTINGS_CLOUD_API_KEYS_REMOVED,
        })
      }),
    )
  }

  return (
    <S.Container>
      <S.SectionTitle size="XS">API user keys</S.SectionTitle>
      <Spacer size="s" />
      <Row gap="m" responsive>
        <FlexItem grow>
          <S.SmallText>
            The list of API user keys that are stored locally in Redis Insight.
          </S.SmallText>
          <Spacer size="xs" />
          <S.SmallText>
            API user keys grant programmatic access to Redis Cloud.
          </S.SmallText>
          <S.SmallText>
            To delete API keys from Redis Cloud,
            <Link
              color="primary"
              target="_blank"
              href={getUtmExternalLink(EXTERNAL_LINKS.redisEnterpriseCloud, {
                medium: UTM_MEDIUMS.Settings,
                campaign: 'clear_keys',
              })}
            >
              sign in to Redis Cloud
            </Link>
            and delete them manually.
          </S.SmallText>
        </FlexItem>
        <FlexItem grow={false}>
          <RiPopover
            anchorPosition="downCenter"
            ownFocus
            isOpen={isDeleteOpen}
            closePopover={() => setIsDeleteOpen(false)}
            panelPaddingSize="l"
            maxWidth="420px"
            button={
              <PrimaryButton
                size="small"
                onClick={handleClickDelete}
                disabled={loading || !data?.length}
                data-testid="delete-key-btn"
              >
                Remove all API keys
              </PrimaryButton>
            }
          >
            <S.PopoverDeleteContainer>
              <Text size="m" component="div">
                <h4>All API user keys will be removed from Redis Insight.</h4>
                {'To delete API keys from Redis Cloud, '}
                <Link
                  target="_blank"
                  color="text"
                  tabIndex={-1}
                  href="https://redis.io/redis-enterprise-cloud/overview/?utm_source=redisinsight&utm_medium=settings&utm_campaign=clear_keys"
                >
                  sign in to Redis Cloud
                </Link>
                {' and delete them manually.'}
              </Text>
              <Spacer />
              <S.PopoverFooter>
                <DestructiveButton
                  size="small"
                  icon={DeleteIcon}
                  onClick={handleDeleteAllKeys}
                  data-testid="delete-key-confirm-btn"
                >
                  Remove all API keys
                </DestructiveButton>
              </S.PopoverFooter>
            </S.PopoverDeleteContainer>
          </RiPopover>
        </FlexItem>
      </Row>
      <Spacer />
      <UserApiKeysTable items={data} loading={loading} />
    </S.Container>
  )
}

export default CloudSettings
