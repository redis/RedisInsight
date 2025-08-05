import React, { ChangeEvent } from 'react'
import { useDispatch, useSelector } from 'react-redux'

import cx from 'classnames'
import { localStorageService } from 'uiSrc/services'
import { BrowserStorageItem } from 'uiSrc/constants'
import {
  setAgreement,
  oauthCloudPAgreementSelector,
} from 'uiSrc/slices/oauth/cloud'

import { enableUserAnalyticsAction } from 'uiSrc/slices/user/user-settings'
import { RiCheckbox } from 'uiSrc/components/base/forms'
import { RiLink } from 'uiSrc/components/base/display'
import styles from './styles.module.scss'

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
    <div className={cx(styles.wrapper, { [styles.small]: size === 's' })}>
      <RiCheckbox
        id="ouath-agreement"
        name="agreement"
        label="By signing up, you acknowledge that you agree:"
        checked={agreement}
        onChange={handleCheck}
        className={styles.agreement}
        data-testid="oauth-agreement-checkbox"
      />
      <ul className={styles.list}>
        <li className={styles.listItem}>
          {'to our '}
          <RiLink
            color="subdued"
            href="https://redis.io/legal/cloud-tos/?utm_source=redisinsight&utm_medium=main&utm_campaign=main"
            className={styles.link}
            target="_blank"
            data-testid="ouath-agreements-cloud-terms-of-service"
          >
            Cloud Terms of Service
          </RiLink>
          {' and '}
          <RiLink
            color="subdued"
            href="https://redis.io/legal/privacy-policy/?utm_source=redisinsight&utm_medium=main&utm_campaign=main"
            className={styles.link}
            target="_blank"
            data-testid="oauth-agreement-privacy-policy"
          >
            Privacy Policy
          </RiLink>
        </li>
        <li className={styles.listItem}>
          that Redis Insight will generate Redis Cloud API account and user
          keys, and store them locally on your machine
        </li>
        <li className={styles.listItem}>
          that usage data will be enabled to help us understand and improve how
          Redis Insight features are used
        </li>
      </ul>
    </div>
  )
}

export default OAuthAgreement
