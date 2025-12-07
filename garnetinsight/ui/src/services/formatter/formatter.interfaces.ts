import { History } from 'history'

export interface IFormatterConfig {
  history: History
}

export interface IFormatter {
  format(data: any, config?: IFormatterConfig): Promise<string>
}
