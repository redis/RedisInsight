import { faker } from '@faker-js/faker'
import { AxiosInstance } from 'axios'
import { AddNewDatabaseParameters, DatabaseInstance } from '../../types'
import { ResourcePath } from '../constants'

export class DatabaseAPIRequests {
    constructor(private apiClient: AxiosInstance) {}

    async addNewStandaloneDatabaseApi(
        databaseParameters: AddNewDatabaseParameters,
        isCloud = false,
    ): Promise<void> {
        const uniqueId = faker.string.alphanumeric({ length: 10 })
        const uniqueIdNumber = faker.number.int({ min: 1, max: 1000 })
        const requestBody: any = {
            name: databaseParameters.databaseName,
            host: databaseParameters.host,
            port: Number(databaseParameters.port),
        }

        if (databaseParameters.databaseUsername) {
            requestBody.username = databaseParameters.databaseUsername
        }

        if (databaseParameters.databasePassword) {
            requestBody.password = databaseParameters.databasePassword
        }

        if (databaseParameters.caCert) {
            requestBody.tls = true
            requestBody.verifyServerCert = false
            requestBody.caCert = {
                name: `ca-${uniqueId}`,
                certificate: databaseParameters.caCert.certificate,
            }
            requestBody.clientCert = {
                name: `client-${uniqueId}`,
                certificate: databaseParameters.clientCert!.certificate,
                key: databaseParameters.clientCert!.key,
            }
        }

        if (isCloud) {
            requestBody.cloudDetails = {
                cloudId: uniqueIdNumber,
                subscriptionType: 'fixed',
                planMemoryLimit: 30,
                memoryLimitMeasurementUnit: 'mb',
                free: true,
            }
        }

        const response = await this.apiClient.post(
            ResourcePath.Databases,
            requestBody,
        )
        if (response.status !== 201)
            throw new Error(
                `Database creation failed for ${databaseParameters.databaseName}`,
            )
    }

    async getAllDatabases(): Promise<DatabaseInstance[]> {
        const response = await this.apiClient.get(ResourcePath.Databases)
        if (response.status !== 200)
            throw new Error('Failed to retrieve databases')
        return response.data
    }

    async getDatabaseIdByName(databaseName?: string): Promise<string> {
        if (!databaseName) throw new Error('Error: Missing databaseName')

        const allDatabases = await this.getAllDatabases()
        const foundDb = allDatabases.find((item) => item.name === databaseName)

        if (!foundDb) throw new Error(`Database ${databaseName} not found`)

        return foundDb.id
    }

    async deleteStandaloneDatabaseApi(
        databaseParameters: AddNewDatabaseParameters,
    ): Promise<void> {
        const databaseId = await this.getDatabaseIdByName(
            databaseParameters.databaseName,
        )
        if (!databaseId) throw new Error('Error: Missing databaseId')

        const requestBody = { ids: [databaseId] }
        const response = await this.apiClient.delete(ResourcePath.Databases, {
            data: requestBody,
        })
        if (response.status !== 200)
            throw new Error(
                `Failed to delete database ${databaseParameters.databaseName}`,
            )
    }
}
