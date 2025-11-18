import React from 'react'

import { Text } from 'uiSrc/components/base/text'
import { FlexItem, Row } from 'uiSrc/components/base/layout/flex'
import { RiTooltip } from 'uiSrc/components'
import { DeleteIcon, EditIcon, Icon } from 'uiSrc/components/base/icons'
import {
  DestructiveButton,
  IconButton,
} from 'uiSrc/components/base/forms/buttons'
import ConfirmationPopover from 'uiSrc/pages/rdi/components/confirmation-popover/ConfirmationPopover'
import ValidationErrorsList from 'uiSrc/pages/rdi/pipeline-management/components/validation-errors-list/ValidationErrorsList'
import { Indicator } from 'uiSrc/components/base/text/text.styles'
import { ToastNotificationIcon } from '@redis-ui/icons'
import { truncateText } from 'uiSrc/utils'

type JobItemProps = {
  name: string
  isValid: boolean
  validationErrors: string[]
  isActive: boolean
  hasChanges: boolean
  onSelect: (name: string) => void
  onEdit: (name: string) => void
  onDelete: (name: string) => void
}

const JobItem = ({
  name,
  isValid,
  validationErrors,
  isActive,
  hasChanges,
  onSelect,
  onEdit,
  onDelete,
}: JobItemProps) => (
  <Row align="center" gap="s">
    <FlexItem>
      {!hasChanges && <Indicator $color="transparent" />}

      {hasChanges && (
        <RiTooltip
          content="This file contains undeployed changes."
          position="top"
        >
          <Indicator
            $color="informative"
            data-testid={`updated-file-${name}-highlight`}
          />
        </RiTooltip>
      )}
    </FlexItem>

    <FlexItem
      onClick={() => onSelect(name)}
      data-testid={`rdi-nav-job-${name}`}
      grow
    >
      <Row align="center" gap="m">
        <RiTooltip content={truncateText(name, 200)}>
          <Text
            style={{ textDecoration: isActive ? 'underline' : 'none' }}
            color={isActive ? 'primary' : 'secondary'}
          >
            {truncateText(name, 20)}
          </Text>
        </RiTooltip>

        {!isValid && (
          <RiTooltip
            position="right"
            content={
              <ValidationErrorsList validationErrors={validationErrors} />
            }
          >
            <Icon
              icon={ToastNotificationIcon}
              color="danger500"
              size="M"
              data-testid={`rdi-pipeline-nav__error-${name}`}
            />
          </RiTooltip>
        )}
      </Row>
    </FlexItem>

    <FlexItem>
      <Row data-testid={`rdi-nav-job-actions-${name}`} align="center">
        <RiTooltip content="Edit job file name" position="top">
          <IconButton
            icon={EditIcon}
            onClick={() => onEdit(name)}
            aria-label="edit job file name"
            data-testid={`edit-job-name-${name}`}
          />
        </RiTooltip>

        <RiTooltip
          content="Delete job"
          position="top"
          anchorClassName="flex-row"
        >
          <ConfirmationPopover
            title={`Delete ${name}`}
            body={
              <Text size="s">
                Changes will not be applied until the pipeline is deployed.
              </Text>
            }
            submitBtn={
              <DestructiveButton
                size="s"
                color="secondary"
                data-testid="delete-confirm-btn"
              >
                Delete
              </DestructiveButton>
            }
            onConfirm={() => onDelete(name)}
            button={
              <IconButton
                icon={DeleteIcon}
                aria-label="delete job"
                data-testid={`delete-job-${name}`}
              />
            }
          />
        </RiTooltip>
      </Row>
    </FlexItem>
  </Row>
)

export default JobItem
