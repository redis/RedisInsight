export interface ICloudCapiAccountOwner {
  name: string;
  email: string;
}

interface ICloudCapiAccountKey {
  name: string;
  accountId: number;
  accountName: string;
  allowedSourceIps: string[];
  createdTimestamp: string;
  owner: ICloudCapiAccountOwner;
  httpSourceIp: string;
}

export interface ICloudCapiAccount {
  id: number;
  name: string;
  createdTimestamp: string;
  updatedTimestamp: string;
  key: ICloudCapiAccountKey;
}
