import { Factory } from 'fishery'
import { faker } from '@faker-js/faker'
import { AppType, GetServerInfoResponse, PackageType } from 'apiClient'

export const GetServerInfoResponseFactory =
  Factory.define<GetServerInfoResponse>(() => ({
    id: faker.string.uuid(),
    createDateTime: faker.date.past().toISOString(),
    appVersion: faker.system.semver(),
    buildCommitSha: faker.git.commitSha(),
    osPlatform: faker.helpers.arrayElement(['darwin', 'linux', 'win32']),
    osArch: faker.helpers.arrayElement(['x64', 'arm64']),
    buildType: 'ELECTRON',
    appType: AppType.Electron,
    packageType: PackageType.Mas,
    encryptionStrategies: [],
    sessionId: faker.number.int(),
  }))
