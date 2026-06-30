import { AppType, GetServerInfoResponse, PackageType } from 'apiClient'
import { GetServerInfoResponseFactory } from 'uiSrc/mocks/factories/app/GetServerInfoResponse.factory'

import { formatDiagnostics } from './formatDiagnostics'

const server = GetServerInfoResponseFactory.build({
  appVersion: '3.6.0',
  buildCommitSha: 'a1b2c3d4e5f6',
  osPlatform: 'darwin',
  osArch: 'arm64',
  buildType: 'ELECTRON',
  appType: AppType.Electron,
  packageType: PackageType.Mas,
})

describe('formatDiagnostics', () => {
  it('should format all fields into an aligned fenced code block', () => {
    expect(formatDiagnostics(server)).toEqual(
      [
        '```',
        'Redis Insight diagnostics',
        'App version:   3.6.0',
        'Build commit:  a1b2c3d',
        'OS:            darwin (arm64)',
        'Build type:    ELECTRON',
        'App type:      ELECTRON',
        'Package type:  mas',
        '```',
      ].join('\n'),
    )
  })

  it('should omit the build commit line when buildCommitSha is absent', () => {
    const result = formatDiagnostics({ ...server, buildCommitSha: undefined })

    expect(result).not.toContain('Build commit:')
    expect(result).toContain('App version:   3.6.0')
    expect(result).toContain('OS:            darwin (arm64)')
  })

  it('should omit the package type line when packageType is absent', () => {
    const result = formatDiagnostics({
      ...server,
      packageType: undefined,
    } as unknown as GetServerInfoResponse)

    expect(result).not.toContain('Package type:')
    expect(result).toContain('App type:      ELECTRON')
  })
})
