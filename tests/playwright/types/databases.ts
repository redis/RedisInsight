export type DatabasesForImport = {
    host?: string
    port?: number | string
    name?: string
    result?: string
    username?: string
    auth?: string
    cluster?: boolean | string
    indName?: string
    db?: number
    ssh_port?: number
    timeout_connect?: number
    timeout_execute?: number
    other_field?: string
    ssl?: boolean
    ssl_ca_cert_path?: string
    ssl_local_cert_path?: string
    ssl_private_key_path?: string
}[]

export type AddNewDatabaseParameters = {
    host?: string
    port?: string
    databaseName?: string
    databaseUsername?: string
    databasePassword?: string

    // For OSS Cluster parameters, you might use these fields:
    ossClusterHost?: string
    ossClusterPort?: string
    ossClusterDatabaseName?: string
    caCert?: {
        name?: string
        certificate?: string
    }
    clientCert?: {
        name?: string
        certificate?: string
        key?: string
    }
    accessKey?: string
    secretKey?: string

    // For OSS Sentinel parameters, you might use these fields:
    name?: string[]
    sentinelHost?: string
    sentinelPort?: string
    sentinelPassword?: string
    masters?: {
        alias: string
        db: string
        name: string
        password: string
    }[]
}

export type DatabaseInstance = {
    host: string
    port: number
    provider?: string
    id: string
    connectionType?: string
    lastConnection?: Date
    password?: string
    username?: string
    name?: string
    db?: number
    tls?: boolean
    ssh?: boolean
    sshOptions?: {
        host: string
        port: number
        username?: string
        password?: string | true
        privateKey?: string
        passphrase?: string | true
    }
    tlsClientAuthRequired?: boolean
    verifyServerCert?: boolean
    caCert?: object
    clientCert?: object
    authUsername?: string
    authPass?: string
    isDeleting?: boolean
    sentinelMaster?: object
    modules: object[]
    version: string
    isRediStack?: boolean
    visible?: boolean
    loading?: boolean
    isFreeDb?: boolean
    tags?: {
        id: string
        key: string
        value: string
        createdAt: string
        updatedAt: string
    }[]
}
