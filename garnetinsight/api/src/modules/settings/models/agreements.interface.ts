export interface IAgreement {
  defaultValue?: boolean;
  displayInSetting?: boolean;
  required?: boolean;
  category?: string;
  since?: string;
  editable?: boolean;
  disabled?: boolean;
  title?: string;
  label?: string;
  description?: string;
  requiredText?: string;
  options?: {
    [key: string]: IAgreement;
  };
}

export interface IAgreementSpec {
  [key: string]: IAgreement;
}

export interface IAgreementSpecFile {
  version: string;
  agreements: IAgreementSpec;
}
