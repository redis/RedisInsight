export interface CommandViewProps {
  command: string
  language?: string
  showLineNumbers?: boolean

  className?: string
  dataTestId?: string

  onCopy?: () => void
}
