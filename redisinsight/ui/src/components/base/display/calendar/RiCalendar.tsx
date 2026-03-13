import React from 'react'
import { DayPicker } from 'react-day-picker'

import * as S from './RiCalendar.styles'
import type { RiCalendarProps } from './RiCalendar.types'

const CalendarChevron = ({ orientation }: { orientation?: string }) => (
  <S.Chevron size="S" $orientation={orientation} />
)

export const RiCalendar = ({
  className,
  showOutsideDays = true,
  captionLayout = 'label',
  locale,
  formatters,
  components,
  ...props
}: RiCalendarProps) => {
  const localeCode = (locale as { code?: string } | undefined)?.code

  return (
    <S.CalendarRoot data-testid="ri-calendar">
      <DayPicker
        showOutsideDays={showOutsideDays}
        className={className}
        captionLayout={captionLayout}
        locale={locale}
        formatters={{
          formatMonthDropdown: (date) =>
            date.toLocaleString(localeCode, { month: 'short' }),
          ...formatters,
        }}
        components={{
          Chevron: CalendarChevron,
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
