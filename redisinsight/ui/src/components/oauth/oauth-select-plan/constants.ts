import { AllIconsType } from 'uiBase/icons'
import styles from './styles.module.scss'

export enum OAuthProvider {
  AWS = 'AWS',
  Azure = 'Azure',
  Google = 'GCP',
}

export const OAuthProviders: {
  id: OAuthProvider
  icon: AllIconsType
  label: string
  className?: string
}[] = [
  {
    id: OAuthProvider.AWS,
    icon: 'Awss3Icon',
    label: 'Amazon Web Services',
    className: styles.awsIcon,
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
