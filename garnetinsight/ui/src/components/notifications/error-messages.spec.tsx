import React from 'react'
import { handleDownloadButton } from 'uiSrc/utils'
import { NotificationTextLengthThreshold } from 'uiSrc/components/notifications/constants'
import ERROR_MESSAGES from './error-messages'

jest.mock('uiSrc/utils', () => ({
  ...jest.requireActual('uiSrc/utils'),
  handleDownloadButton: jest.fn(),
}))

describe('ERROR_MESSAGES', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('DEFAULT', () => {
    it('should return error notification with correct data-testid', () => {
      const result = ERROR_MESSAGES.DEFAULT('Error text')

      expect(result['data-testid']).toBe('toast-error')
    })

    it('should return error notification with default title', () => {
      const result = ERROR_MESSAGES.DEFAULT('Error text')

      expect(result.message).toBe('Error')
    })

    it('should return error notification with custom title', () => {
      const customTitle = 'Custom Error Title'
      const result = ERROR_MESSAGES.DEFAULT('Error text', () => {}, customTitle)

      expect(result.message).toBe(customTitle)
    })

    it('should have customIcon property', () => {
      const result = ERROR_MESSAGES.DEFAULT('Error text')

      expect(result.customIcon).toBeDefined()
    })

    it('should have description for short messages', () => {
      const shortText = 'Short error message'
      const result = ERROR_MESSAGES.DEFAULT(shortText)

      expect(result.description).toBeDefined()
    })

    it('should not have description for long messages', () => {
      const longText = 'a'.repeat(NotificationTextLengthThreshold + 1)
      const result = ERROR_MESSAGES.DEFAULT(longText)

      expect(result.description).toBeUndefined()
    })

    it('should have description for non-string text', () => {
      const objectText = { error: 'some error' }
      const result = ERROR_MESSAGES.DEFAULT(objectText)

      expect(result.description).toBeDefined()
    })

    it('should have download button action for long messages', () => {
      const longText = 'a'.repeat(NotificationTextLengthThreshold + 1)
      const result = ERROR_MESSAGES.DEFAULT(longText)

      expect(result.actions.secondary).toBeDefined()
      expect(result.actions.secondary?.label).toBe('Download full log')
      expect(result.actions.secondary?.closes).toBe(true)
    })

    it('should not have download button action for short messages', () => {
      const shortText = 'Short error message'
      const result = ERROR_MESSAGES.DEFAULT(shortText)

      expect(result.actions.secondary).toBeUndefined()
    })

    it('should call handleDownloadButton when download action is clicked', () => {
      const longText = 'a'.repeat(NotificationTextLengthThreshold + 1)
      const onClose = jest.fn()
      const result = ERROR_MESSAGES.DEFAULT(longText, onClose)

      result.actions.secondary?.onClick?.()

      expect(handleDownloadButton).toHaveBeenCalledWith(
        longText,
        'error-log.txt',
        onClose,
      )
    })

    it('should handle onClick when it is undefined', () => {
      const longText = 'a'.repeat(NotificationTextLengthThreshold + 1)
      const result = ERROR_MESSAGES.DEFAULT(longText)

      expect(result.actions.secondary?.onClick).toBeDefined()
    })
  })

  describe('ENCRYPTION', () => {
    it('should return encryption error notification with correct data-testid', () => {
      const result = ERROR_MESSAGES.ENCRYPTION()

      expect(result['data-testid']).toBe('toast-error-encryption')
    })

    it('should return encryption error notification with correct message', () => {
      const result = ERROR_MESSAGES.ENCRYPTION()

      expect(result.message).toBe('Unable to decrypt')
    })

    it('should have customIcon property', () => {
      const result = ERROR_MESSAGES.ENCRYPTION()

      expect(result.customIcon).toBeDefined()
    })

    it('should have showCloseButton set to false', () => {
      const result = ERROR_MESSAGES.ENCRYPTION()

      expect(result.showCloseButton).toBe(false)
    })

    it('should have description defined', () => {
      const result = ERROR_MESSAGES.ENCRYPTION()

      expect(result.description).toBeDefined()
    })

    it('should work with instanceId parameter', () => {
      const instanceId = 'test-instance-123'
      const result = ERROR_MESSAGES.ENCRYPTION(() => {}, instanceId)

      expect(result.description).toBeDefined()
    })

    it('should work with default parameters', () => {
      const result = ERROR_MESSAGES.ENCRYPTION()

      expect(result.description).toBeDefined()
      expect(result.showCloseButton).toBe(false)
    })
  })

  describe('CLOUD_CAPI_KEY_UNAUTHORIZED', () => {
    it('should return cloud capi unauthorized error with correct data-testid', () => {
      const result = ERROR_MESSAGES.CLOUD_CAPI_KEY_UNAUTHORIZED(
        { message: 'Unauthorized' },
        {},
        () => {},
      )

      expect(result['data-testid']).toBe(
        'toast-error-cloud-capi-key-unauthorized',
      )
    })

    it('should have customIcon property', () => {
      const result = ERROR_MESSAGES.CLOUD_CAPI_KEY_UNAUTHORIZED(
        { message: 'Unauthorized' },
        {},
        () => {},
      )

      expect(result.customIcon).toBeDefined()
    })

    it('should have showCloseButton set to false', () => {
      const result = ERROR_MESSAGES.CLOUD_CAPI_KEY_UNAUTHORIZED(
        { message: 'Unauthorized' },
        {},
        () => {},
      )

      expect(result.showCloseButton).toBe(false)
    })

    it('should return error notification with title', () => {
      const title = 'Unauthorized Error'
      const result = ERROR_MESSAGES.CLOUD_CAPI_KEY_UNAUTHORIZED(
        { message: 'Unauthorized', title },
        {},
        () => {},
      )

      expect(result.message).toBe(title)
    })

    it('should have description defined', () => {
      const message = 'Unauthorized access'
      const result = ERROR_MESSAGES.CLOUD_CAPI_KEY_UNAUTHORIZED(
        { message },
        {},
        () => {},
      )

      expect(result.description).toBeDefined()
    })

    it('should work with resourceId in additionalInfo', () => {
      const message = 'Unauthorized access'
      const resourceId = 'resource-123'
      const result = ERROR_MESSAGES.CLOUD_CAPI_KEY_UNAUTHORIZED(
        { message },
        { resourceId },
        () => {},
      )

      expect(result.description).toBeDefined()
    })

    it('should handle JSX Element as message', () => {
      const jsxMessage = <span>Custom JSX Error</span>
      const result = ERROR_MESSAGES.CLOUD_CAPI_KEY_UNAUTHORIZED(
        { message: jsxMessage },
        {},
        () => {},
      )

      expect(result.description).toBeDefined()
    })

    it('should work without title', () => {
      const message = 'Unauthorized access'
      const result = ERROR_MESSAGES.CLOUD_CAPI_KEY_UNAUTHORIZED(
        { message },
        {},
        () => {},
      )

      expect(result.message).toBeUndefined()
    })
  })

  describe('RDI_DEPLOY_PIPELINE', () => {
    it('should return rdi deploy error with correct data-testid', () => {
      const result = ERROR_MESSAGES.RDI_DEPLOY_PIPELINE(
        { message: 'Deploy failed' },
        () => {},
      )

      expect(result['data-testid']).toBe('toast-error-deploy')
    })

    it('should have customIcon property', () => {
      const result = ERROR_MESSAGES.RDI_DEPLOY_PIPELINE(
        { message: 'Deploy failed' },
        () => {},
      )

      expect(result.customIcon).toBeDefined()
    })

    it('should return error notification with title', () => {
      const title = 'Deployment Error'
      const result = ERROR_MESSAGES.RDI_DEPLOY_PIPELINE(
        { title, message: 'Deploy failed' },
        () => {},
      )

      expect(result.message).toBe(title)
    })

    it('should pass onClose callback', () => {
      const onClose = jest.fn()
      const result = ERROR_MESSAGES.RDI_DEPLOY_PIPELINE(
        { message: 'Deploy failed' },
        onClose,
      )

      expect(result.onClose).toBe(onClose)
    })

    it('should have description defined', () => {
      const message = 'Deploy failed'
      const result = ERROR_MESSAGES.RDI_DEPLOY_PIPELINE({ message }, () => {})

      expect(result.description).toBeDefined()
    })

    it('should work without title', () => {
      const message = 'Deploy failed'
      const result = ERROR_MESSAGES.RDI_DEPLOY_PIPELINE({ message }, () => {})

      expect(result.message).toBeUndefined()
      expect(result.description).toBeDefined()
    })
  })
})
