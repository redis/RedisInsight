import React from 'react'
import { DayPicker, getDefaultClassNames, DayButton } from 'react-day-picker'
import type { DayPickerLocale } from 'react-day-picker'
import 'react-day-picker/style.css'
import cx from 'classnames'

import {
  IconButton,
  SecondaryButton,
} from 'uiSrc/components/base/forms/buttons'
import * as S from './RiCalendar.styles'
import type { RiCalendarProps } from './RiCalendar.types'

function getLocaleCode(locale?: Partial<DayPickerLocale>): string | undefined {
  const loc = locale as { code?: string } | undefined
  return loc?.code
}

const CalendarChevron = ({ orientation }: { orientation?: string }) => (
  <S.Chevron size="S" $orientation={orientation} />
)

const ChevronLeftIcon = () => <S.Chevron size="S" $orientation="left" />
const ChevronRightIcon = () => <S.Chevron size="S" $orientation="right" />

export const RiCalendar = ({
  className,
  classNames,
  showOutsideDays = true,
  captionLayout = 'label',
  locale,
  formatters,
  components,
  ...props
}: RiCalendarProps) => {
  const defaultClassNames = getDefaultClassNames()

  return (
    <S.CalendarRoot data-testid="ri-calendar">
      <DayPicker
        showOutsideDays={showOutsideDays}
        className={className}
        captionLayout={captionLayout}
        locale={locale}
        formatters={{
          formatMonthDropdown: (date) =>
            date.toLocaleString(getLocaleCode(locale), { month: 'short' }),
          ...formatters,
        }}
        classNames={{
          ...defaultClassNames,
          ...classNames,
        }}
        components={{
          Root: ({ className: rootClassName, rootRef, ...rootProps }) => (
            <div
              data-slot="calendar"
              ref={rootRef}
              className={rootClassName}
              {...rootProps}
            />
          ),
          Chevron: CalendarChevron,
          PreviousMonthButton: (prevProps) => (
            <IconButton icon={ChevronLeftIcon} size="S" {...prevProps} />
          ),
          NextMonthButton: (nextProps) => (
            <IconButton icon={ChevronRightIcon} size="S" {...nextProps} />
          ),
          DayButton: (dayProps) => (
            <CalendarDayButton locale={locale} {...dayProps} />
          ),
          WeekNumber: ({ children, ...weekProps }) => (
            <td {...weekProps}>
              <S.WeekNumberCell>{children}</S.WeekNumberCell>
            </td>
          ),
          ...components,
        }}
        {...props}
      />
    </S.CalendarRoot>
  )
}

type CalendarDayButtonProps = React.ComponentProps<typeof DayButton> & {
  locale?: Partial<DayPickerLocale>
}

function CalendarDayButton({
  className,
  day,
  modifiers,
  locale,
  ...props
}: CalendarDayButtonProps) {
  const defaultClassNames = getDefaultClassNames()

  const ref = React.useRef<HTMLButtonElement>(null)
  React.useEffect(() => {
    if (modifiers.focused) ref.current?.focus()
  }, [modifiers.focused])

  return (
    <SecondaryButton
      size="small"
      data-day={day.date.toLocaleDateString(getLocaleCode(locale))}
      data-selected-single={
        modifiers.selected &&
        !modifiers.range_start &&
        !modifiers.range_end &&
        !modifiers.range_middle
      }
      data-range-start={modifiers.range_start}
      data-range-end={modifiers.range_end}
      data-range-middle={modifiers.range_middle}
      className={cx(defaultClassNames.day_button, className)}
      {...props}
    />
  )
}
