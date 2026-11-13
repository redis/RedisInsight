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
  DEV_TOOLS_PASSWORD_MASK,
  DEV_TOOLS_PASSWORD_PLACEHOLDER,
  DEV_TOOLS_STEPS,
} from './DevTools.constants'
import { InitTargetKind } from './DevTools.types'
import { buildInitCommand, buildRadarUrl, resolveInitTarget } from './utils'
import * as S from './DevTools.styles'

export const DevTools = () => {
  const { t } = useTranslation()
  const { instanceId } = useParams<{ instanceId?: string }>()
  const connectedInstance = useAppSelector(connectedInstanceSelector)

  const [connectOverride, setConnectOverride] = useState<boolean | null>(null)
  const [isRevealed, setIsRevealed] = useState(false)
  const [password, setPassword] = useState<string | null>(null)

  const initTarget = useMemo(
    () => (instanceId ? resolveInitTarget(connectedInstance) : null),
    [instanceId, connectedInstance],
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

    return () => {
      isCancelled = true
    }
  }, [hasPassword, instanceId])

  const buildCommand = (passwordValue: string, shouldEncode: boolean) =>
    buildInitCommand(
      shouldConnect ? initTarget : null,
      passwordValue,
      shouldEncode,
    )

  const copyCommand = password
    ? buildCommand(password, true)
    : buildCommand(DEV_TOOLS_PASSWORD_PLACEHOLDER, false)
  const displayCommand =
    isRevealed && password
      ? buildCommand(password, true)
      : buildCommand(
          isRevealed ? DEV_TOOLS_PASSWORD_PLACEHOLDER : DEV_TOOLS_PASSWORD_MASK,
          false,
        )

  return (
    <S.Container gap="l" data-testid="dev-tools-panel">
      <Col gap="s" grow={false}>
        <Text size="S" color="secondary">
          {t('devTools.eyebrow')}
        </Text>
        <Title size="L" component="h2">
          {t('devTools.title')}
        </Title>
        <Text size="M" color="secondary">
          {t('devTools.cli.description')}
        </Text>
      </Col>

      {canConnectDatabase && (
        <Row grow={false}>
          <Checkbox
            id="dev-tools-connect-database"
            checked={shouldConnect}
            onCheckedChange={(checked) => setConnectOverride(checked === true)}
            label={t('devTools.connectDatabase', {
              name: connectedInstance.name,
            })}
            data-testid="dev-tools-connect-database"
          />
        </Row>
      )}

      <S.CommandBox align="center" gap="m" grow={false}>
        <S.CommandText
          component="span"
          color="primary"
          data-testid="dev-tools-command"
        >
          {displayCommand}
        </S.CommandText>
        {hasPassword && (
          <IconButton
            icon={isRevealed ? HideIcon : ShowIcon}
            aria-label={t(
              isRevealed ? 'devTools.password.hide' : 'devTools.password.show',
            )}
            onClick={() => setIsRevealed((value) => !value)}
            data-testid="dev-tools-password-toggle"
          />
        )}
        <CopyButton copy={copyCommand} data-testid="dev-tools-copy" />
      </S.CommandBox>

      <Text size="S" color="secondary">
        {shouldConnect &&
          initTarget?.kind === InitTargetKind.Cloud &&
          `${t('devTools.footnote.signIn')} `}
        {t('devTools.footnote.requirements')}
      </Text>

      <S.StepsBox gap="l" wrap grow={false} data-testid="dev-tools-steps">
        {DEV_TOOLS_STEPS.map(({ key, icon }) => (
          <Row key={key} align="center" gap="s" grow={false}>
            <Icon icon={icon} size="M" />
            <Text size="S">{t(key)}</Text>
          </Row>
        ))}
      </S.StepsBox>

      <Row gap="m" wrap grow={false}>
        <S.Card gap="m" data-testid="dev-tools-redvisor-card">
          <S.CardEyebrow align="center" justify="between" gap="s" grow={false}>
            <Text size="S" color="secondary">
              {t('devTools.redvisor.eyebrow')}
            </Text>
            <RiBadge
              variant="light"
              label={t('devTools.redvisor.badge')}
              data-testid="dev-tools-redvisor-badge"
            />
          </S.CardEyebrow>
          <Row align="center" gap="s" grow={false}>
            <Icon icon={AnalysisIcon} size="M" />
            <Title size="S" component="h3">
              {t('devTools.redvisor.title')}
            </Title>
          </Row>
          <Text size="S" color="secondary">
            {t('devTools.redvisor.description')}
          </Text>
        </S.Card>

        <S.Card gap="m" data-testid="dev-tools-radar-card">
          <S.CardEyebrow align="center" gap="s" grow={false}>
            <Text size="S" color="secondary">
              {t('devTools.radar.eyebrow')}
            </Text>
          </S.CardEyebrow>
          <Row align="center" gap="s" grow={false}>
            <Icon icon={MetricsIcon} size="M" />
            <Title size="S" component="h3">
              {t('devTools.radar.title')}
            </Title>
          </Row>
          <Text size="S" color="secondary">
            {t('devTools.radar.description')}
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
              data-testid="dev-tools-radar-link"
            >
              {t('devTools.radar.button.open')}
            </SecondaryButton>
          </Row>
        </S.Card>
      </Row>
    </S.Container>
  )
}
