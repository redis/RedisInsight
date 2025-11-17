import styled from 'styled-components'
import { Row } from 'uiSrc/components/base/layout/flex'

export const TagFormWrapper = styled.div`
  border: 1px solid ${({ theme }) => theme.semantic.color.border.neutral500};
  border-radius: ${({ theme }) => theme.core.space.space050};
`

export const TagFormRow = styled(Row)`
  > div {
    flex: 1;
    padding: ${({ theme }) => theme.core.space.space100};
    display: flex;
    align-items: center;
    position: relative;
    gap: ${({ theme }) => theme.core.space.space200};

    > span {
      width: 100%;
      position: relative;
    }

    svg {
      cursor: pointer;
    }
  }
`

export const WarningBannerWrapper = styled.div`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.core.space.space100};
  padding: 6px 12px;
  margin: ${({ theme }) => theme.core.space.space200};
  border: 1px solid ${({ theme }) => theme.color.purple300};
  background-color: ${({ theme }) => theme.color.purple100};
  border-radius: ${({ theme }) => theme.core.space.space100};
`

export const HeaderWrapper = styled(Row)`
  border-bottom: 1px solid var(--separatorColor);

  > p {
    flex: 1;
    font-weight: bold;
    padding: 12px 6px;
    margin: 6px;
    margin-right: 10px;
  }

  :first-child {
    border-right: 1px solid var(--separatorColor);
  }
`
