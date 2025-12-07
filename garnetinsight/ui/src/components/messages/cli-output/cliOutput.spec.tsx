import { cloneDeep, set } from 'lodash'
import {
  render,
  screen,
  fireEvent,
  initialStateDefault,
  mockStore,
} from 'uiSrc/utils/test-utils'

import { FeatureFlags } from 'uiSrc/constants'
import { cliTexts } from './cliOutput'

describe('cliTexts', () => {
  describe('Feature flag dependend', () => {
    describe('MONITOR_COMMAND', () => {
      it('should render proper content with flag disabled', async () => {
        const initialStoreState = set(
          cloneDeep(initialStateDefault),
          `app.features.featureFlags.features.${FeatureFlags.envDependent}`,
          { flag: false },
        )

        const onClick = jest.fn()

        render(cliTexts.MONITOR_COMMAND(onClick), {
          store: mockStore(initialStoreState),
        })

        expect(
          screen.getByTestId('user-profiler-link-disabled'),
        ).toBeInTheDocument()
      })

      it('should render proper content with flag enabled', () => {
        const initialStoreState = set(
          cloneDeep(initialStateDefault),
          `app.features.featureFlags.features.${FeatureFlags.envDependent}`,
          { flag: true },
        )

        const onClick = jest.fn()

        render(cliTexts.MONITOR_COMMAND(onClick), {
          store: mockStore(initialStoreState),
        })

        fireEvent.click(screen.getByTestId('monitor-btn'))
        expect(onClick).toBeCalled()
      })
    })

    describe('SUBSCRIBE_COMMAND_CLI', () => {
      it('should render proper content with flag disabled', async () => {
        const initialStoreState = set(
          cloneDeep(initialStateDefault),
          `app.features.featureFlags.features.${FeatureFlags.envDependent}`,
          { flag: false },
        )

        render(cliTexts.SUBSCRIBE_COMMAND_CLI(), {
          store: mockStore(initialStoreState),
        })

        expect(
          screen.getByTestId('user-pub-sub-link-disabled'),
        ).toBeInTheDocument()
        expect(
          screen.queryByTestId('user-pub-sub-link'),
        ).not.toBeInTheDocument()
      })

      it('should render proper content with flag enabled', () => {
        const initialStoreState = set(
          cloneDeep(initialStateDefault),
          `app.features.featureFlags.features.${FeatureFlags.envDependent}`,
          { flag: true },
        )

        render(cliTexts.SUBSCRIBE_COMMAND_CLI(), {
          store: mockStore(initialStoreState),
        })

        expect(screen.getByTestId('user-pub-sub-link')).toBeInTheDocument()
        expect(
          screen.queryByTestId('user-pub-sub-link-disabled'),
        ).not.toBeInTheDocument()
      })
    })

    describe('PSUBSCRIBE_COMMAND_CLI', () => {
      it('should render proper content with flag disabled', async () => {
        const initialStoreState = set(
          cloneDeep(initialStateDefault),
          `app.features.featureFlags.features.${FeatureFlags.envDependent}`,
          { flag: false },
        )

        render(cliTexts.PSUBSCRIBE_COMMAND(), {
          store: mockStore(initialStoreState),
        })

        expect(
          screen.getByTestId('user-pub-sub-link-disabled'),
        ).toBeInTheDocument()
        expect(
          screen.queryByTestId('user-pub-sub-link'),
        ).not.toBeInTheDocument()
      })

      it('should render proper content with flag enabled', () => {
        const initialStoreState = set(
          cloneDeep(initialStateDefault),
          `app.features.featureFlags.features.${FeatureFlags.envDependent}`,
          { flag: true },
        )

        render(cliTexts.PSUBSCRIBE_COMMAND(), {
          store: mockStore(initialStoreState),
        })

        expect(screen.getByTestId('user-pub-sub-link')).toBeInTheDocument()
        expect(
          screen.queryByTestId('user-pub-sub-link-disabled'),
        ).not.toBeInTheDocument()
      })
    })
  })
})
