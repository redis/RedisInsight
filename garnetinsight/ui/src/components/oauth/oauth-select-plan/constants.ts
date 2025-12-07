import { AllIconsType } from 'uiSrc/components/base/icons/RiIcon'

export enum OAuthProvider {
  AWS = 'AWS',
  Azure = 'Azure',
  Google = 'GCP',
}

export const OAuthProviders: {
  id: OAuthProvider
  icon: AllIconsType
  label: string
}[] = [
  {
    id: OAuthProvider.AWS,
    icon: 'Awss3Icon',
    label: 'Amazon Web Services',
  },
  {
    id: OAuthProvider.Google,
    icon: 'GooglecloudIcon',
    label: 'Google Cloud',
  },
  {
    id: OAuthProvider.Azure,
    icon: 'AzureIcon',
    label: 'Microsoft Azure',
  },
]
