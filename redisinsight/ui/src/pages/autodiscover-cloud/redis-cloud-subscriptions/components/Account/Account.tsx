import React from 'react'
import { LoadingContent } from 'uiSrc/components/base/layout'
import { ColorText } from 'uiSrc/components/base/text'

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
}: AccountProps) => (
  <S.AccountWrapper>
    {accountId && (
      <S.AccountItem>
        <S.AccountItemTitle>Account ID:</S.AccountItemTitle>
        <AccountValue data-testid="account-id" value={accountId} />
      </S.AccountItem>
    )}
    {accountName && (
      <S.AccountItem>
        <S.AccountItemTitle>Name:</S.AccountItemTitle>
        <AccountValue data-testid="account-name" value={accountName} />
      </S.AccountItem>
    )}
    {ownerName && (
      <S.AccountItem>
        <S.AccountItemTitle>Owner Name:</S.AccountItemTitle>
        <AccountValue data-testid="account-owner-name" value={ownerName} />
      </S.AccountItem>
    )}
    {ownerEmail && (
      <S.AccountItem>
        <S.AccountItemTitle>Owner Email:</S.AccountItemTitle>
        <AccountValue data-testid="account-owner-email" value={ownerEmail} />
      </S.AccountItem>
    )}
  </S.AccountWrapper>
)
