import React, { memo } from 'react'

import { RiSpacer } from 'uiBase/layout/spacer'
import { RiFormField, RiCheckbox } from 'uiBase/forms'
import { RiIcon } from 'uiBase/icons'
import { RiPopover } from 'uiBase/display'
import { RiSearchInput } from 'uiBase/inputs'
import { useFilterTags } from './useFilterTags'
import styles from './styles.module.scss'

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
    return <div>Tags</div>
  }

  return (
    <div>
      Tags{' '}
      <RiPopover
        button={
          <RiIcon
            role="button"
            type="FilterIcon"
            size="m"
            className={styles.filterByTagIcon}
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
          <RiFormField>
            <RiSearchInput
              data-testid="tag-search"
              placeholder="Enter tag key or value"
              value={tagSearch}
              onChange={(value) => {
                setTagSearch(value)
              }}
            />
          </RiFormField>
          <RiSpacer size="m" />
          {Object.keys(groupedTags).map((key) => (
            <div key={key}>
              <RiCheckbox
                id={key}
                className={styles.filterTagLabel}
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
                  <RiCheckbox
                    id={`${key}:${value}`}
                    className={styles.filterTagLabel}
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
    </div>
  )
})
