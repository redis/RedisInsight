import styled from 'styled-components'
import { Col } from 'uiSrc/components/base/layout/flex'
import { type Theme } from 'uiSrc/components/base/theme/types'

// Shared side-panel styles
export const Body = styled(Col)`
  height: calc(100% - 60px);
`

export const Tabs = styled.div`
  flex-shrink: 0;
  overflow: initial;
  flex-grow: 0;

  & > div {
    padding: 0 12px;
  }
`

export const AssistantHeader = styled.div`
  display: flex;
  align-items: center;
  flex-grow: 1;
`

export const OnboardingAnchorWrapper = styled.div`
  display: flex;
`

// Header styles
export const Header = styled.div`
  position: relative;
  padding: 12px;
  display: flex;
  align-items: center;
`

export const CloseBtn = styled.span`
  margin-left: 4px;
`

// AiAssistant styles
export const AiWrapper = styled.div`
  width: 100%;
  height: 100%;
`

// WelcomeAiAssistant styles
export const WelcomeWrapper = styled.div`
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
`

export const WelcomeContainer = styled.div`
  width: 100%;
  display: flex;
  flex-direction: column;
  flex-basis: auto;
  align-items: center;
  padding: 24px 32px;
  text-align: center;
  scrollbar-width: thin;
  overflow: auto;
  max-height: 100%;
`

export const Agreement = styled.div`
  text-align: left;
`

// ChatsWrapper styles
export const ChatsWrapperContainer = styled.div`
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
`

export const Chat = styled.div`
  flex-grow: 1;
  overflow: hidden;
`

// RestartChat styles
export const RestartPopover = styled.div`
  min-width: 300px;
`

export const ConfirmBtn = styled.button`
  display: block;
  margin-left: auto;
`

// ErrorMessage styles
export const ErrorMessage = styled.div`
  color: ${({ theme }: { theme: Theme }) =>
    theme.semantic.color.text.neutral500};
  font-size: 11px;
  font-style: italic;
  max-width: 80%;
  text-align: right;
  align-self: flex-end;

  a {
    color: ${({ theme }: { theme: Theme }) =>
      theme.semantic.color.text.neutral500};
  }
`

export const RestartSessionWrapper = styled.div`
  display: flex;
  justify-content: center;
  margin-top: 6px;
  margin-bottom: 4px;
`

export const RestartSessionBtn = styled.button`
  .euiButton__text {
    font-size: 12px;
    font-weight: 400;
  }

  .euiIcon {
    width: 12px;
    height: 12px;
  }
`

// LoadingMessage styles
export const Loader = styled.div`
  position: relative;
  padding: 4px 0;

  @keyframes bounce {
    0%,
    40%,
    100% {
      transform: initial;
    }
    20% {
      transform: translateY(-4px);
    }
  }
`

export const Dot = styled.span`
  display: inline-block;
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: ${({ theme }: { theme: Theme }) =>
    theme.semantic.color.text.neutral500};
  animation: bounce 1s linear infinite;

  &:not(:last-child) {
    margin-right: 3px;
  }

  &:nth-child(2) {
    animation-delay: 0.25s;
  }

  &:nth-child(3) {
    animation-delay: 0.5s;
  }
`

// EnablementArea styles
export const EnablementContainer = styled.div`
  overflow: hidden;
  height: 100%;
  flex-grow: 1;
  margin-top: 8px;
`

export const InnerContainerLoader = styled.div`
  padding: 12px 16px;
`

export const InternalPage = styled.div<{ $isVisible?: boolean }>`
  width: 100%;
  max-width: 100%;
  position: absolute;
  top: 0;
  height: 100%;
  transform: translateX(calc(100% + 16px));
  backface-visibility: hidden;
  box-shadow: -5px 1px 10px rgba(0, 0, 0, 0.2);
  z-index: 2;

  ${({ $isVisible }) =>
    $isVisible &&
    `
    transform: translateX(0);
  `}
`

// Navigation styles
export const InnerContainer = styled.div`
  scrollbar-width: thin;
  overflow: auto;
  height: 100%;
  text-align: left;
  letter-spacing: 0;
  color: ${({ theme }: { theme: Theme }) =>
    theme.semantic.color.text.neutral500};
`

// DeleteTutorialButton styles
export const PopoverDeleteContainer = styled.div`
  overflow: hidden;
  max-width: 350px;
`

export const PopoverFooter = styled.div`
  margin-top: 10px;
`

// EmptyPrompt styles
export const EmptyPromptContainer = styled.div`
  display: flex;
  height: 85%;
  min-height: 200px;
  align-items: center;
  justify-content: center;

  h2 {
    font:
      normal normal normal 17px/20px Graphik,
      sans-serif;
    margin-bottom: 0;
    color: ${({ theme }: { theme: Theme }) =>
      theme.semantic.color.text.neutral500};
    font-weight: 300;
  }
`

export const EmptyPromptBody = styled.p`
  font:
    normal normal normal 14px/18px Graphik,
    sans-serif;
  color: ${({ theme }: { theme: Theme }) =>
    theme.semantic.color.text.neutral500};
`

// Pagination styles
export const Pagination = styled.div<{ $compressed?: boolean }>`
  padding: 12px 16px;
  width: 100%;
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-top: 1px solid
    ${({ theme }: { theme: Theme }) => theme.semantic.color.border.neutral400};

  & > div:first-of-type,
  & > div:last-of-type {
    min-width: 94px;
  }

  ${({ $compressed }) =>
    $compressed &&
    `
    padding: 8px 16px;
    & > div:first-of-type,
    & > div:last-of-type {
      min-width: 70px;
    }
    .euiButtonContent .euiIcon {
      width: 14px;
      height: 14px;
    }
  `}
`

export const PrevPage = styled.span`
  & > span {
    justify-content: flex-start;
  }
`

export const NextPage = styled.span`
  & > span {
    justify-content: flex-start;
  }
`

export const ActiveMenuItem = styled.span`
  background-color: ${({ theme }: { theme: Theme }) =>
    theme.semantic.color.background.primary500};
  color: ${({ theme }: { theme: Theme }) =>
    theme.semantic.color.text.neutral100};
`

export const Underline = styled.strong`
  text-decoration: underline;
`

// PopoverRunAnalyze styles
export const PopoverApproveBtn = styled.button`
  float: right;
  padding: 4px 12px;
  height: 24px;

  .euiButtonContent {
    padding: 0;
  }
`

export const PopoverContent = styled.span`
  font-size: 13px;
  line-height: 16px;
`

export const PopoverTitle = styled.span`
  color: ${({ theme }: { theme: Theme }) =>
    theme.semantic.color.text.primary600};
  font-size: 14px;
`

export const PanelPopover = styled.div`
  width: 432px;
  padding: 16px 30px;
`

// WelcomeScreen (live-time-recommendations) styles
export const TipsWelcomeContainer = styled.div`
  margin-top: 66px;
  display: flex;
  flex-direction: column;
  align-items: center;
`

export const BigMargin = styled.span`
  margin-bottom: 40px;
`

export const BigText = styled.span`
  font:
    normal normal normal 22px/30px Graphik,
    sans-serif;
  text-align: center;
  color: ${({ theme }: { theme: Theme }) =>
    theme.semantic.color.text.primary500};
`

export const HugeText = styled.span`
  font:
    normal normal 500 28px/38px Graphik,
    sans-serif;
  text-align: center;
  color: ${({ theme }: { theme: Theme }) =>
    theme.semantic.color.text.primary500};
  margin-bottom: 9px;
`

export const MediumText = styled.span`
  font:
    normal normal normal 16px/40px Graphik,
    sans-serif;
  color: ${({ theme }: { theme: Theme }) =>
    theme.semantic.color.text.primary500};
  margin-bottom: 10px;
`

export const WelcomeIcon = styled.span`
  margin-bottom: 40px;
`

export const WelcomeText = styled.span`
  font:
    normal normal normal 12px/20px Graphik,
    sans-serif;
  margin-bottom: 12px;
  max-width: 351px;
  text-align: center;
`

// Main panel container styles
export const StyledSidePanel = styled.div<{ isFullScreen?: boolean }>`
  position: fixed;
  top: 0;
  right: 0;
  z-index: 1000;
  height: 100%;
  width: ${({ isFullScreen }) => (isFullScreen ? '100%' : '460px')};
  background-color: ${({ theme }: { theme: Theme }) =>
    theme.semantic.color.background.neutral100};
  border-left: 1px solid
    ${({ theme }: { theme: Theme }) => theme.semantic.color.border.neutral400};
  box-shadow: -4px 0 8px rgba(0, 0, 0, 0.1);
  display: flex;
  flex-direction: column;
`

export const StyledInnerSidePanel = styled.div`
  height: 100%;
  display: flex;
  flex-direction: column;
  overflow: hidden;
`
