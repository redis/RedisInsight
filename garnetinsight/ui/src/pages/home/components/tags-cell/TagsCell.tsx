import React from 'react'

import { Tag } from 'uiSrc/slices/interfaces/tag'
import { RiTooltip } from 'uiSrc/components'
import { Chip } from '@redis-ui/components'
import { Col, Row } from 'uiSrc/components/base/layout/flex'
import { Text } from 'uiSrc/components/base/text'

type TagsCellProps = {
  tags?: Tag[]
}

export const TagsCell = ({ tags }: TagsCellProps) => {
  if (!tags?.[0]) {
    return null
  }

  const firstTagText = `${tags[0].key} : ${tags[0].value}`
  const remainingTagsCount = tags.length - 1

  return (
    <Row gap="s">
      <Chip text={firstTagText} size="S" />
      {remainingTagsCount > 0 && (
        <RiTooltip
          position="top"
          content={
            <Col>
              {tags.slice(1).map((tag) => (
                <Text key={tag.id}>
                  {tag.key} : {tag.value}
                </Text>
              ))}
            </Col>
          }
        >
          <Chip text={`+${remainingTagsCount}`} size="S" />
        </RiTooltip>
      )}
    </Row>
  )
}
