import React from 'react'
import { Breadcrumbs } from '@redis-ui/components'
import { useHistory, useParams } from 'react-router-dom'

import { Title } from 'uiSrc/components/base/text'
import { Pages } from 'uiSrc/constants'
import {
  RiSelect,
  RiSelectOption,
} from 'uiSrc/components/base/forms/select/RiSelect'

import * as S from './HeaderTitle.styles'

export interface HeaderTitleProps {
  indexName: string
  indexOptions: RiSelectOption[]
  onIndexChange: (value: string) => void
}

export const HeaderTitle = ({
  indexName,
  indexOptions,
  onIndexChange,
}: HeaderTitleProps) => {
  const { instanceId } = useParams<{ instanceId: string }>()
  const history = useHistory()

  const handleNavigateToList = () => {
    history.push(Pages.vectorSearch(instanceId))
  }

  return (
    <Breadcrumbs.Compose
      aria-label="Breadcrumb"
      data-testid="breadcrumb-search-indexes"
    >
      <Breadcrumbs.List>
        <Breadcrumbs.Item>
          <S.BreadcrumbLink
            as="a"
            onClick={handleNavigateToList}
            data-testid="breadcrumb-search-indexes-link"
          >
            <Title size="M" color="primary">
              Search indexes
            </Title>
          </S.BreadcrumbLink>
        </Breadcrumbs.Item>
        <Breadcrumbs.Item>
          <Breadcrumbs.Separator>
            <S.SlashSeparator>/</S.SlashSeparator>
          </Breadcrumbs.Separator>
        </Breadcrumbs.Item>
        <Breadcrumbs.Item>
          <Breadcrumbs.Current>
            <Title size="M" color="primary">
              Query index:
            </Title>
          </Breadcrumbs.Current>
        </Breadcrumbs.Item>
        <Breadcrumbs.Item>
          <RiSelect.Compose
            options={indexOptions}
            value={indexName}
            onChange={onIndexChange}
          >
            <RiSelect.Trigger.Compose customContainer>
              <S.IndexSelectTrigger
                as="button"
                data-testid="index-select-trigger"
              >
                <Title size="M" color="primary">
                  <RiSelect.Trigger.Value />
                </Title>
                <RiSelect.Trigger.Arrow />
              </S.IndexSelectTrigger>
            </RiSelect.Trigger.Compose>
            <RiSelect.Content
              searchable
              data-testid="breadcrumb-index-select"
            />
          </RiSelect.Compose>
        </Breadcrumbs.Item>
      </Breadcrumbs.List>
    </Breadcrumbs.Compose>
  )
}
