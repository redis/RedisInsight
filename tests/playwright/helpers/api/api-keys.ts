/* eslint-disable max-len */
import { AxiosInstance } from 'axios'
import { DatabaseAPIRequests } from './api-databases'
import {
    AddNewDatabaseParameters,
    HashKeyParameters,
    SetKeyParameters,
    StreamKeyParameters,
} from '../../types'
import { stringToBuffer } from '../utils'

const bufferPathMask = '/databases/databaseId/keys?encoding=buffer'
export class APIKeyRequests {
    constructor(
        private apiClient: AxiosInstance,
        private databaseAPIRequests: DatabaseAPIRequests,
    ) {}

    async addStringKeyApi(
        keyParameters: { keyName: string; value: string; expire?: number },
        databaseParameters: AddNewDatabaseParameters,
    ): Promise<void> {
        const databaseId = await this.databaseAPIRequests.getDatabaseIdByName(
            databaseParameters.databaseName,
        )
        const requestBody = {
            keyName: stringToBuffer(keyParameters.keyName),
            value: stringToBuffer(keyParameters.value),
            expire: keyParameters?.expire,
        }

        const response = await this.apiClient.post(
            `/databases/${databaseId}/string?encoding=buffer`,
            requestBody,
        )

        if (response.status !== 201) {
            throw new Error('The creation of new String key request failed')
        }
    }

    async addHashKeyApi(
        keyParameters: HashKeyParameters & { expire?: number },
        databaseParameters: AddNewDatabaseParameters,
    ): Promise<void> {
        const databaseId = await this.databaseAPIRequests.getDatabaseIdByName(
            databaseParameters.databaseName,
        )
        const requestBody = {
            keyName: stringToBuffer(keyParameters.keyName),
            fields: keyParameters.fields.map((fields) => ({
                ...fields,
                field: stringToBuffer(fields.field),
                value: stringToBuffer(fields.value),
            })),
            expire: keyParameters?.expire,
        }
        const response = await this.apiClient.post(
            `/databases/${databaseId}/hash?encoding=buffer`,
            requestBody,
        )
        if (response.status !== 201)
            throw new Error('The creation of new Hash key request failed')
    }

    async addListKeyApi(
        keyParameters: { keyName: string; elements: string[]; expire?: number },
        databaseParameters: AddNewDatabaseParameters,
    ): Promise<void> {
        const databaseId = await this.databaseAPIRequests.getDatabaseIdByName(
            databaseParameters.databaseName,
        )
        const requestBody = {
            keyName: stringToBuffer(keyParameters.keyName),
            elements: keyParameters.elements.map((element) =>
                stringToBuffer(element),
            ),
            expire: keyParameters?.expire,
        }

        const response = await this.apiClient.post(
            `/databases/${databaseId}/list?encoding=buffer`,
            requestBody,
        )

        if (response.status !== 201) {
            throw new Error('The creation of new List key request failed')
        }
    }

    async addStreamKeyApi(
        keyParameters: StreamKeyParameters & { expire?: number },
        databaseParameters: AddNewDatabaseParameters,
    ): Promise<void> {
        const databaseId = await this.databaseAPIRequests.getDatabaseIdByName(
            databaseParameters.databaseName,
        )
        const requestBody = {
            keyName: stringToBuffer(keyParameters.keyName),
            entries: keyParameters.entries.map((member) => ({
                ...member,
                fields: member.fields.map(({ name, value }) => ({
                    name: stringToBuffer(name),
                    value: stringToBuffer(value),
                })),
            })),
            expire: keyParameters?.expire,
        }
        const response = await this.apiClient.post(
            `/databases/${databaseId}/streams?encoding=buffer`,
            requestBody,
        )
        if (response.status !== 201)
            throw new Error('The creation of new Stream key request failed')
    }

    async addSetKeyApi(
        keyParameters: SetKeyParameters & { expire?: number },
        databaseParameters: AddNewDatabaseParameters,
    ): Promise<void> {
        const databaseId = await this.databaseAPIRequests.getDatabaseIdByName(
            databaseParameters.databaseName,
        )
        const requestBody = {
            keyName: stringToBuffer(keyParameters.keyName),
            members: keyParameters.members.map((member) =>
                stringToBuffer(member),
            ),
            expire: keyParameters?.expire,
        }
        const response = await this.apiClient.post(
            `/databases/${databaseId}/set?encoding=buffer`,
            requestBody,
        )
        if (response.status !== 201)
            throw new Error('The creation of new Set key request failed')
    }

    async addZSetKeyApi(
        keyParameters: {
            keyName: string
            members: Array<{ name: string; score: number }>
            expire?: number
        },
        databaseParameters: AddNewDatabaseParameters,
    ): Promise<void> {
        const databaseId = await this.databaseAPIRequests.getDatabaseIdByName(
            databaseParameters.databaseName,
        )
        const requestBody = {
            keyName: stringToBuffer(keyParameters.keyName),
            members: keyParameters.members.map((member) => ({
                name: stringToBuffer(member.name),
                score: member.score,
            })),
            expire: keyParameters?.expire,
        }

        const response = await this.apiClient.post(
            `/databases/${databaseId}/zSet?encoding=buffer`,
            requestBody,
        )

        if (response.status !== 201) {
            throw new Error('The creation of new ZSet key request failed')
        }
    }

    async addJsonKeyApi(
        keyParameters: { keyName: string; value: any; expire?: number },
        databaseParameters: AddNewDatabaseParameters,
    ): Promise<void> {
        const databaseId = await this.databaseAPIRequests.getDatabaseIdByName(
            databaseParameters.databaseName,
        )
        const requestBody: any = {
            keyName: stringToBuffer(keyParameters.keyName),
            data: JSON.stringify(keyParameters.value),
        }

        if (keyParameters.expire) {
            requestBody.expire = keyParameters.expire
        }

        const response = await this.apiClient.post(
            `/databases/${databaseId}/rejson-rl?encoding=buffer`,
            requestBody,
        )

        if (response.status !== 201) {
            throw new Error('The creation of new JSON key request failed')
        }
    }

    async searchKeyByNameApi(
        keyName: string,
        databaseName: string,
    ): Promise<string[]> {
        const requestBody = {
            cursor: '0',
            match: keyName,
        }
        const databaseId =
            await this.databaseAPIRequests.getDatabaseIdByName(databaseName)
        const response = await this.apiClient.post(
            bufferPathMask.replace('databaseId', databaseId),
            requestBody,
        )
        if (response.status !== 200)
            throw new Error('Getting key request failed')
        return response.data[0].keys
    }

    async deleteKeyByNameApi(
        keyName: string,
        databaseName: string,
    ): Promise<void> {
        const databaseId =
            await this.databaseAPIRequests.getDatabaseIdByName(databaseName)
        const doesKeyExist = await this.searchKeyByNameApi(
            keyName,
            databaseName,
        )
        if (doesKeyExist.length > 0) {
            const requestBody = { keyNames: [stringToBuffer(keyName)] }
            const response = await this.apiClient.delete(
                bufferPathMask.replace('databaseId', databaseId),
                {
                    data: requestBody,
                },
            )
            if (response.status !== 200)
                throw new Error('The deletion of the key request failed')
        }
    }
}
