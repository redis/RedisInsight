export enum AppEnv {
  WEB = 'web',
  ELECTRON = 'electron',
  DOCKER = 'docker',
}

export enum BuildType {
  RedisStack = 'REDIS_STACK',
  Electron = 'ELECTRON',
  DockerOnPremise = 'DOCKER_ON_PREMISE',
}

export enum PackageType {
  Flatpak = 'flatpak',
  Snap = 'snap',
  UnknownLinux = 'unknown-linux',
  AppImage = 'app-image',
  Mas = 'mas',
  UnknownDarwin = 'unknown-darwin',
  WindowsStore = 'windows-store',
  UnknownWindows = 'unknown-windows',
  Unknown = 'unknown',
}
