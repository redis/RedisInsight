import React, { useEffect, useMemo, useState } from 'react'
import { useParams } from 'react-router-dom'
import { Environment } from 'apiClient'

import { useTranslation } from 'uiSrc/i18n'
import { useAppSelector } from 'uiSrc/slices/hooks'
import { connectedInstanceSelector } from 'uiSrc/slices/instances/instances'
import { exportInstances } from 'uiSrc/services/database/instancesService'
import { CopyButton } from 'uiSrc/components/copy-button'
import { RiBadge } from 'uiSrc/components/base/display/badge/RiBadge'
import { Checkbox } from 'uiSrc/components/base/forms/checkbox/Checkbox'
import {
  IconButton,
  SecondaryButton,
} from 'uiSrc/components/base/forms/buttons'
import {
  AnalysisIcon,
  ArrowDiagonalIcon,
  HideIcon,
  Icon,
  MetricsIcon,
  ShowIcon,
} from 'uiSrc/components/base/icons'
import { Col, Row } from 'uiSrc/components/base/layout/flex'
import { Text } from 'uiSrc/components/base/text'
import { Title } from 'uiSrc/components/base/text/Title'

import {
  REDIS_TOOLS_PASSWORD_MASK,
  REDIS_TOOLS_PASSWORD_PLACEHOLDER,
  REDIS_TOOLS_STEPS,
} from './RedisTools.constants'
import { InitTargetKind } from './RedisTools.types'
import { buildInitCommand, buildRadarUrl, resolveInitTarget } from './utils'
import * as S from './RedisTools.styles'

export const RedisTools = () => {
  const { t } = useTranslation()
  const { instanceId } = useParams<{ instanceId?: string }>()
  const connectedInstance = useAppSelector(connectedInstanceSelector)

  const [override, setOverride] = useState<{
    instanceId?: string
    value: boolean
  } | null>(null)
  const [isRevealed, setIsRevealed] = useState(false)
  const [password, setPassword] = useState<string | null>(null)
  const [settledInstanceId, setSettledInstanceId] = useState<string | null>(
    null,
  )

  // The store keeps the previous database until the new one has loaded.
  const isInstanceLoaded = !!instanceId && connectedInstance.id === instanceId
  const connectOverride =
    override && override.instanceId === instanceId ? override.value : null

  const initTarget = useMemo(
    () => (isInstanceLoaded ? resolveInitTarget(connectedInstance) : null),
    [isInstanceLoaded, connectedInstance],
  )
  const canConnectDatabase = !!initTarget
  const shouldConnect =
    canConnectDatabase &&
    (connectOverride ??
      connectedInstance.environment !== Environment.Production)
  const hasPassword =
    shouldConnect &&
    initTarget?.kind === InitTargetKind.Url &&
    initTarget.connection.hasPassword

  useEffect(() => {
    setPassword(null)
    setIsRevealed(false)
    setSettledInstanceId(null)

    if (!hasPassword || !instanceId) return undefined

    let isCancelled = false

    exportInstances([instanceId], true)
      .then((data) => {
        const [database] = (data ?? []) as unknown as { password?: string }[]
        if (!isCancelled) setPassword(database?.password ?? null)
      })
      .catch(() => {
        // The command keeps a password placeholder when the lookup fails.
      })
      .finally(() => {
        if (!isCancelled) setSettledInstanceId(instanceId)
      })

    return () => {
      isCancelled = true
    }
  }, [hasPassword, instanceId])

  const isPasswordPending = hasPassword && settledInstanceId !== instanceId

  const buildCommand = (passwordValue: string, shouldEncode: boolean) =>
    buildInitCommand(
      shouldConnect ? initTarget : null,
      passwordValue,
      shouldEncode,
    )

  const copyCommand = password
    ? buildCommand(password, true)
    : buildCommand(REDIS_TOOLS_PASSWORD_PLACEHOLDER, false)
  const displayCommand =
    isRevealed && password
      ? buildCommand(password, true)
      : buildCommand(
          isRevealed
            ? REDIS_TOOLS_PASSWORD_PLACEHOLDER
            : REDIS_TOOLS_PASSWORD_MASK,
          false,
        )

  return (
    <S.Container gap="l" data-testid="redis-tools-panel">
      <Col gap="s" grow={false}>
        <Text size="S" color="secondary">
          {t('redisTools.eyebrow')}
        </Text>
        <Title size="L" component="h2">
          {t('redisTools.title')}
        </Title>
        <Text size="M" color="secondary">
          {t('redisTools.cli.description')}
        </Text>
      </Col>

      {canConnectDatabase && (
        <Row grow={false}>
          <Checkbox
            id="redis-tools-connect-database"
            checked={shouldConnect}
            onCheckedChange={(checked) =>
              setOverride({ instanceId, value: checked === true })
            }
            label={t('redisTools.connectDatabase', {
              name: connectedInstance.name,
            })}
            data-testid="redis-tools-connect-database"
          />
        </Row>
      )}

      <S.CommandBox align="center" gap="m" grow={false}>
        <S.CommandText
          component="span"
          color="primary"
          data-testid="redis-tools-command"
        >
          {displayCommand}
        </S.CommandText>
        {hasPassword && (
          <IconButton
            icon={isRevealed ? HideIcon : ShowIcon}
            aria-label={t(
              isRevealed
                ? 'redisTools.password.hide'
                : 'redisTools.password.show',
            )}
            onClick={() => setIsRevealed((value) => !value)}
            disabled={isPasswordPending}
            data-testid="redis-tools-password-toggle"
          />
        )}
        <CopyButton
          copy={copyCommand}
          disabled={isPasswordPending}
          data-testid="redis-tools-copy"
        />
      </S.CommandBox>

      <Text size="S" color="secondary">
        {shouldConnect &&
          initTarget?.kind === InitTargetKind.Cloud &&
          `${t('redisTools.footnote.signIn')} `}
        {t('redisTools.footnote.requirements')}
      </Text>

      <S.StepsBox gap="l" wrap grow={false} data-testid="redis-tools-steps">
        {REDIS_TOOLS_STEPS.map(({ key, icon }) => (
          <Row key={key} align="center" gap="s" grow={false}>
            <Icon icon={icon} size="M" />
            <Text size="S">{t(key)}</Text>
          </Row>
        ))}
      </S.StepsBox>

      <Row gap="m" wrap grow={false}>
        <S.Card gap="m" data-testid="redis-tools-redvisor-card">
          <S.CardEyebrow align="center" justify="between" gap="s" grow={false}>
            <Text size="S" color="secondary">
              {t('redisTools.redvisor.eyebrow')}
            </Text>
            <RiBadge
              variant="light"
              label={t('redisTools.redvisor.badge')}
              data-testid="redis-tools-redvisor-badge"
            />
          </S.CardEyebrow>
          <Row align="center" gap="s" grow={false}>
            <Icon icon={AnalysisIcon} size="M" />
            <Title size="S" component="h3">
              {t('redisTools.redvisor.title')}
            </Title>
          </Row>
          <Text size="S" color="secondary">
            {t('redisTools.redvisor.description')}
          </Text>
        </S.Card>

        <S.Card gap="m" data-testid="redis-tools-radar-card">
          <S.CardEyebrow align="center" gap="s" grow={false}>
            <Text size="S" color="secondary">
              {t('redisTools.radar.eyebrow')}
            </Text>
          </S.CardEyebrow>
          <Row align="center" gap="s" grow={false}>
            <Icon icon={MetricsIcon} size="M" />
            <Title size="S" component="h3">
              {t('redisTools.radar.title')}
            </Title>
          </Row>
          <Text size="S" color="secondary">
            {t('redisTools.radar.description')}
          </Text>
          <Row grow={false}>
            <SecondaryButton
              filled
              size="small"
              icon={ArrowDiagonalIcon}
              iconSide="right"
              onClick={() =>
                window.open(buildRadarUrl(), '_blank', 'noopener,noreferrer')
              }
              data-testid="redis-tools-radar-link"
            >
              {t('redisTools.radar.button.open')}
            </SecondaryButton>
          </Row>
        </S.Card>
      </Row>
    </S.Container>
  )
}
