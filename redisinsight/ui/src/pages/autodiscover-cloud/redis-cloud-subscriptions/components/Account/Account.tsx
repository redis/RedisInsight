import React from 'react'
import { LoadingContent } from 'uiSrc/components/base/layout'
import { ColorText } from 'uiSrc/components/base/text'
import { useTranslation } from 'uiSrc/i18n'

import * as S from './Account.style'
import { type AccountProps, type AccountValueProps } from './Account.types'

const AccountValue = ({ value, ...rest }: AccountValueProps) => {
  if (!value) {
    return (
      <S.LoadingWrapper>
        <LoadingContent lines={1} />
      </S.LoadingWrapper>
    )
  }

  return (
    <ColorText color="primary" size="M" {...rest}>
      {value}
    </ColorText>
  )
}

export const Account = ({
  account: { accountId, accountName, ownerEmail, ownerName },
}: AccountProps) => {
  const { t } = useTranslation()

  return (
    <S.AccountWrapper>
      {accountId && (
        <S.AccountItem>
          <S.AccountItemTitle>
            {t('autodiscover.cloud.account.accountId')}
          </S.AccountItemTitle>
          <AccountValue data-testid="account-id" value={accountId} />
        </S.AccountItem>
      )}
      {accountName && (
        <S.AccountItem>
          <S.AccountItemTitle>
            {t('autodiscover.cloud.account.name')}
          </S.AccountItemTitle>
          <AccountValue data-testid="account-name" value={accountName} />
        </S.AccountItem>
      )}
      {ownerName && (
        <S.AccountItem>
          <S.AccountItemTitle>
            {t('autodiscover.cloud.account.ownerName')}
          </S.AccountItemTitle>
          <AccountValue data-testid="account-owner-name" value={ownerName} />
        </S.AccountItem>
      )}
      {ownerEmail && (
        <S.AccountItem>
          <S.AccountItemTitle>
            {t('autodiscover.cloud.account.ownerEmail')}
          </S.AccountItemTitle>
          <AccountValue data-testid="account-owner-email" value={ownerEmail} />
        </S.AccountItem>
      )}
    </S.AccountWrapper>
  )
}
