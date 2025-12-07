import React from 'react'
import { render, screen } from 'uiSrc/utils/test-utils'
import { Tag } from 'uiSrc/slices/interfaces/tag'
import { TagsCell } from './TagsCell'

const tags: Tag[] = [
  {
    id: '1',
    key: 'env',
    value: 'prod',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: '2',
    key: 'version',
    value: '1.0',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
]

describe('TagsCell', () => {
  it('should render the first tag and the count of remaining tags', () => {
    render(<TagsCell tags={tags} />)
    expect(screen.getByText('env : prod')).toBeInTheDocument()
    expect(screen.getByText('+1')).toBeInTheDocument()
  })

  it('should render null if no tags are provided', () => {
    const { container } = render(<TagsCell tags={[]} />)
    expect(container.firstChild).toBeNull()
  })
})
