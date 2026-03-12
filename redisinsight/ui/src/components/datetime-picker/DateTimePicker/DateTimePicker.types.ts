export type TimestampUnit = 'seconds' | 'milliseconds'

export interface DateTimePickerProps {
  onSubmit: (timestamp: number) => void
  timestampUnit?: TimestampUnit
  initialDate?: Date
}
