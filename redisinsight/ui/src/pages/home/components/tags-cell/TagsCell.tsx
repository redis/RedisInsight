/* eslint-disable arrow-body-style */
import React from 'react'

import { RiBadge, RiTooltip } from 'uiBase/display'
import { Tag } from 'uiSrc/slices/interfaces/tag'
import styles from './styles.module.scss'

type TagsCellProps = {
  tags: Tag[]
}

export const TagsCell = ({ tags }: TagsCellProps) => {
  if (!tags[0]) {
    return null
  }

  const firstTagText = `${tags[0].key} : ${tags[0].value}`
  const remainingTagsCount = tags.length - 1

  return (
    <div className={styles.tagsCell}>
      <RiBadge
        className={`${styles.tagBadge} ${styles.tagBadgeOverflow}`}
        label={firstTagText}
      />
      {remainingTagsCount > 0 && (
        <RiTooltip
          position="top"
          content={
            <div>
              {tags.slice(1).map((tag) => (
                <div key={tag.id}>
                  {tag.key} : {tag.value}
                </div>
              ))}
            </div>
          }
        >
          <RiBadge
            className={styles.tagBadge}
            label={`+${remainingTagsCount}`}
          />
        </RiTooltip>
      )}
    </div>
  )
}
