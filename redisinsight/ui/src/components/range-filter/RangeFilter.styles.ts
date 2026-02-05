import styled, { css } from 'styled-components'
import { ComponentPropsWithRef, HTMLAttributes } from 'react'
import { type Theme } from 'uiSrc/components/base/theme/types'
import { EmptyButton } from 'uiSrc/components/base/forms/buttons'

export const RangeWrapper = styled.div<HTMLAttributes<HTMLDivElement>>`
  margin: ${({ theme }: { theme: Theme }) =>
    `${theme.core.space.space300} ${theme.core.space.space300} ${theme.core.space.space250}`};
  padding: ${({ theme }: { theme: Theme }) =>
    `${theme.core.space.space150} ${theme.core.space.space000}`};

  &:hover {
    .slider-range:not(.disabled) {
      height: ${({ theme }: { theme: Theme }) => theme.core.space.space050};
      transform: translateY(0px);

      &:before {
        width: ${({ theme }: { theme: Theme }) => theme.core.space.space025};
        height: ${({ theme }: { theme: Theme }) => theme.core.space.space150};
        top: -7px;
      }

      &:after {
        width: ${({ theme }: { theme: Theme }) => theme.core.space.space025};
        height: ${({ theme }: { theme: Theme }) => theme.core.space.space150};
      }
    }
  }
`

export const ResetButton = styled(EmptyButton)`
  position: absolute;
  right: ${({ theme }: { theme: Theme }) => theme.core.space.space300};
  top: ${({ theme }: { theme: Theme }) => theme.core.space.space800};
  z-index: 10;
  cursor: pointer;
`

export const Slider = styled.div`
  position: relative;
  width: 100%;
`

export const SliderTrack = styled.div<{ $mock?: boolean }>`
  position: absolute;
  background-color: ${({ theme }: { theme: Theme }) =>
    theme.semantic.color.background.primary400};
  width: 100%;
  height: ${({ theme }: { theme: Theme }) => theme.core.space.space010};
  margin-top: ${({ theme }: { theme: Theme }) => theme.core.space.space025};
  z-index: 1;

  ${({ $mock }) =>
    $mock &&
    css`
      left: 30px;
      width: calc(100% - 56px);
    `}
`

export const SliderRange = styled.div<
  ComponentPropsWithRef<'div'> & {
    $leftPosition?: boolean
    $disabled?: boolean
    $mock?: boolean
  }
>`
  position: absolute;
  background-color: ${({ theme }: { theme: Theme }) =>
    theme.semantic.color.background.primary400};
  height: ${({ theme }: { theme: Theme }) => theme.core.space.space010};
  z-index: 2;
  transform: translateY(2px);

  &:before {
    content: '';
    width: ${({ theme }: { theme: Theme }) => theme.core.space.space010};
    height: ${({ theme }: { theme: Theme }) => theme.core.space.space050};
    position: absolute;
    top: -5px;
    left: -1px;
    background-color: ${({ theme }: { theme: Theme }) =>
      theme.semantic.color.background.primary400};
  }

  &:after {
    content: '';
    width: ${({ theme }: { theme: Theme }) => theme.core.space.space010};
    height: ${({ theme }: { theme: Theme }) => theme.core.space.space050};
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

export const SliderLeftValue = styled.div<
  HTMLAttributes<HTMLDivElement> & {
    $leftPosition?: boolean
    $disabled?: boolean
  }
>`
  position: absolute;
  width: max-content;
  color: ${({ theme }: { theme: Theme }) =>
    theme.semantic.color.text.primary400};
  margin-top: -25px;
  left: 0;

  ${({ $leftPosition }) =>
    $leftPosition &&
    css`
      transform: translateX(-100%);
    `}
`

export const SliderRightValue = styled.div<
  HTMLAttributes<HTMLDivElement> & {
    $rightPosition?: boolean
    $disabled?: boolean
  }
>`
  position: absolute;
  width: max-content;
  color: ${({ theme }: { theme: Theme }) =>
    theme.semantic.color.text.primary400};
  margin-top: ${({ theme }: { theme: Theme }) => theme.core.space.space100};
  right: -4px;

  ${({ $rightPosition }) =>
    $rightPosition &&
    css`
      transform: translateX(100%);
    `}
`

export const Thumb = styled.input<
  ComponentPropsWithRef<'input'> & {
    $zIndex3?: boolean
    $zIndex4?: boolean
  }
>`
  appearance: none;
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
    width: ${({ theme }: { theme: Theme }) => theme.core.space.space300};
    height: ${({ theme }: { theme: Theme }) => theme.core.space.space300};
    border: none;
    border-radius: 0;
    cursor: ew-resize;
    margin-top: ${({ theme }: { theme: Theme }) => theme.core.space.space050};
    pointer-events: all;
    position: relative;
    background: transparent;
  }

  &:disabled::-webkit-slider-thumb {
    cursor: auto;
  }

  &::-moz-range-thumb {
    width: ${({ theme }: { theme: Theme }) => theme.core.space.space300};
    height: ${({ theme }: { theme: Theme }) => theme.core.space.space300};
    border: none;
    border-radius: 0;
    cursor: ew-resize;
    margin-top: ${({ theme }: { theme: Theme }) => theme.core.space.space050};
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
        transform: translate(
          ${({ theme }: { theme: Theme }) => theme.core.space.space250},
          -${({ theme }: { theme: Theme }) => theme.core.space.space050}
        );
      }
      &::-moz-range-thumb {
        transform: translate(
          ${({ theme }: { theme: Theme }) => theme.core.space.space250},
          -${({ theme }: { theme: Theme }) => theme.core.space.space050}
        );
      }
    `}

  ${({ $zIndex4 }) =>
    $zIndex4 &&
    css`
      &::-webkit-slider-thumb {
        transform: translate(
            -${({ theme }: { theme: Theme }) => theme.core.space.space250},
            ${({ theme }: { theme: Theme }) => theme.core.space.space050}
          )
          rotate(180deg);
      }
      &::-moz-range-thumb {
        transform: translate(
            -${({ theme }: { theme: Theme }) => theme.core.space.space250},
            ${({ theme }: { theme: Theme }) => theme.core.space.space050}
          )
          rotate(180deg);
      }
    `}
`
