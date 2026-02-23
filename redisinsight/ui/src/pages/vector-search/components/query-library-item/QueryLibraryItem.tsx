import React, { useCallback } from 'react'

import { RiBadge } from 'uiSrc/components/base/display/badge/RiBadge'
import { RiTooltip } from 'uiSrc/components/base/tooltip'
import { CopyButton } from 'uiSrc/components/copy-button'
import { EmptyButton, IconButton } from 'uiSrc/components/base/forms/buttons'
import {
  ChevronDownIcon,
  DeleteIcon,
  PlayFilledIcon,
  ChevronRightIcon,
} from 'uiSrc/components/base/icons'
import { truncateText } from 'uiSrc/utils'
import { CommandView } from 'uiSrc/pages/vector-search/components/command-view'

import { QueryLibraryItemProps } from './QueryLibraryItem.types'
import { QUERY_TYPE_BADGE_MAP } from './QueryLibraryItem.constants'
import * as S from './QueryLibraryItem.styles'
import { Row } from 'uiSrc/components/base/layout/flex'

export const QueryLibraryItem = ({
  id,
  name,
  type,
  query,
  description,
  isOpen = false,
  onToggleOpen,
  onRun,
  onLoad,
  onDelete,
  dataTestId = 'query-library-item',
}: QueryLibraryItemProps) => {
  const badgeConfig = QUERY_TYPE_BADGE_MAP[type]

  const handleToggle = useCallback(() => {
    onToggleOpen?.(id)
  }, [id, onToggleOpen])

  const handleRun = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation()
      onRun?.(id)
    },
    [id, onRun],
  )

  const handleLoad = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation()
      onLoad?.(id)
    },
    [id, onLoad],
  )

  const handleDelete = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation()
      onDelete?.(id)
    },
    [id, onDelete],
  )

  return (
    <S.Container data-testid={dataTestId}>
      <S.Header
        $isOpen={isOpen}
        onClick={handleToggle}
        aria-expanded={isOpen}
        data-testid={`${dataTestId}-header`}
        align="center"
        justify="between"
        gap="m"
        grow
      >
        <S.HeaderInfo gap="m" align="center">
          <S.Name color="primary" data-testid={`${dataTestId}-name`}>
            <RiTooltip position="bottom" content={truncateText(name, 500)}>
              {name}
            </RiTooltip>
            <S.CopyButtonWrapper>
              <CopyButton
                copy={name || ''}
                aria-label="Copy query"
                data-testid={`${dataTestId}-copy`}
              />
            </S.CopyButtonWrapper>
          </S.Name>
          {description && (
            <S.Description
              color="informative"
              size="s"
              data-testid={`${dataTestId}-description`}
            >
              <RiTooltip
                position="bottom"
                content={truncateText(description, 500)}
              >
                {description}
              </RiTooltip>
            </S.Description>
          )}
          <S.BadgeWrapper>
            <RiBadge
              label={badgeConfig.label}
              variant={badgeConfig.variant}
              data-testid={`${dataTestId}-type-badge`}
            />
          </S.BadgeWrapper>
        </S.HeaderInfo>

        <Row gap="s" align="center" grow={false}>
          {onDelete && (
            <IconButton
              icon={DeleteIcon}
              onClick={handleDelete}
              aria-label="Delete query"
              data-testid={`${dataTestId}-delete-btn`}
            />
          )}
          {onLoad && (
            <EmptyButton
              onClick={handleLoad}
              aria-label="Load query"
              data-testid={`${dataTestId}-load-btn`}
            >
              Load
            </EmptyButton>
          )}
          {onRun && (
            <EmptyButton
              icon={PlayFilledIcon}
              onClick={handleRun}
              aria-label="Run query"
              data-testid={`${dataTestId}-run-btn`}
            >
              Run
            </EmptyButton>
          )}
        </Row>
        <S.ChevronWrapper grow={false}>
          {isOpen ? (
            <ChevronDownIcon size="M" />
          ) : (
            <ChevronRightIcon size="M" />
          )}
        </S.ChevronWrapper>
      </S.Header>

      {isOpen && (
        <S.Body data-testid={`${dataTestId}-body`}>
          <CommandView
            command={query}
            dataTestId={`${dataTestId}-command-view`}
          />
        </S.Body>
      )}
    </S.Container>
  )
}
