export * from './databases'
export * from './connections'
export * from './keys'
export * from './rdi'

declare global {
    interface Window {
        windowId?: string
    }
}
