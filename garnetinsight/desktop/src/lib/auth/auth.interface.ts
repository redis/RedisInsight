export interface AuthStrategy {
  initialize(): Promise<void>
  shutdown(): Promise<void>
  getAuthUrl(options: any): Promise<{ url: string }>
  handleCallback(query: any): Promise<any>
  getBackendApp?(): any
}
