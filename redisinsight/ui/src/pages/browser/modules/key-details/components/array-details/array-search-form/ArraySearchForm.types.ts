import { ArrayGrepCriteria } from 'uiSrc/slices/interfaces/array'

export interface ArraySearchFormProps {
  /**
   * Key name rendered in the preview command. Optional so the form can be
   * rendered in isolation (tests, Storybook); in the live composition the
   * container always passes the selected key.
   */
  keyName?: string
  criteria: ArrayGrepCriteria
  value: string
  loading: boolean
  onChangeCriteria: (criteria: ArrayGrepCriteria) => void
  onChangeValue: (value: string) => void
  onRun: () => void
  /**
   * Disables the criteria / value inputs and the Run action. Container
   * passes `true` while the selected key's confirmed type/name has not
   * caught up with the clicked key yet, so a quick click cannot dispatch a
   * search against a non-array key.
   */
  disabled?: boolean
}
