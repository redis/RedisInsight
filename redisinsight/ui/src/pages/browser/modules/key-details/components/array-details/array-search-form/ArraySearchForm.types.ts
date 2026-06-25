import {
  ArrayCombinator,
  ArrayGrepPredicate,
  ArraySearchOptions,
} from 'uiSrc/slices/interfaces/array'

export interface ArraySearchFormProps {
  /**
   * Key name rendered in the preview command. Optional so the form can be
   * rendered in isolation (tests, Storybook); in the live composition the
   * container always passes the selected key.
   */
  keyName?: string
  /** Predicate rows; always at least one. */
  predicates: ArrayGrepPredicate[]
  /** Single global connective applied to all predicates (shown with 2+). */
  combinator: ArrayCombinator
  options: ArraySearchOptions
  loading: boolean
  onAddPredicate: () => void
  onRemovePredicate: (index: number) => void
  onChangePredicate: (index: number, patch: Partial<ArrayGrepPredicate>) => void
  onChangeCombinator: (combinator: ArrayCombinator) => void
  onChangeOptions: (patch: Partial<ArraySearchOptions>) => void
  onRun: () => void
  /**
   * Optional reset hook — restores form defaults and clears prior results.
   * The container owns the semantics (form state + Redux search sub-state);
   * the button only renders when provided, matching the View / Aggregate tabs.
   */
  onReset?: () => void
  /**
   * Disables the inputs and the Run action. Container passes `true` while the
   * selected key's confirmed type/name has not caught up with the clicked key
   * yet, so a quick click cannot dispatch a search against a non-array key.
   */
  disabled?: boolean
}
