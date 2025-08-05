import React from 'react'
import { matchPath, useHistory, useLocation } from 'react-router-dom'
import { useDispatch } from 'react-redux'
import { Pages } from 'uiSrc/constants'
import { ColorText } from 'uiSrc/components/base/text'
import { updateUserConfigSettingsAction } from 'uiSrc/slices/user/user-settings'
import { FlexItem, Row } from 'uiSrc/components/base/layout/flex'
import { Spacer } from 'uiSrc/components/base/layout/spacer'
import { RiDestructiveButton, RiEmptyButton } from 'uiSrc/components/base/forms'

export interface Props {
  onClose?: () => void
  instanceId?: string
}

// TODO: use i18n file for texts
const EncryptionErrorContent = (props: Props) => {
  const { onClose, instanceId } = props
  const { pathname } = useLocation()
  const history = useHistory()
  const dispatch = useDispatch()

  // useParams() hook can't be used because the Notifications component is outside of the MainRouter
  const getInstanceIdFromUrl = (): string => {
    const path = '/:instanceId/(browser|workbench)/'
    const match: any = matchPath(pathname, { path })
    return match?.params?.instanceId
  }

  const disableEncryption = () => {
    const iId = instanceId || getInstanceIdFromUrl()
    dispatch(
      updateUserConfigSettingsAction({ agreements: { encryption: false } }),
    )
    if (instanceId) {
      history.push(Pages.homeEditInstance(iId))
    }
    if (onClose) {
      onClose()
    }
  }
  return (
    <>
      <ColorText color="danger">
        <b>Check the system keychain or disable encryption to proceed.</b>
      </ColorText>
      <Spacer />
      <ColorText color="danger" style={{ fontWeight: 300 }}>
        Disabling encryption will result in storing sensitive information
        locally in plain text. Re-enter database connection information to work
        with databases.
      </ColorText>
      <Spacer />
      <Row justify="end" gap="m">
        <FlexItem>
          <div>
            <RiDestructiveButton
              onClick={disableEncryption}
              className="toast-danger-btn euiBorderWidthThick"
              data-testid="toast-action-btn"
            >
              Disable Encryption
            </RiDestructiveButton>
          </div>
        </FlexItem>
        <FlexItem>
          <RiEmptyButton
            variant="destructive"
            onClick={onClose}
            data-testid="toast-cancel-btn"
            className="toast-danger-btn"
          >
            Cancel
          </RiEmptyButton>
        </FlexItem>
      </Row>
    </>
  )
}
export default EncryptionErrorContent
