export enum CliOutputFormatterTypes {
  Text = 'TEXT',
  Raw = 'RAW',
}

export interface IRedirectionInfo {
  slot: string;
  address: string;
}

export interface IOutputFormatterStrategy {
  format(reply: any): any;
}
