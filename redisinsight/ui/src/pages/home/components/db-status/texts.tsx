import React from 'react'
import { Spacer } from 'uiSrc/components/base/layout/spacer'
import { Title } from 'uiSrc/components/base/text/Title'
import { Trans, useTranslation } from 'uiSrc/i18n'

// Free Cloud DBs auto-delete after this many days of inactivity.
const FREE_CLOUD_DB_INACTIVITY_DAYS = 15

export const CheckCloudDatabase = () => {
  const { t } = useTranslation()

  return (
    <>
      <Title size="XS">
        {t('home.databaseList.dbStatus.checkCloudDatabase.title')}
      </Title>
      <Spacer size="s" />
      <div>
        {t('home.databaseList.dbStatus.checkCloudDatabase.autoDelete', {
          days: FREE_CLOUD_DB_INACTIVITY_DAYS,
        })}
        <Spacer size="s" />
        {t('home.databaseList.dbStatus.checkCloudDatabase.recreate')}
        <br />
        {t('home.databaseList.dbStatus.checkCloudDatabase.capabilities')}
      </div>
    </>
  )
}

export const WarningWithCapability = ({
  capability,
}: {
  capability: string
}) => {
  const { t } = useTranslation()

  return (
    <>
      <Title size="XS">
        {t('home.databaseList.dbStatus.warningWithCapability.title', {
          capability,
        })}
      </Title>
      <Spacer size="s" />
      <div>
        <Trans
          i18nKey="home.databaseList.dbStatus.warningWithCapability.body"
          values={{ capability }}
          components={{ br: <br /> }}
        />
      </div>
      <Spacer size="s" />
      <div>
        <Trans
          i18nKey="home.databaseList.dbStatus.warningWithCapability.note"
          values={{ days: FREE_CLOUD_DB_INACTIVITY_DAYS }}
          components={{ b: <b /> }}
        />
      </div>
    </>
  )
}

export const WarningWithoutCapability = () => {
  const { t } = useTranslation()

  return (
    <>
      <Title size="XS">
        {t('home.databaseList.dbStatus.warningWithoutCapability.title')}
      </Title>
      <Spacer size="s" />
      <div>
        <Trans
          i18nKey="home.databaseList.dbStatus.warningWithoutCapability.body"
          components={{ br: <br /> }}
        />
      </div>
      <Spacer size="s" />
      <div>
        <Trans
          i18nKey="home.databaseList.dbStatus.warningWithoutCapability.note"
          values={{ days: FREE_CLOUD_DB_INACTIVITY_DAYS }}
          components={{ b: <b /> }}
        />
      </div>
    </>
  )
}
