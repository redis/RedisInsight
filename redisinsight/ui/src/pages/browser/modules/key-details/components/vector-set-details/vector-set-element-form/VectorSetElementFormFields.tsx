import React from 'react'

import AddMultipleFields from 'uiSrc/pages/browser/components/add-multiple-fields'
import { Col, FlexItem, Row } from 'uiSrc/components/base/layout/flex'
import { IconButton, ToggleButton } from 'uiSrc/components/base/forms/buttons'
import { FormField } from 'uiSrc/components/base/forms/FormField'
import { TextInput } from 'uiSrc/components/base/inputs'
import { Text } from 'uiSrc/components/base/text'
import { ChevronDownIcon, ChevronRightIcon } from 'uiSrc/components/base/icons'

import { EntryContent } from 'uiSrc/pages/browser/modules/key-details/components/common/AddKeysContainer.styled'
import { AttributeEditor } from '../attribute-editor'
import { UseVectorSetElementFormResult } from '../hooks/useVectorSetElementForm/useVectorSetElementForm.types'
import { getVectorFieldInfo } from './utils'

export interface VectorSetElementFormFieldsProps
  extends UseVectorSetElementFormResult {
  loading: boolean
}

const VectorSetElementFormFields = ({
  elements,
  lastAddedNameRef,
  addElement,
  onClickRemove,
  handleFieldChange,
  toggleAttributes,
  isClearDisabled,
  getDimForElement,
  loading,
}: VectorSetElementFormFieldsProps) => (
  <EntryContent>
    <AddMultipleFields
      items={elements}
      isClearDisabled={isClearDisabled}
      onClickRemove={onClickRemove}
      onClickAdd={addElement}
    >
      {(item, index) => {
        const rowVectorDim = getDimForElement(index)
        const vectorInfo = getVectorFieldInfo(item.vector, rowVectorDim)

        return (
          <Col gap="s">
            <Row align="start" gap="m">
              <FlexItem grow>
                <FormField additionalText="Unique identifier for this vector.">
                  <TextInput
                    required
                    aria-required="true"
                    name={`element-name-${item.id}`}
                    id={`element-name-${item.id}`}
                    placeholder="Enter Element Name"
                    value={item.name}
                    onChange={(value) =>
                      handleFieldChange('name', item.id, value)
                    }
                    ref={
                      index === elements.length - 1 ? lastAddedNameRef : null
                    }
                    disabled={loading}
                    data-testid="element-name"
                  />
                </FormField>
              </FlexItem>
              <FlexItem grow>
                <FormField additionalText={vectorInfo.text}>
                  <TextInput
                    required
                    aria-required="true"
                    name={`element-vector-${item.id}`}
                    id={`element-vector-${item.id}`}
                    placeholder={
                      rowVectorDim !== undefined
                        ? `Enter Vector (${rowVectorDim} dimensions)`
                        : 'Enter Vector'
                    }
                    value={item.vector}
                    onChange={(value) =>
                      handleFieldChange('vector', item.id, value)
                    }
                    disabled={loading}
                    error={vectorInfo.isError ? vectorInfo.text : undefined}
                    data-testid="element-vector"
                  />
                </FormField>
              </FlexItem>
            </Row>

            <Row align="center" gap="s">
              <ToggleButton
                onPressedChange={() => toggleAttributes(item.id)}
                pressed={item.showAttributes}
                data-testid="toggle-attributes-btn"
              >
                <Text>Add attributes </Text>
                <IconButton
                  icon={
                    item.showAttributes ? ChevronDownIcon : ChevronRightIcon
                  }
                />
              </ToggleButton>{' '}
              <Text color="secondary">(Optional)</Text>
            </Row>
            {item.showAttributes && (
              <AttributeEditor
                value={item.attributes}
                onChange={(val: string) =>
                  handleFieldChange('attributes', item.id, val)
                }
                isInEditMode={!loading}
                height="120px"
                testId="element-attributes"
              />
            )}
          </Col>
        )
      }}
    </AddMultipleFields>
  </EntryContent>
)

export default VectorSetElementFormFields
