import React, { useState } from 'react'
import type { Meta, StoryObj } from '@storybook/react-vite'
import { FieldTypes } from 'uiSrc/pages/browser/components/create-redisearch-index/constants'
import { RowSelectionState } from 'uiSrc/components/base/layout/table'
import { indexFieldFactory } from 'uiSrc/mocks/factories/redisearch/IndexField.factory'
import { Col } from 'uiSrc/components/base/layout/flex'
import { Text } from 'uiSrc/components/base/text'
import { Card, Spacer } from 'uiSrc/components/base/layout'
import { IndexDetails } from './IndexDetails'
import {
  IndexField,
  IndexDetailsMode,
  IndexDetailsProps,
} from './IndexDetails.types'

const SAMPLE_FIELDS: IndexField[] = [
  indexFieldFactory.build({ id: '1', type: FieldTypes.TEXT }),
  indexFieldFactory.build({ id: '2', type: FieldTypes.NUMERIC }),
  indexFieldFactory.build({ id: '3', type: FieldTypes.TAG }),
  indexFieldFactory.build({ id: '4', type: FieldTypes.GEO }),
  indexFieldFactory.build({ id: '5', type: FieldTypes.VECTOR }),
]

const handleFieldEdit = (field: IndexField) => {
  // eslint-disable-next-line no-alert
  alert(
    `Edit field: "${field.name}"\n\n` +
      `Current type: ${field.type.toUpperCase()}\n` +
      `Sample value: ${field.value}\n\n` +
      `In the real flow, a modal will appear here to edit the field type and settings.`,
  )
}

// Stateful wrapper for interactive stories (controlled component)
const IndexDetailsWrapper = (props: IndexDetailsProps) => {
  const [rowSelection, setRowSelection] = useState<RowSelectionState>(
    props.rowSelection || {},
  )

  const selectedFields = props.fields.filter((field) => rowSelection[field.id])
  const isEditable = props.mode === IndexDetailsMode.Editable

  return (
    <Col>
      <IndexDetails
        {...props}
        rowSelection={rowSelection}
        onRowSelectionChange={setRowSelection}
        onFieldEdit={handleFieldEdit}
      />

      {isEditable && (
        <>
          <Spacer size="l" />
          <Card>
            <Col gap="s">
              <Text size="L">Selected Fields ({selectedFields.length}):</Text>
              <Text
                size="S"
                color="secondary"
                style={{ maxHeight: '150px', overflow: 'auto' }}
              >
                <pre style={{ margin: 0 }}>
                  {JSON.stringify(
                    selectedFields.map((f) => ({
                      id: f.id,
                      name: f.name,
                      type: f.type,
                    })),
                    null,
                    2,
                  )}
                </pre>
              </Text>
              <Text size="S" color="ghost">
                Row Selection State: {JSON.stringify(rowSelection)}
              </Text>
            </Col>
          </Card>
        </>
      )}
    </Col>
  )
}

const meta: Meta<typeof IndexDetails> = {
  component: IndexDetails,
  tags: ['autodocs'],
  decorators: [
    (Story) => (
      <Col style={{ maxWidth: '800px' }}>
        <Story />
      </Col>
    ),
  ],
  render: (args) => <IndexDetailsWrapper {...args} />,
}

export default meta

type Story = StoryObj<typeof meta>

export const ReadonlyMode: Story = {
  args: {
    fields: SAMPLE_FIELDS,
    mode: IndexDetailsMode.Readonly,
  },
}

export const EditableMode: Story = {
  args: {
    fields: SAMPLE_FIELDS,
    mode: IndexDetailsMode.Editable,
  },
}

export const EmptyState: Story = {
  args: {
    fields: [],
    mode: IndexDetailsMode.Readonly,
  },
}
