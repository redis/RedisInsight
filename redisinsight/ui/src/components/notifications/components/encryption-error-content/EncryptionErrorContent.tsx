import React from 'react'
import { matchPath, useHistory, useLocation } from 'react-router-dom'
import { useTranslation } from 'uiSrc/i18n'
import { useAppDispatch } from 'uiSrc/slices/hooks'
import { Pages } from 'uiSrc/constants'
import { ColorText } from 'uiSrc/components/base/text'
import { updateUserConfigSettingsAction } from 'uiSrc/slices/user/user-settings'
import { FlexItem, Row } from 'uiSrc/components/base/layout/flex'
import { Spacer } from 'uiSrc/components/base/layout/spacer'
import {
  DestructiveButton,
  EmptyButton,
} from 'uiSrc/components/base/forms/buttons'

export interface Props {
  onClose?: () => void
  instanceId?: string
}

const EncryptionErrorContent = (props: Props) => {
  const { onClose, instanceId } = props
  const { pathname } = useLocation()
  const history = useHistory()
  const dispatch = useAppDispatch()
  const { t } = useTranslation()

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
        <b>{t('error.encryption.checkKeychain')}</b>
      </ColorText>
      <Spacer />
      <ColorText color="danger" style={{ fontWeight: 300 }}>
        {t('error.encryption.disableWarning')}
      </ColorText>
      <Spacer />
      <Row justify="end" gap="m">
        <FlexItem>
          <div>
            <DestructiveButton
              onClick={disableEncryption}
              className="toast-danger-btn euiBorderWidthThick"
              data-testid="toast-action-btn"
            >
              {t('error.encryption.disable')}
            </DestructiveButton>
          </div>
        </FlexItem>
        <FlexItem>
          <EmptyButton
            variant="destructive"
            onClick={onClose}
            data-testid="toast-cancel-btn"
            className="toast-danger-btn"
          >
            {t('error.encryption.cancel')}
          </EmptyButton>
        </FlexItem>
      </Row>
    </>
  )
}
export default EncryptionErrorContent
