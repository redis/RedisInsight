export type SentinelParameters = {
    sentinelHost: string
    sentinelPort: string
    masters?: {
        alias?: string
        db?: string
        name?: string
        password?: string
    }[]
    sentinelPassword?: string
    name?: string[]
}

export type SSHParameters = {
    sshHost: string
    sshPort: string
    sshUsername: string
    sshPassword?: string
    sshPrivateKey?: string
    sshPassphrase?: string
}
