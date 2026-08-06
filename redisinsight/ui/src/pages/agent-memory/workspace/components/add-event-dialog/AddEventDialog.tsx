import React, { useEffect, useState } from 'react'

import { FormDialog } from 'uiSrc/components'
import { Title } from 'uiSrc/components/base/text/Title'
import { Text } from 'uiSrc/components/base/text'
import { Col, FlexItem, Row } from 'uiSrc/components/base/layout/flex'
import { FormField } from 'uiSrc/components/base/forms/FormField'
import { TextInput } from 'uiSrc/components/base/inputs'
import TextArea from 'uiSrc/components/base/inputs/TextArea'
import {
  PrimaryButton,
  SecondaryButton,
} from 'uiSrc/components/base/forms/buttons'
import {
  defaultValueRender,
  RiSelect,
} from 'uiSrc/components/base/forms/select/RiSelect'
import { useAppSelector } from 'uiSrc/slices/hooks'
import { dispatch } from 'uiSrc/slices/store'
import { connectedAgentMemoryEndpointSelector } from 'uiSrc/slices/agentMemory/endpoints'
import {
  addSessionEventAction,
  agentMemoryFiltersSelector,
} from 'uiSrc/slices/agentMemory/workspace'
import {
  AGENT_MEMORY_EVENT_ROLES,
  AgentMemoryBackendType,
  CLOUD_AGENT_MEMORY_EVENT_ROLES,
} from 'uiSrc/slices/interfaces/agentMemory'

export interface AddEventDialogProps {
  endpointId: string
  isOpen: boolean
  onClose: () => void
}

/**
 * Append a message to a session's working memory - the server picks it up
 * for long-term extraction like any agent-written message. A new session
 * id creates the session and becomes the connected one.
 */
const AddEventDialog = ({
  endpointId,
  isOpen,
  onClose,
}: AddEventDialogProps) => {
  const { sessionId: currentSessionId } = useAppSelector(
    agentMemoryFiltersSelector,
  )
  const { backendType } = useAppSelector(connectedAgentMemoryEndpointSelector)

  const roleOptions = (
    backendType === AgentMemoryBackendType.Cloud
      ? CLOUD_AGENT_MEMORY_EVENT_ROLES
      : AGENT_MEMORY_EVENT_ROLES
  ).map((value) => ({ value, label: value }))
  const [sessionId, setSessionId] = useState('')
  const [role, setRole] = useState('user')
  const [content, setContent] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    if (isOpen) {
      setSessionId(currentSessionId ?? '')
      setContent('')
      setIsSubmitting(false)
    }
  }, [isOpen])

  const canSubmit = !!sessionId.trim() && !!content.trim() && !isSubmitting

  const handleSubmit = async () => {
    if (!canSubmit) return
    setIsSubmitting(true)
    await dispatch(
      addSessionEventAction(
        endpointId,
        { sessionId: sessionId.trim(), role, content: content.trim() },
        onClose,
      ),
    )
    setIsSubmitting(false)
  }

  return (
    <FormDialog
      isOpen={isOpen}
      onClose={onClose}
      header={<Title size="M">Add session event</Title>}
      footer={
        <Row justify="end" gap="m">
          <FlexItem>
            <SecondaryButton
              data-testid="add-event-cancel-button"
              onClick={onClose}
            >
              Cancel
            </SecondaryButton>
          </FlexItem>
          <FlexItem>
            <PrimaryButton
              data-testid="add-event-submit-button"
              disabled={!canSubmit}
              onClick={handleSubmit}
            >
              Add event
            </PrimaryButton>
          </FlexItem>
        </Row>
      }
    >
      <Col gap="l" data-testid="add-event-dialog">
        <Text color="secondary">
          Appends a message to the session's working memory - the server picks
          it up for long-term extraction like any agent-written message.
        </Text>
        <FormField label="Session" required>
          <TextInput
            name="add-event-session"
            data-testid="add-event-session-input"
            placeholder="session id (new or existing)"
            value={sessionId}
            onChange={(value) => setSessionId(value)}
          />
        </FormField>
        <FormField label="Role">
          <RiSelect
            data-testid="add-event-role-select"
            options={roleOptions}
            value={role}
            valueRender={defaultValueRender}
            onChange={(value) => setRole(value)}
          />
        </FormField>
        <FormField label="Content" required>
          <TextArea
            name="add-event-content"
            data-testid="add-event-content-input"
            placeholder="Message content…"
            rows={4}
            value={content}
            onChange={(value: string) => setContent(value)}
          />
        </FormField>
      </Col>
    </FormDialog>
  )
}

export default AddEventDialog
