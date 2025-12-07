export enum FormatterTypes {
  ASCII = 'ASCII',
  UTF8 = 'UTF8',
}

export interface IFormatterStrategy {
  format(reply: any): any;
}
