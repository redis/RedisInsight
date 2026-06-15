import { FeatureFlags } from 'uiSrc/constants'
import { RootState } from 'uiSrc/slices/store'

export type FilterKeyTypeOption = {
  text: string
  value: string
  color: string
  minVersion?: string
  featureFlag?: FeatureFlags
  skipIfNoModule?: string
  /**
   * Optional gate evaluated against the redux store. Lets the option encode
   * its own enablement (e.g. dev-only types behind a feature flag) so the
   * filter renderer stays agnostic about which key types need extra checks.
   * Returns `true` when omitted.
   */
  isEnabledSelector?: (state: RootState) => boolean
}
