export * from './databases'
export * from './connections'
export * from './keys'
export * from './rdi'
export * from './indexes'

declare global {
    interface Window {
        windowId?: string
    }
}
