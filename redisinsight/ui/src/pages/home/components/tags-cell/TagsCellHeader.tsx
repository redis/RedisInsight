import React, { memo } from 'react'
import { Spacer } from 'uiSrc/components/base/layout/spacer'
import { FormField } from 'uiSrc/components/base/forms/FormField'
import { RiPopover } from 'uiSrc/components/base'
import { SearchInput } from 'uiSrc/components/base/inputs'
import { Row } from 'uiSrc/components/base/layout/flex'
import { COLUMN_FIELD_NAME_MAP, DatabaseListColumn } from 'uiSrc/constants'

import { useFilterTags } from './useFilterTags'
import * as S from './TagsCellHeader.styles'

const headerText = COLUMN_FIELD_NAME_MAP.get(DatabaseListColumn.Tags)

export const TagsCellHeader = memo(() => {
  const {
    isPopoverOpen,
    tagSearch,
    tagsData,
    selectedTags,
    setTagSearch,
    onPopoverToggle,
    onTagChange,
    onKeyChange,
    groupedTags,
  } = useFilterTags()

  if (!tagsData.length) {
    return <Row centered>{headerText}</Row>
  }

  return (
    <Row centered>
      {headerText}
      <RiPopover
        button={
          <S.FilterByTagIcon
            role="button"
            type="FilterTableIcon"
            size="l"
            onClick={(e) => {
              e.stopPropagation()
              onPopoverToggle()
            }}
          />
        }
        isOpen={isPopoverOpen}
        closePopover={onPopoverToggle}
        anchorPosition="downCenter"
      >
        {/* stop propagation to prevent sorting by column header */}
        {/* eslint-disable-next-line jsx-a11y/click-events-have-key-events, jsx-a11y/no-static-element-interactions */}
        <div style={{ width: 300 }} onClick={(e) => e.stopPropagation()}>
          <FormField>
            <SearchInput
              data-testid="tag-search"
              placeholder="Enter tag key or value"
              value={tagSearch}
              onChange={(value) => {
                setTagSearch(value)
              }}
            />
          </FormField>
          <Spacer size="m" />
          {Object.keys(groupedTags).map((key) => (
            <div key={key}>
              <S.FilterTagCheckbox
                id={key}
                label={key}
                checked={groupedTags[key].every((value) =>
                  selectedTags.has(`${key}:${value}`),
                )}
                onChange={(event) => {
                  onKeyChange(key, event.target.checked)
                }}
              />
              {groupedTags[key].map((value) => (
                <div key={value} style={{ margin: '10px 0 0 20px' }}>
                  <S.FilterTagCheckbox
                    id={`${key}:${value}`}
                    data-testid={`${key}:${value}`}
                    label={value}
                    checked={selectedTags.has(`${key}:${value}`)}
                    onChange={(event) => {
                      onTagChange(`${key}:${value}`, event.target.checked)
                    }}
                  />
                </div>
              ))}
            </div>
          ))}
        </div>
      </RiPopover>
    </Row>
  )
})
