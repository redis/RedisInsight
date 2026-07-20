import { ArrayAggregateOperation } from 'uiSrc/slices/interfaces/array'

export interface ArrayAggregateFormProps {
  /** Key name rendered in the preview command. Optional for isolated tests. */
  keyName?: string
  start: string
  end: string
  operation: ArrayAggregateOperation
  /** Comparison value used only when `operation === Match`. */
  value: string
  loading: boolean
  onChangeStart: (value: string) => void
  onChangeEnd: (value: string) => void
  onChangeOperation: (operation: ArrayAggregateOperation) => void
  onChangeValue: (value: string) => void
  onRun: () => void
  onReset?: () => void
  /**
   * Disables Run/Reset alongside the form's own validation while the
   * selected key's confirmed type/name has not caught up with the
   * clicked key yet.
   */
  disabled?: boolean
}
