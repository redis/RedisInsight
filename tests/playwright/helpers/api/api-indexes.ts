import { AxiosInstance } from 'axios'
import { DatabaseAPIRequests } from './api-databases'
import {
    AddNewDatabaseParameters,
    CreateRedisearchIndexParameters,
} from '../../types'
import { stringToBuffer } from '../utils'

export class APIIndexRequests {
    constructor(
        private apiClient: AxiosInstance,
        private databaseAPIRequests: DatabaseAPIRequests,
    ) {}

    /**
     * Gets all RediSearch indexes using the API (FT._LIST equivalent)
     * @param databaseParameters Database connection parameters
     * @returns Array of index names (as strings)
     */
    async getAllRedisearchIndexesApi(
        databaseParameters: AddNewDatabaseParameters,
    ): Promise<string[]> {
        const databaseId = await this.databaseAPIRequests.getDatabaseIdByName(
            databaseParameters.databaseName,
        )
        const response = await this.apiClient.get(
            `/databases/${databaseId}/redisearch`,
        )

        if (response.status !== 200) {
            throw new Error('Failed to get RediSearch indexes')
        }

        // The response should have a property 'indexes' which is an array
        return (
            response.data.indexes?.map((idx: any) =>
                typeof idx === 'string'
                    ? idx
                    : Buffer.from(idx.data).toString('utf8'),
            ) || []
        )
    }

    /**
     * Creates a new RediSearch index using the FT.CREATE command
     * @param indexParameters Parameters for creating the index
     * @param databaseParameters Database connection parameters
     */
    async createRedisearchIndexApi(
        indexParameters: CreateRedisearchIndexParameters,
        databaseParameters: AddNewDatabaseParameters,
    ): Promise<void> {
        const databaseId = await this.databaseAPIRequests.getDatabaseIdByName(
            databaseParameters.databaseName,
        )

        const requestBody = {
            index: stringToBuffer(indexParameters.indexName),
            type: indexParameters.keyType.toLowerCase(),
            prefixes: indexParameters.prefixes?.map((prefix) =>
                stringToBuffer(prefix),
            ),
            fields: indexParameters.fields.map((field) => ({
                name: stringToBuffer(field.name),
                type: field.type.toLowerCase(),
            })),
        }

        const response = await this.apiClient.post(
            `/databases/${databaseId}/redisearch?encoding=buffer`,
            requestBody,
        )

        if (response.status !== 201) {
            throw new Error(
                `Failed to create RediSearch index: ${indexParameters.indexName}`,
            )
        }
    }

    /**
     * Deletes a RediSearch index using the FT.DROPINDEX command
     * @param indexName Name of the index to delete
     * @param databaseParameters Database connection parameters
     * @param deleteDocuments Whether to delete associated documents (DD flag)
     */
    async deleteRedisearchIndexApi(
        indexName: string,
        databaseParameters: AddNewDatabaseParameters,
        deleteDocuments: boolean = false,
    ): Promise<void> {
        const databaseId = await this.databaseAPIRequests.getDatabaseIdByName(
            databaseParameters.databaseName,
        )

        const requestBody = {
            index: stringToBuffer(indexName),
            deleteDocuments,
        }

        try {
            const response = await this.apiClient.delete(
                `/databases/${databaseId}/redisearch?encoding=buffer`,
                {
                    data: requestBody,
                },
            )

            if (response.status !== 204) {
                throw new Error(
                    `Failed to delete RediSearch index: ${indexName}`,
                )
            }
        } catch (error: any) {
            // Ignore 404 errors as the index might not exist (e.g., during cleanup)
            if (error.response?.status === 404) {
                // Index doesn't exist, which is fine for cleanup
                return
            }
            throw error
        }
    }

    /**
     * Deletes all RediSearch indexes using the API
     * @param databaseParameters Database connection parameters
     * @param deleteDocuments Whether to delete associated documents (DD flag)
     */
    async deleteAllRedisearchIndexesApi(
        databaseParameters: AddNewDatabaseParameters,
        deleteDocuments: boolean = false,
    ): Promise<void> {
        const indexes =
            await this.getAllRedisearchIndexesApi(databaseParameters)

        for (const indexName of indexes) {
            try {
                await this.deleteRedisearchIndexApi(
                    indexName,
                    databaseParameters,
                    deleteDocuments,
                )
            } catch (e) {
                // Ignore errors for individual indexes, in case of cleanup
            }
        }
    }
}
