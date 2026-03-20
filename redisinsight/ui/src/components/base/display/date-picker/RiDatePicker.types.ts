export interface RiDatePickerProps {
  selected?: Date
  onSelect?: (day: Date | undefined) => void
  label?: string
}
