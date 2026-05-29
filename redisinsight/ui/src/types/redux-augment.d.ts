import 'redux'

declare module 'redux' {
  interface Dispatch {
    <R>(action: (...args: any[]) => R): R
  }
}
