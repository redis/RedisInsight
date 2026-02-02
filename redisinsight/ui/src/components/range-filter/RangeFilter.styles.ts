import styled, { css } from 'styled-components'
import { type Theme } from 'uiSrc/components/base/theme/types'

export const RangeWrapper = styled.div`
  margin: 30px 30px 26px;
  padding: 12px 0;

  &:hover {
    .slider-range:not(.disabled) {
      height: 5px;
      transform: translateY(0px);

      &:before {
        width: 2px;
        height: 12px;
        top: -7px;
      }

      &:after {
        width: 2px;
        height: 12px;
      }
    }
  }
`

export const ResetButton = styled.button`
  position: absolute;
  right: 30px;
  top: 80px;
  z-index: 10;
  text-decoration: underline;
  color: ${({ theme }: { theme: Theme }) =>
    theme.components.typography.colors.secondary};
  background: none;
  border: none;
  cursor: pointer;
  font:
    normal normal 500 13px/18px Graphik,
    sans-serif;

  &:hover,
  &:focus {
    color: ${({ theme }: { theme: Theme }) =>
      theme.components.typography.colors.primary};
  }
`

export const Slider = styled.div`
  position: relative;
  width: 100%;
`

export const SliderTrack = styled.div<{ $mock?: boolean }>`
  position: absolute;
  background-color: ${({ theme }: { theme: Theme }) =>
    theme.semantic.color.border.neutral500};
  width: 100%;
  height: 1px;
  margin-top: 2px;
  z-index: 1;

  ${({ $mock }) =>
    $mock &&
    css`
      left: 30px;
      width: calc(100% - 56px);
    `}
`

export const SliderRange = styled.div<{
  $leftPosition?: boolean
  $disabled?: boolean
  $mock?: boolean
}>`
  position: absolute;
  background-color: ${({ theme }: { theme: Theme }) =>
    theme.semantic.color.background.primary400};
  height: 1px;
  z-index: 2;
  transform: translateY(2px);

  &:before {
    content: '';
    width: 1px;
    height: 6px;
    position: absolute;
    top: -5px;
    left: -1px;
    background-color: ${({ theme }: { theme: Theme }) =>
      theme.semantic.color.background.primary400};
  }

  &:after {
    content: '';
    width: 1px;
    height: 6px;
    position: absolute;
    right: -1px;
    background-color: ${({ theme }: { theme: Theme }) =>
      theme.semantic.color.background.primary400};
  }

  ${({ $mock }) =>
    $mock &&
    css`
      left: 30px;
      width: calc(100% - 56px);
    `}
`

export const SliderLeftValue = styled.div<{
  $leftPosition?: boolean
  $disabled?: boolean
}>`
  position: absolute;
  width: max-content;
  color: ${({ theme }: { theme: Theme }) =>
    theme.semantic.color.text.neutral600};
  font:
    normal normal normal 12px/18px Graphik,
    sans-serif;
  margin-top: -25px;
  left: 0;

  ${({ $leftPosition }) =>
    $leftPosition &&
    css`
      transform: translateX(-100%);
    `}
`

export const SliderRightValue = styled.div<{
  $rightPosition?: boolean
  $disabled?: boolean
}>`
  position: absolute;
  width: max-content;
  color: ${({ theme }: { theme: Theme }) =>
    theme.semantic.color.text.neutral600};
  font:
    normal normal normal 12px/18px Graphik,
    sans-serif;
  margin-top: 8px;
  right: -4px;

  ${({ $rightPosition }) =>
    $rightPosition &&
    css`
      transform: translateX(100%);
    `}
`

export const Thumb = styled.input<{ $zIndex3?: boolean; $zIndex4?: boolean }>`
  -webkit-appearance: none;
  -webkit-tap-highlight-color: transparent;
  pointer-events: none;
  position: absolute;
  height: 0;
  width: calc(100% - 60px);
  outline: none;

  ${({ $zIndex3 }) =>
    $zIndex3 &&
    css`
      z-index: 3;
    `}

  ${({ $zIndex4 }) =>
    $zIndex4 &&
    css`
      z-index: 4;
    `}

  &::-webkit-slider-thumb {
    -webkit-appearance: none;
    width: 24px;
    height: 24px;
    border: none;
    border-radius: 0;
    cursor: ew-resize;
    margin-top: 4px;
    pointer-events: all;
    position: relative;
    background: transparent;
  }

  &:disabled::-webkit-slider-thumb {
    cursor: auto;
  }

  &::-moz-range-thumb {
    width: 24px;
    height: 24px;
    border: none;
    border-radius: 0;
    cursor: ew-resize;
    margin-top: 4px;
    pointer-events: all;
    position: relative;
    background: transparent;
  }

  &:disabled::-moz-range-thumb {
    cursor: auto;
  }

  ${({ $zIndex3 }) =>
    $zIndex3 &&
    css`
      &::-webkit-slider-thumb {
        transform: translate(-18px, -4px);
      }
      &::-moz-range-thumb {
        transform: translate(-18px, -4px);
      }
    `}

  ${({ $zIndex4 }) =>
    $zIndex4 &&
    css`
      &::-webkit-slider-thumb {
        transform: translate(-20px, 8px) rotate(180deg);
      }
      &::-moz-range-thumb {
        transform: translate(-20px, 8px) rotate(180deg);
      }
    `}
`
