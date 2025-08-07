import { faker } from '@faker-js/faker'
import * as os from 'os'
import * as fs from 'fs'
import { join as joinPath } from 'path'
import * as path from 'path'

// Urls for using in the tests
export const commonUrl = process.env.COMMON_URL || 'https://localhost:5540'
export const apiUrl = process.env.API_URL || 'https://localhost:5540/api'
export const electronExecutablePath = process.env.ELECTRON_EXECUTABLE_PATH
export const isElectron = electronExecutablePath !== undefined
export const googleUser = process.env.GOOGLE_USER || ''
export const googleUserPassword = process.env.GOOGLE_USER_PASSWORD || ''
export const samlUser = process.env.E2E_SSO_EMAIL || ''
export const samlUserPassword = process.env.E2E_SSO_PASSWORD || ''

export const workingDirectory =
    process.env.RI_APP_FOLDER_ABSOLUTE_PATH ||
    joinPath(os.homedir(), process.env.RI_APP_FOLDER_NAME || '.redis-insight')
export const fileDownloadPath = joinPath(os.homedir(), 'Downloads')
const uniqueId = faker.string.alphanumeric({ length: 10 })

export const ossStandaloneConfig = {
    host: process.env.OSS_STANDALONE_HOST!,
    port: process.env.OSS_STANDALONE_PORT!,
    databaseName: `${process.env.OSS_STANDALONE_DATABASE_NAME || 'test_standalone'}-${uniqueId}`,
    databaseUsername: process.env.OSS_STANDALONE_USERNAME,
    databasePassword: process.env.OSS_STANDALONE_PASSWORD,
}

export const ossStandaloneConfigEmpty = {
    host: process.env.OSS_STANDALONE_EMPTY_HOST,
    port: process.env.OSS_STANDALONE_EMPTY_PORT,
    databaseName: `${process.env.OSS_STANDALONE_EMPTY_DATABASE_NAME || 'test_standalone_empty'}-${uniqueId}`,
    databaseUsername: process.env.OSS_STANDALONE_EMPTY_USERNAME,
    databasePassword: process.env.OSS_STANDALONE_EMPTY_PASSWORD,
}

export const ossStandaloneV5Config = {
    host: process.env.OSS_STANDALONE_V5_HOST,
    port: process.env.OSS_STANDALONE_V5_PORT,
    databaseName: `${process.env.OSS_STANDALONE_V5_DATABASE_NAME || 'test_standalone-v5'}-${uniqueId}`,
    databaseUsername: process.env.OSS_STANDALONE_V5_USERNAME,
    databasePassword: process.env.OSS_STANDALONE_V5_PASSWORD,
}

export const ossStandaloneV7Config = {
    host: process.env.OSS_STANDALONE_V7_HOST,
    port: process.env.OSS_STANDALONE_V7_PORT,
    databaseName: `${process.env.OSS_STANDALONE_V7_DATABASE_NAME || 'test_standalone-v7'}-${uniqueId}`,
    databaseUsername: process.env.OSS_STANDALONE_V7_USERNAME,
    databasePassword: process.env.OSS_STANDALONE_V7_PASSWORD,
}

export const ossStandaloneV6Config = {
    host: process.env.OSS_STANDALONE_V8_HOST,
    port: process.env.OSS_STANDALONE_V8_PORT,
    databaseName: `${process.env.OSS_STANDALONE_V8_DATABASE_NAME || 'test_standalone-v6'}-${uniqueId}`,
    databaseUsername: process.env.OSS_STANDALONE_V8_USERNAME,
    databasePassword: process.env.OSS_STANDALONE_V8_PASSWORD,
}

export const ossStandaloneRedisearch = {
    host: process.env.OSS_STANDALONE_REDISEARCH_HOST,
    port: process.env.OSS_STANDALONE_REDISEARCH_PORT,
    databaseName: `${process.env.OSS_STANDALONE_REDISEARCH_DATABASE_NAME || 'test_standalone-redisearch'}-${uniqueId}`,
    databaseUsername: process.env.OSS_STANDALONE_REDISEARCH_USERNAME,
    databasePassword: process.env.OSS_STANDALONE_REDISEARCH_PASSWORD,
}

export const ossClusterConfig = {
    ossClusterHost: process.env.OSS_CLUSTER_HOST,
    ossClusterPort: process.env.OSS_CLUSTER_PORT,
    ossClusterDatabaseName: `${process.env.OSS_CLUSTER_DATABASE_NAME || 'test_cluster'}-${uniqueId}`,
}

export const ossSentinelConfig = {
    sentinelHost: process.env.OSS_SENTINEL_HOST,
    sentinelPort: process.env.OSS_SENTINEL_PORT,
    sentinelPassword: process.env.OSS_SENTINEL_PASSWORD,
    masters: [
        {
            alias: `primary-group-1}-${uniqueId}`,
            db: '0',
            name: 'primary-group-1',
            password: 'defaultpass',
        },
        {
            alias: `primary-group-2}-${uniqueId}`,
            db: '0',
            name: 'primary-group-2',
            password: 'defaultpass',
        },
    ],
    name: ['primary-group-1', 'primary-group-2'],
}

export const redisEnterpriseClusterConfig = {
    host: process.env.RE_CLUSTER_HOST,
    port: process.env.RE_CLUSTER_PORT,
    databaseName: process.env.RE_CLUSTER_DATABASE_NAME || 'test-re-standalone',
    databaseUsername: process.env.RE_CLUSTER_ADMIN_USER || 'demo@redislabs.com',
    databasePassword: process.env.RE_CLUSTER_ADMIN_PASSWORD || '123456',
}

export const invalidOssStandaloneConfig = {
    host: 'oss-standalone-invalid',
    port: '1010',
    databaseName: `${process.env.OSS_STANDALONE_INVALID_DATABASE_NAME || 'test_standalone-invalid'}-${uniqueId}`,
    databaseUsername: process.env.OSS_STANDALONE_INVALID_USERNAME,
    databasePassword: process.env.OSS_STANDALONE_INVALID_PASSWORD,
}

export const ossStandaloneBigConfig = {
    host: process.env.OSS_STANDALONE_BIG_HOST,
    port: process.env.OSS_STANDALONE_BIG_PORT,
    databaseName: `${process.env.OSS_STANDALONE_BIG_DATABASE_NAME || 'test_standalone_big'}-${uniqueId}`,
    databaseUsername: process.env.OSS_STANDALONE_BIG_USERNAME,
    databasePassword: process.env.OSS_STANDALONE_BIG_PASSWORD,
}

export const cloudDatabaseConfig = {
    host: process.env.E2E_CLOUD_DATABASE_HOST || '',
    port: process.env.E2E_CLOUD_DATABASE_PORT || '',
    databaseName: `${process.env.E2E_CLOUD_DATABASE_NAME || 'cloud-database'}-${uniqueId}`,
    databaseUsername: process.env.E2E_CLOUD_DATABASE_USERNAME,
    databasePassword: process.env.E2E_CLOUD_DATABASE_PASSWORD,
    accessKey: process.env.E2E_CLOUD_API_ACCESS_KEY || '',
    secretKey: process.env.E2E_CLOUD_API_SECRET_KEY || '',
}

export const ossStandaloneNoPermissionsConfig = {
    host: process.env.OSS_STANDALONE_NOPERM_HOST,
    port: process.env.OSS_STANDALONE_NOPERM_PORT,
    databaseName: `${process.env.OSS_STANDALONE_NOPERM_DATABASE_NAME || 'oss-standalone-no-permissions'}-${uniqueId}`,
    databaseUsername: process.env.OSS_STANDALONE_NOPERM_USERNAME || 'noperm',
    databasePassword: process.env.OSS_STANDALONE_NOPERM_PASSWORD,
}

export const ossStandaloneForSSHConfig = {
    host: process.env.OSS_STANDALONE_SSH_HOST || '172.33.100.111',
    port: process.env.OSS_STANDALONE_SSH_PORT || '6379',
    databaseName: `${process.env.OSS_STANDALONE_SSH_DATABASE_NAME || 'oss-standalone-for-ssh'}-${uniqueId}`,
    databaseUsername: process.env.OSS_STANDALONE_SSH_USERNAME,
    databasePassword: process.env.OSS_STANDALONE_SSH_PASSWORD,
}

export const ossClusterForSSHConfig = {
    host: process.env.OSS_CLUSTER_SSH_HOST || '172.31.100.211',
    port: process.env.OSS_CLUSTER_SSH_PORT || '6379',
    databaseName: `${process.env.OSS_CLUSTER_SSH_DATABASE_NAME || 'oss-cluster-for-ssh'}-${uniqueId}`,
    databaseUsername: process.env.OSS_CLUSTER_SSH_USERNAME,
    databasePassword: process.env.OSS_CLUSTER_SSH_PASSWORD,
}

export const ossStandaloneTlsConfig = {
    host: process.env.OSS_STANDALONE_TLS_HOST,
    port: process.env.OSS_STANDALONE_TLS_PORT,
    databaseName: `${process.env.OSS_STANDALONE_TLS_DATABASE_NAME || 'test_standalone_tls'}-${uniqueId}`,
    databaseUsername: process.env.OSS_STANDALONE_TLS_USERNAME,
    databasePassword: process.env.OSS_STANDALONE_TLS_PASSWORD,
    caCert: {
        name: `ca}-${uniqueId}`,
        certificate:
            process.env.E2E_CA_CRT ||
            fs.readFileSync(
                path.resolve(
                    __dirname,
                    '../../e2e/rte/oss-standalone-tls/certs/redisCA.crt',
                ),
                'utf-8',
            ),
    },
    clientCert: {
        name: `client}-${uniqueId}`,
        certificate:
            process.env.E2E_CLIENT_CRT ||
            fs.readFileSync(
                path.resolve(
                    __dirname,
                    '../../e2e/rte/oss-standalone-tls/certs/redis.crt',
                ),
                'utf-8',
            ),
        key:
            process.env.E2E_CLIENT_KEY ||
            fs.readFileSync(
                path.resolve(
                    __dirname,
                    '../../e2e/rte/oss-standalone-tls/certs/redis.key',
                ),
                'utf-8',
            ),
    },
}

export const ossStandaloneRedisGears = {
    host: process.env.OSS_STANDALONE_REDISGEARS_HOST,
    port: process.env.OSS_STANDALONE_REDISGEARS_PORT,
    databaseName: `${process.env.OSS_STANDALONE_REDISGEARS_DATABASE_NAME || 'test_standalone_redisgears'}-${uniqueId}`,
    databaseUsername: process.env.OSS_STANDALONE_REDISGEARS_USERNAME,
    databasePassword: process.env.OSS_STANDALONE_REDISGEARS_PASSWORD,
}

export const ossClusterRedisGears = {
    ossClusterHost: process.env.OSS_CLUSTER_REDISGEARS_2_HOST,
    ossClusterPort: process.env.OSS_CLUSTER_REDISGEARS_2_PORT,
    ossClusterDatabaseName: `${process.env.OSS_CLUSTER_REDISGEARS_2_NAME || 'test_cluster-gears-2.0'}-${uniqueId}`,
}
