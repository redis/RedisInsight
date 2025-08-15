import { expect, Locator, Page } from '@playwright/test'
import { TlsCertificates } from '../../helpers/constants'
import { RedisCloudSigninPanel } from '../components/redis-cloud-sign-in-panel'
import {
    SentinelParameters,
    AddNewDatabaseParameters,
    SSHParameters,
} from '../../types'
import { BasePage } from '../base-page'

export class AddRedisDatabaseDialog extends BasePage {
    readonly redisCloudSigninPanel: RedisCloudSigninPanel

    // BUTTONS
    readonly addDatabaseButton: Locator

    readonly addRedisDatabaseButton: Locator

    readonly customSettingsButton: Locator

    readonly addAutoDiscoverDatabase: Locator

    readonly addCloudDatabaseButton: Locator

    readonly redisSoftwareButton: Locator

    readonly redisSentinelButton: Locator

    // TEXT INPUTS
    readonly hostInput: Locator

    readonly portInput: Locator

    readonly databaseAliasInput: Locator

    readonly passwordInput: Locator

    readonly usernameInput: Locator

    readonly accessKeyInput: Locator

    readonly secretKeyInput: Locator

    readonly databaseIndexInput: Locator

    // TABS
    readonly generalTab: Locator

    readonly securityTab: Locator

    readonly decompressionTab: Locator

    // DROPDOWNS
    readonly caCertField: Locator

    readonly clientCertField: Locator

    readonly selectCompressor: Locator

    // CHECKBOXES
    readonly databaseIndexCheckbox: Locator

    readonly useSSHCheckbox: Locator

    // RADIO BUTTONS
    readonly sshPasswordRadioBtn: Locator

    readonly sshPrivateKeyRadioBtn: Locator

    // LABELS
    readonly dataCompressorLabel: Locator

    // SSH TEXT INPUTS
    readonly sshHostInput: Locator

    readonly sshPortInput: Locator

    readonly sshUsernameInput: Locator

    readonly sshPasswordInput: Locator

    readonly sshPrivateKeyInput: Locator

    readonly sshPassphraseInput: Locator

    // OTHER
    readonly timeoutInput: Locator

    // For certificate removal
    aiChatMessage: Locator

    aiCloseMessage: Locator

    trashIconMsk(certificate: TlsCertificates): string {
        return `[data-testid^="delete-${certificate}-cert"]`
    }

    getDeleteCertificate(certificate: TlsCertificates): Locator {
        return this.page.locator(this.trashIconMsk(certificate))
    }

    constructor(page: Page) {
        super(page)
        this.page = page
        this.redisCloudSigninPanel = new RedisCloudSigninPanel(page)

        // BUTTONS
        this.addDatabaseButton = page.locator(
            '[data-testid^="add-redis-database"]',
        )
        this.addRedisDatabaseButton = page.getByTestId('btn-submit')
        this.customSettingsButton = page.getByTestId('btn-connection-settings')
        this.addAutoDiscoverDatabase = page.getByTestId(
            'add-database_tab_software',
        )
        this.addCloudDatabaseButton = page.getByTestId('create-free-db-btn')
        this.redisSoftwareButton = page.getByTestId('option-btn-software')
        this.redisSentinelButton = page.getByTestId('option-btn-sentinel')

        // TEXT INPUTS
        this.hostInput = page.getByTestId('host')
        this.portInput = page.getByTestId('port')
        this.databaseAliasInput = page.getByTestId('name')
        this.passwordInput = page.getByTestId('password')
        this.usernameInput = page.getByTestId('username')
        this.accessKeyInput = page.getByTestId('access-key')
        this.secretKeyInput = page.getByTestId('secret-key')
        this.databaseIndexInput = page.getByTestId('db')

        // TABS
        this.generalTab = page.getByTestId('manual-form-tab-general')
        this.securityTab = page.getByTestId('manual-form-tab-security')
        this.decompressionTab = page.getByTestId(
            'manual-form-tab-decompression',
        )

        // DROPDOWNS
        this.caCertField = page.getByTestId('select-ca-cert')
        this.clientCertField = page.getByTestId('select-cert')
        this.selectCompressor = page.getByTestId('select-compressor')

        // CHECKBOXES
        this.databaseIndexCheckbox = page.locator(
            '[data-testid="showDb"] ~ div',
        )
        this.useSSHCheckbox = page.locator('[data-testid="use-ssh"] ~ div')

        // RADIO BUTTONS
        this.sshPasswordRadioBtn = page.locator('#password ~ div')
        this.sshPrivateKeyRadioBtn = page.locator('#privateKey ~ div')

        // LABELS
        this.dataCompressorLabel = page.getByTestId(
            '[data-testid="showCompressor"] ~ label',
        )
        this.aiChatMessage = page.getByTestId('ai-chat-message-btn')
        this.aiCloseMessage = page.locator(
            '[aria-label="Closes this modal window"]',
        )

        // SSH TEXT INPUTS
        this.sshHostInput = page.getByTestId('sshHost')
        this.sshPortInput = page.getByTestId('sshPort')
        this.sshUsernameInput = page.getByTestId('sshUsername')
        this.sshPasswordInput = page.getByTestId('sshPassword')
        this.sshPrivateKeyInput = page.getByTestId('sshPrivateKey')
        this.sshPassphraseInput = page.getByTestId('sshPassphrase')

        // OTHER
        this.timeoutInput = page.getByTestId('timeout')
    }

    async addRedisDataBase(
        parameters: AddNewDatabaseParameters,
    ): Promise<void> {
        await expect(this.addDatabaseButton).toBeVisible({ timeout: 10000 })
        await this.addDatabaseButton.click()
        await this.customSettingsButton.click()
        await this.hostInput.fill(parameters.host)
        await this.portInput.fill(parameters.port)
        await this.databaseAliasInput.fill(parameters.databaseName || '')
        if (parameters.databaseUsername) {
            await this.usernameInput.fill(parameters.databaseUsername)
        }
        if (parameters.databasePassword) {
            await this.passwordInput.fill(parameters.databasePassword)
        }
    }

    async addLogicalRedisDatabase(
        parameters: AddNewDatabaseParameters,
        index: string,
    ): Promise<void> {
        await this.addDatabaseButton.click()
        await this.customSettingsButton.click()
        await this.hostInput.fill(parameters.host)
        await this.portInput.fill(parameters.port)
        await this.databaseAliasInput.fill(parameters.databaseName || '')
        if (parameters.databaseUsername) {
            await this.usernameInput.fill(parameters.databaseUsername)
        }
        if (parameters.databasePassword) {
            await this.passwordInput.fill(parameters.databasePassword)
        }
        await this.databaseIndexCheckbox.click()
        await this.databaseIndexInput.fill(index)
        await this.addRedisDatabaseButton.click()
    }

    async addStandaloneSSHDatabase(
        databaseParameters: AddNewDatabaseParameters,
        sshParameters: SSHParameters,
    ): Promise<void> {
        await this.addDatabaseButton.click()
        await this.customSettingsButton.click()
        await this.hostInput.fill(databaseParameters.host)
        await this.portInput.fill(databaseParameters.port)
        await this.databaseAliasInput.fill(
            databaseParameters.databaseName || '',
        )
        if (databaseParameters.databaseUsername) {
            await this.usernameInput.fill(databaseParameters.databaseUsername)
        }
        if (databaseParameters.databasePassword) {
            await this.passwordInput.fill(databaseParameters.databasePassword)
        }
        // Navigate to security tab and select SSH Tunnel checkbox
        await this.securityTab.click()
        await this.useSSHCheckbox.click()
        // Fill SSH fields
        await this.sshHostInput.fill(sshParameters.sshHost)
        await this.sshPortInput.fill(sshParameters.sshPort)
        await this.sshUsernameInput.fill(sshParameters.sshUsername)
        if (sshParameters.sshPassword) {
            await this.sshPasswordInput.fill(sshParameters.sshPassword)
        }
        if (sshParameters.sshPrivateKey) {
            await this.sshPrivateKeyRadioBtn.click()
            await this.sshPrivateKeyInput.fill(sshParameters.sshPrivateKey)
        }
        if (sshParameters.sshPassphrase) {
            await this.sshPrivateKeyRadioBtn.click()
            await this.sshPassphraseInput.fill(sshParameters.sshPassphrase)
        }
        await this.addRedisDatabaseButton.click()
    }

    async discoverSentinelDatabases(
        parameters: SentinelParameters,
    ): Promise<void> {
        await this.addDatabaseButton.click()
        await this.redisSentinelButton.click()
        if (parameters.sentinelHost) {
            await this.hostInput.fill(parameters.sentinelHost)
        }
        if (parameters.sentinelPort) {
            await this.portInput.fill(parameters.sentinelPort)
        }
        if (parameters.sentinelPassword) {
            await this.passwordInput.fill(parameters.sentinelPassword)
        }
    }

    async addAutodiscoverREClusterDatabase(
        parameters: AddNewDatabaseParameters,
    ): Promise<void> {
        await this.addDatabaseButton.click()
        await this.redisSoftwareButton.click()
        await this.hostInput.fill(parameters.host)
        await this.portInput.fill(parameters.port)
        await this.usernameInput.fill(parameters.databaseUsername || '')
        await this.passwordInput.fill(parameters.databasePassword || '')
    }

    async addAutodiscoverRECloudDatabase(
        cloudAPIAccessKey: string,
        cloudAPISecretKey: string,
    ): Promise<void> {
        await this.addDatabaseButton.click()
        await this.addCloudDatabaseButton.click()
        await this.accessKeyInput.fill(cloudAPIAccessKey)
        await this.secretKeyInput.fill(cloudAPISecretKey)
    }

    async addOssClusterDatabase(
        parameters: AddNewDatabaseParameters,
    ): Promise<void> {
        await this.addDatabaseButton.click()
        await this.customSettingsButton.click()
        if (parameters.ossClusterHost) {
            await this.hostInput.fill(parameters.ossClusterHost)
        }
        if (parameters.ossClusterPort) {
            await this.portInput.fill(parameters.ossClusterPort)
        }
        if (parameters.ossClusterDatabaseName) {
            await this.databaseAliasInput.fill(
                parameters.ossClusterDatabaseName,
            )
        }
    }

    async setCompressorValue(compressor: string): Promise<void> {
        if (!(await this.selectCompressor.isVisible())) {
            await this.dataCompressorLabel.click()
        }
        await this.selectCompressor.click()
        await this.page.locator(`[id="${compressor}"]`).click()
    }

    async removeCertificateButton(
        certificate: TlsCertificates,
        name: string,
    ): Promise<void> {
        await this.securityTab.click()
        const row = this.page
            .locator('button')
            .locator('div')
            .filter({ hasText: name })
        const removeButtonFooter = this.page.locator(
            '[class^="_popoverFooter"]',
        )
        if (certificate === TlsCertificates.CA) {
            await this.caCertField.click()
        } else {
            await this.clientCertField.click()
        }
        await row.locator(this.trashIconMsk(certificate)).click()
        await removeButtonFooter.locator(this.trashIconMsk(certificate)).click()
    }
}
