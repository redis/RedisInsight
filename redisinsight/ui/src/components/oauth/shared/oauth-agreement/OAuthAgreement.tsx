import React, { ChangeEvent } from 'react'
import { useDispatch, useSelector } from 'react-redux'

import { localStorageService } from 'uiSrc/services'
import { BrowserStorageItem } from 'uiSrc/constants'
import {
  setAgreement,
  oauthCloudPAgreementSelector,
} from 'uiSrc/slices/oauth/cloud'

import { enableUserAnalyticsAction } from 'uiSrc/slices/user/user-settings'
import { Checkbox } from 'uiSrc/components/base/forms/checkbox/Checkbox'
import { Link } from 'uiSrc/components/base/link/Link'
import { Text } from 'uiSrc/components/base/text'

import * as S from '../../OAuth.styles'

export interface Props {
  size?: 's' | 'm'
}

const OAuthAgreement = (props: Props) => {
  const { size = 'm' } = props
  const agreement = useSelector(oauthCloudPAgreementSelector)

  const dispatch = useDispatch()

  const handleCheck = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) {
      dispatch(enableUserAnalyticsAction('oauth-agreement'))
    }
    dispatch(setAgreement(e.target.checked))
    localStorageService.set(BrowserStorageItem.OAuthAgreement, e.target.checked)
  }

  return (
    <S.AgreementWrapper $small={size === 's'}>
      <Checkbox
        id="ouath-agreement"
        name="agreement"
        label="By signing up, you acknowledge that you agree:"
        labelSize="M"
        checked={agreement}
        onChange={handleCheck}
        data-testid="oauth-agreement-checkbox"
      />
      <S.AgreementList>
        <S.AgreementListItem>
          <Text color="secondary" size="s">
            {'to our '}
            <Link
              variant="inline"
              size="S"
              color="subdued"
              href="https://redis.io/legal/cloud-tos/?utm_source=redisinsight&utm_medium=main&utm_campaign=main"
              target="_blank"
              data-testid="ouath-agreements-cloud-terms-of-service"
            >
              Cloud Terms of Service
            </Link>
            {' and '}
            <Link
              variant="inline"
              size="S"
              color="subdued"
              href="https://redis.io/legal/privacy-policy/?utm_source=redisinsight&utm_medium=main&utm_campaign=main"
              target="_blank"
              data-testid="oauth-agreement-privacy-policy"
            >
              Privacy Policy
            </Link>
          </Text>
        </S.AgreementListItem>
        <S.AgreementListItem>
          <Text color="secondary" size="s">
            that Redis Insight will generate Redis Cloud API account and user
            keys, and store them locally on your machine
          </Text>
        </S.AgreementListItem>
        <S.AgreementListItem>
          <Text color="secondary" size="s">
            that usage data will be enabled to help us understand and improve
            how Redis Insight features are used
          </Text>
        </S.AgreementListItem>
      </S.AgreementList>
    </S.AgreementWrapper>
  )
}

export default OAuthAgreement
