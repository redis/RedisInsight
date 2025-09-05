import { t } from 'testcafe';
import { AddNewDatabaseParameters } from '../../pageObjects/dialogs/add-redis-database-dialog';
import {
    HashKeyParameters,
    StringKeyParameters,
    ListKeyParameters,
    SetKeyParameters,
    SortedSetKeyParameters,
    StreamKeyParameters,
    JsonKeyParameters,
} from '../../pageObjects/browser-page'
import { sendDeleteRequest, sendPostRequest } from './api-common';
import { DatabaseAPIRequests } from './api-database';

const databaseAPIRequests = new DatabaseAPIRequests();

const bufferPathMask = '/databases/databaseId/keys?encoding=buffer';
export class APIKeyRequests {

    /**
     * Add Hash key
     * @param keyParameters The key parameters
     * @param databaseParameters The database parameters
     */
    async addHashKeyApi(
        keyParameters: HashKeyParameters,
        databaseParameters: AddNewDatabaseParameters
    ): Promise<void> {
        const databaseId = await databaseAPIRequests.getDatabaseIdByName(
            databaseParameters.databaseName
        );

        // ensure key doesn't exist
        await this.deleteKeyApi(keyParameters.keyName, databaseId);

        const requestBody = {
            keyName: Buffer.from(keyParameters.keyName, 'utf-8'),
            expire: keyParameters.ttl,
            fields: keyParameters.fields
                .map((fields) => ({ ...fields,
                    field: Buffer.from(fields.field, 'utf-8'),
                    value: Buffer.from(fields.value, 'utf-8') }))
        };
        const response = await sendPostRequest(
            `/databases/${databaseId}/hash?encoding=buffer`,
            requestBody
        );

        await t
            .expect(response.status)
            .eql(201, 'The creation of new Hash key request failed');
    }

    /**
     * Add Stream key
     * @param keyParameters The key parameters
     * @param databaseParameters The database parameters
     */
    async addStreamKeyApi(
        keyParameters: StreamKeyParameters,
        databaseParameters: AddNewDatabaseParameters
    ): Promise<void> {
        const databaseId = await databaseAPIRequests.getDatabaseIdByName(
            databaseParameters.databaseName
        );

        // ensure key doesn't exist
        await this.deleteKeyApi(keyParameters.keyName, databaseId);

        const requestBody = {
            keyName: Buffer.from(keyParameters.keyName, 'utf-8'),
            expire: keyParameters.ttl,
            entries: keyParameters.entries
                .map((member) =>
                    ({
                        ...member,
                        fields: member.fields.map(({ name, value }) => ({
                            name: Buffer.from(name, 'utf-8'),
                            value: Buffer.from(value, 'utf-8')
                        }))
                    }))
        };
        const response = await sendPostRequest(
            `/databases/${databaseId}/streams?encoding=buffer`,
            requestBody
        );
        await t
            .expect(response.status)
            .eql(201, 'The creation of new Stream key request failed');
    }

    /**
     * Add Set key
     * @param keyParameters The key parameters
     * @param databaseParameters The database parameters
     */
    async addSetKeyApi(
        keyParameters: SetKeyParameters,
        databaseParameters: AddNewDatabaseParameters
    ): Promise<void> {
        const databaseId = await databaseAPIRequests.getDatabaseIdByName(
            databaseParameters.databaseName
        );

        // ensure key doesn't exist
        await this.deleteKeyApi(keyParameters.keyName, databaseId);

        const requestBody = {
            keyName: Buffer.from(keyParameters.keyName, 'utf-8'),
            expire: keyParameters.ttl,
            members: keyParameters.members
                .map((member) => (Buffer.from(member, 'utf-8')))
        };
        const response = await sendPostRequest(
            `/databases/${databaseId}/set?encoding=buffer`,
            requestBody
        );

        await t
            .expect(response.status)
            .eql(201, 'The creation of new Set key request failed');
    }

    /**
     * Add Sorted Set key
     * @param keyParameters The key parameters
     * @param databaseParameters The database parameters
     */
    async addSortedSetKeyApi(
        keyParameters: SortedSetKeyParameters,
        databaseParameters: AddNewDatabaseParameters
    ): Promise<void> {
        const databaseId = await databaseAPIRequests.getDatabaseIdByName(
            databaseParameters.databaseName
        );

        // ensure key doesn't exist
        await this.deleteKeyApi(keyParameters.keyName, databaseId);

        const requestBody = {
            keyName: Buffer.from(keyParameters.keyName, 'utf-8'),
            expire: keyParameters.ttl,
            members: keyParameters.members
                .map((member) => ({ ...member, name: Buffer.from(member.name, 'utf-8') }))
        };
        const response = await sendPostRequest(
            `/databases/${databaseId}/zSet?encoding=buffer`,
            requestBody
        );

        await t
            .expect(response.status)
            .eql(201, 'The creation of new Sorted Set key request failed');
    }

    /**
     * Add List key
     * @param keyParameters The key parameters
     * @param databaseParameters The database parameters
     */
    async addListKeyApi(
        keyParameters: ListKeyParameters,
        databaseParameters: AddNewDatabaseParameters
    ): Promise<void> {
        const databaseId = await databaseAPIRequests.getDatabaseIdByName(
            databaseParameters.databaseName
        );

        // ensure key doesn't exist
        await this.deleteKeyApi(keyParameters.keyName, databaseId);

        const requestBody = {
            keyName: Buffer.from(keyParameters.keyName, 'utf-8'),
            expire: keyParameters.ttl,
            elements: keyParameters.elements
        };
        const response = await sendPostRequest(
            `/databases/${databaseId}/list?encoding=buffer`,
            requestBody
        );

        await t
            .expect(response.status)
            .eql(201, 'The creation of new List key request failed');
    }

    /**
     * Add String key
     * @param keyParameters The key parameters
     * @param databaseParameters The database parameters
     */
    async addStringKeyApi(
        keyParameters: StringKeyParameters,
        databaseParameters: AddNewDatabaseParameters
    ): Promise<void> {
        const databaseId = await databaseAPIRequests.getDatabaseIdByName(
            databaseParameters.databaseName
        );

        // ensure key doesn't exist
        await this.deleteKeyApi(keyParameters.keyName, databaseId);

        const requestBody = {
            keyName: Buffer.from(keyParameters.keyName, 'utf-8'),
            expire: keyParameters.ttl,
            value: Buffer.from(keyParameters.value, 'utf-8')
        };
        const response = await sendPostRequest(
            `/databases/${databaseId}/string?encoding=buffer`,
            requestBody
        );

        await t
            .expect(response.status)
            .eql(201, 'The creation of new string key request failed');
    }

    /**
     * Add Json key
     * @param keyParameters The key parameters
     * @param databaseParameters The database parameters
     */
    async addJsonKeyApi(
        keyParameters: JsonKeyParameters,
        databaseParameters: AddNewDatabaseParameters
    ): Promise<void> {
        const databaseId = await databaseAPIRequests.getDatabaseIdByName(
            databaseParameters.databaseName
        );

        // ensure key doesn't exist
        await this.deleteKeyApi(keyParameters.keyName, databaseId);

        const requestBody = {
            keyName: keyParameters.keyName,
            expire: keyParameters.ttl,
            data: JSON.stringify(keyParameters.data)
        };
        const response = await sendPostRequest(
            `/databases/${databaseId}/rejson-rl`,
            requestBody
        );

        await t
            .expect(response.status)
            .eql(201, 'The creation of new json key request failed');
    }

    /**
     * Search Key by name
     * @param keyName The key name
     * @param databaseName The database name
     */
    async searchKeyByNameApi(
        keyName: string,
        databaseName: string
    ): Promise<string[]> {
        const requestBody = {
            cursor: '0',
            match: keyName
        };
        const databaseId = await databaseAPIRequests.getDatabaseIdByName(
            databaseName
        );
        const response = await sendPostRequest(
            bufferPathMask.replace('databaseId', databaseId),
            requestBody
        );
        await t.expect(response.status).eql(200, 'Getting key request failed');
        return await response.body[0].keys;
    }

    /**
     * Delete Key by name if it exists
     * @param keyName The key name
     * @param databaseName The database name
     */
    async deleteKeyByNameApi(
        keyName: string,
        databaseName: string
    ): Promise<void> {
        const databaseId = await databaseAPIRequests.getDatabaseIdByName(
            databaseName
        );
        const isKeyExist = await this.searchKeyByNameApi(keyName, databaseName);
        if (isKeyExist.length > 0) {
            const requestBody = { keyNames: [Buffer.from(keyName, 'utf-8')] };
            const response = await sendDeleteRequest(
                bufferPathMask.replace('databaseId', databaseId),
                requestBody
            );
            await t
                .expect(response.status)
                .eql(200, 'The deletion of the key request failed');
        }
    }

    /**
     * Delete Key by name
     * @param keyName The key name
     * @param databaseId The database id
     */
    async deleteKeyApi(
        keyName: string,
        databaseId: string,
    ): Promise<void> {
        try {
            await sendDeleteRequest(
                `/databases/${databaseId}/keys`,
                {
                    keyNames: [keyName],
                },
            )
        } catch (e) {
            // ignore errors
        }
    }
}
