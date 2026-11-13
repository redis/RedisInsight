import React, { useMemo, useState } from 'react'
import { useParams } from 'react-router-dom'
import { Environment } from 'apiClient'

import { useTranslation } from 'uiSrc/i18n'
import { useAppSelector } from 'uiSrc/slices/hooks'
import { connectedInstanceSelector } from 'uiSrc/slices/instances/instances'
import { CopyButton } from 'uiSrc/components/copy-button'
import { RiBadge } from 'uiSrc/components/base/display/badge/RiBadge'
import { ButtonGroup } from 'uiSrc/components/base/forms/button-group/ButtonGroup'
import { Checkbox } from 'uiSrc/components/base/forms/checkbox/Checkbox'
import { SecondaryButton } from 'uiSrc/components/base/forms/buttons'
import {
  AnalysisIcon,
  ArrowDiagonalIcon,
  Icon,
  MetricsIcon,
} from 'uiSrc/components/base/icons'
import { Col, Row } from 'uiSrc/components/base/layout/flex'
import { Text } from 'uiSrc/components/base/text'
import { Title } from 'uiSrc/components/base/text/Title'

import {
  DEV_TOOLS_MODES,
  DEV_TOOLS_STEPS,
  DevToolsMode,
} from './DevTools.constants'
import { InitTargetKind } from './DevTools.types'
import { buildInitCommand, buildRadarUrl, resolveInitTarget } from './utils'
import * as S from './DevTools.styles'

export const DevTools = () => {
  const { t } = useTranslation()
  const { instanceId } = useParams<{ instanceId?: string }>()
  const connectedInstance = useAppSelector(connectedInstanceSelector)

  const [mode, setMode] = useState<DevToolsMode>(DevToolsMode.Agent)
  const [connectOverride, setConnectOverride] = useState<boolean | null>(null)

  const initTarget = useMemo(
    () => (instanceId ? resolveInitTarget(connectedInstance) : null),
    [instanceId, connectedInstance],
  )
  const canConnectDatabase = !!initTarget
  const shouldConnect =
    canConnectDatabase &&
    (connectOverride ??
      connectedInstance.environment !== Environment.Production)

  const command = useMemo(
    () => buildInitCommand(shouldConnect ? initTarget : null),
    [shouldConnect, initTarget],
  )
  const prompt = t('devTools.agent.prompt', { command })
  const isAgentMode = mode === DevToolsMode.Agent

  return (
    <S.Container gap="l" data-testid="dev-tools-panel">
      <Col gap="s">
        <Text size="S" color="secondary">
          {t('devTools.eyebrow')}
        </Text>
        <Title size="L" component="h2">
          {t('devTools.title')}
        </Title>
      </Col>

      <Row align="center" justify="between" gap="m" wrap>
        <ButtonGroup data-testid="dev-tools-mode">
          {DEV_TOOLS_MODES.map(({ value, labelKey, icon }) => (
            <ButtonGroup.Button
              key={value}
              isSelected={mode === value}
              onClick={() => setMode(value)}
              data-testid={`dev-tools-mode-${value}`}
            >
              <Icon icon={icon} size="M" color="currentColor" /> {t(labelKey)}
            </ButtonGroup.Button>
          ))}
        </ButtonGroup>
        {canConnectDatabase && (
          <Checkbox
            id="dev-tools-connect-database"
            checked={shouldConnect}
            onCheckedChange={(checked) => setConnectOverride(checked === true)}
            label={t('devTools.connectDatabase', {
              name: connectedInstance.name,
            })}
            data-testid="dev-tools-connect-database"
          />
        )}
      </Row>

      <Text size="M" color="secondary">
        {isAgentMode
          ? t('devTools.agent.description')
          : t('devTools.cli.description')}
      </Text>

      <S.CommandBox align="center" gap="m">
        {isAgentMode ? (
          <S.PromptText color="primary" data-testid="dev-tools-prompt">
            {prompt}
          </S.PromptText>
        ) : (
          <S.CommandText
            component="span"
            color="primary"
            data-testid="dev-tools-command"
          >
            {command}
          </S.CommandText>
        )}
        <CopyButton
          copy={isAgentMode ? prompt : command}
          data-testid="dev-tools-copy"
        />
      </S.CommandBox>

      {shouldConnect && initTarget?.kind === InitTargetKind.Url && (
        <Text
          size="S"
          color="warning"
          data-testid="dev-tools-credentials-notice"
        >
          {t('devTools.credentialsNotice')}
        </Text>
      )}

      <Text size="S" color="secondary">
        {shouldConnect &&
          initTarget?.kind === InitTargetKind.Cloud &&
          `${t('devTools.footnote.signIn')} `}
        {t('devTools.footnote.requirements')}
      </Text>

      <S.StepsBox gap="l" wrap data-testid="dev-tools-steps">
        {DEV_TOOLS_STEPS.map(({ key, icon }) => (
          <Row key={key} align="center" gap="s" grow={false}>
            <Icon icon={icon} size="M" />
            <Text size="S">{t(key)}</Text>
          </Row>
        ))}
      </S.StepsBox>

      <Row gap="m" wrap>
        <S.Card gap="s" data-testid="dev-tools-redvisor-card">
          <Row align="center" justify="between">
            <Text size="S" color="secondary">
              {t('devTools.redvisor.eyebrow')}
            </Text>
            <RiBadge
              variant="light"
              label={t('devTools.redvisor.badge')}
              data-testid="dev-tools-redvisor-badge"
            />
          </Row>
          <Row align="center" gap="s">
            <Icon icon={AnalysisIcon} size="M" />
            <Title size="S" component="h3">
              {t('devTools.redvisor.title')}
            </Title>
          </Row>
          <Text size="S" color="secondary">
            {t('devTools.redvisor.description')}
          </Text>
        </S.Card>

        <S.Card gap="s" data-testid="dev-tools-radar-card">
          <Text size="S" color="secondary">
            {t('devTools.radar.eyebrow')}
          </Text>
          <Row align="center" gap="s">
            <Icon icon={MetricsIcon} size="M" />
            <Title size="S" component="h3">
              {t('devTools.radar.title')}
            </Title>
          </Row>
          <Text size="S" color="secondary">
            {t('devTools.radar.description')}
          </Text>
          <Row>
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
