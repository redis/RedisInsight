// Local type shim for `redux-mock-store`. We do not depend on
// `@types/redux-mock-store` because that package hardcodes `redux@^4` as a
// transitive dependency, which contaminates the type graph for every spec
// that imports test-utils and surfaces as TS2719 "two different types with
// this name exist, but they are unrelated" errors against RTK 2's
// `Middlewares` / `EnhancedStore` types (which are derived from `redux@5`).
//
// `redux-mock-store` itself ships no types, is in maintenance mode, and is
// expected to be retired in favor of real `<Provider>` + real store testing.
// Until that migration happens this shim is the smallest possible surface
// we own that keeps the existing test infrastructure compiling against
// `redux@5` types.
declare module 'redux-mock-store' {
  import type { Dispatch, Middleware, Store, UnknownAction } from 'redux'

  // Extends redux's `Store` so a mock store is assignable wherever a real
  // store is expected — e.g. `<Provider store={mockedStore}>` or
  // `render(ui, { store: mockedStore })` helpers typed against
  // `ReduxStore` / `EnhancedStore`.
  export type MockStoreEnhanced<S = unknown, DispatchExts = {}> = Store<
    S,
    UnknownAction
  > & {
    dispatch: Dispatch<UnknownAction> & DispatchExts
    getActions(): UnknownAction[]
    clearActions(): void
  }

  export interface MockStoreCreator<S = unknown, DispatchExts = {}> {
    (state?: S): MockStoreEnhanced<S, DispatchExts>
  }

  function configureMockStore<S = unknown, DispatchExts = {}>(
    middlewares?: Middleware[],
  ): MockStoreCreator<S, DispatchExts>

  export default configureMockStore
}
