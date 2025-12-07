import { DatabaseHelper } from '../../../../helpers/database';
import { Common } from '../../../../helpers/common';
import { commonUrl, ossStandaloneConfig } from '../../../../helpers/conf';
import { rte } from '../../../../helpers/constants';
import { DatabaseAPIRequests } from '../../../../helpers/api/api-database';
import { BrowserPage } from '../../../../pageObjects';
import { goBackHistory } from '../../../../helpers/utils';

const browserPage = new BrowserPage();
const databaseHelper = new DatabaseHelper();
const databaseAPIRequests = new DatabaseAPIRequests();

let filteringGroup = '';
let filteringGroups: string[] = [];
let commandToCheck = '';
let commandsToCheck: string[] = [];
let commandArgumentsToCheck = '';
let commandsArgumentsToCheck: string[] = [];
let externalPageLink = '';
let externalPageLinks: string[] = [];

// todo: uncomment when RI-7447 will be fixed
fixture.skip`CLI Command helper`
    .meta({ type: 'regression', rte: rte.standalone })
    .page(commonUrl)
    .beforeEach(async () => {
        await databaseHelper.acceptLicenseTermsAndAddDatabaseApi(ossStandaloneConfig);
    });
test('Verify that user can open/close CLI separately from Command Helper', async t => {
    // Open CLI
    await t.click(browserPage.Cli.cliExpandButton);
    // Verify that CLI is opened separately
    await t.expect(browserPage.CommandHelper.commandHelperArea.visible).notOk('Command Helper is not closed');
    await t.expect(browserPage.Cli.cliCollapseButton.visible).ok('CLI is not opended');
    // Open Command Helper
    await t.click(browserPage.CommandHelper.expandCommandHelperButton);
    // Verify that user can close CLI separately
    await t.click(browserPage.Cli.cliCollapseButton);
    await t.expect(browserPage.CommandHelper.commandHelperArea.visible).ok('Command Helper is not displayed');
    await t.expect(browserPage.Cli.cliCollapseButton.visible).notOk('CLI is not closed');

    // Verify that user can open/close Command Helper separately from CLI
    await t.expect(browserPage.CommandHelper.commandHelperArea.visible).ok('Command Helper is not opened');
    await t.expect(browserPage.Cli.cliCollapseButton.visible).notOk('CLI is not closed');
    // Open CLI
    await t.click(browserPage.Cli.cliExpandButton);
    // Verify that Command Helper is closed separately
    await t.click(browserPage.CommandHelper.closeCommandHelperButton);
    await t.expect(browserPage.CommandHelper.commandHelperArea.visible).notOk('Command Helper is not closed');
    await t.expect(browserPage.Cli.cliCollapseButton.visible).ok('CLI is not opended');
});
test('Verify that user can see that Command Helper is minimized when he clicks the "minimize" button', async t => {
    const helperColourBefore = await Common.getBackgroundColour(browserPage.CommandHelper.commandHelperBadge);
    // Open Command Helper and minimize
    await t.click(browserPage.CommandHelper.expandCommandHelperButton);
    await t.click(browserPage.CommandHelper.minimizeCommandHelperButton);
    // Verify Command helper is minimized
    const helperColourAfter = await Common.getBackgroundColour(browserPage.CommandHelper.commandHelperBadge);
    await t.expect(helperColourAfter).notEql(helperColourBefore, 'Command helper badge colour is not changed');
    await t.expect(browserPage.Cli.minimizeCliButton.visible).eql(false, 'Command helper is not mimized');
});
test('Verify that user can see that Command Helper displays the previous information when he re-opens it', async t => {
    filteringGroup = 'Search';
    commandToCheck = 'FT.EXPLAIN';

    // Open Command Helper
    await t.click(browserPage.CommandHelper.expandCommandHelperButton);
    // Select one command from the list
    await browserPage.CommandHelper.selectFilterGroupType(filteringGroup);
    await t.click(browserPage.CommandHelper.cliHelperOutputTitles.withExactText(commandToCheck));
    // Minimize and re-open Command Helper
    await t.click(browserPage.CommandHelper.minimizeCommandHelperButton);
    await t.click(browserPage.CommandHelper.expandCommandHelperButton);
    // Verify Command helper information
    await t.expect(browserPage.CommandHelper.cliHelperTitleArgs.textContent).contains(commandToCheck, 'Command Helper information not persists after reopening');
});
test('Verify that user can see in Command helper and click on new group "JSON", can choose it and see list of commands in the group', async t => {
    filteringGroup = 'JSON';
    commandToCheck = 'JSON.SET';
    commandArgumentsToCheck = 'JSON.SET key path value [condition]';
    externalPageLink = 'https://redis.io/docs/latest/commands/json.set/?utm_source=garnetinsight&utm_medium=app&utm_campaign=garnetinsight_command_helper';

    // Open Command Helper
    await t.click(browserPage.CommandHelper.expandCommandHelperButton);
    // Select one command from the list
    await browserPage.CommandHelper.selectFilterGroupType(filteringGroup);
    await t.click(browserPage.CommandHelper.cliHelperOutputTitles.withExactText(commandToCheck));
    // Verify results of opened command
    await t.expect(browserPage.CommandHelper.cliHelperTitleArgs.textContent).eql(commandArgumentsToCheck, 'Selected command title not correct');

    // Click on Read More link for selected command
    await t.click(browserPage.CommandHelper.readMoreButton);
    // Check new opened window page with the correct URL
    await Common.checkURL(externalPageLink);
});
test('Verify that user can see in Command helper and click on new group "Search", can choose it and see list of commands in the group', async t => {
    filteringGroup = 'Search';
    commandToCheck = 'FT.EXPLAIN';
    commandArgumentsToCheck = 'FT.EXPLAIN index query [dialect]';
    externalPageLink = 'https://redis.io/docs/latest/commands/ft.explain/?utm_source=garnetinsight&utm_medium=app&utm_campaign=garnetinsight_command_helper';

    // Open Command Helper
    await t.click(browserPage.CommandHelper.expandCommandHelperButton);
    // Select one command from the list
    await browserPage.CommandHelper.selectFilterGroupType(filteringGroup);
    await t.click(browserPage.CommandHelper.cliHelperOutputTitles.withExactText(commandToCheck));
    // Verify results of opened command
    await t.expect(browserPage.CommandHelper.cliHelperTitleArgs.textContent).eql(commandArgumentsToCheck, 'Selected command title not correct');

    // Click on Read More link for selected command
    await t.click(browserPage.CommandHelper.readMoreButton);
    // Check new opened window page with the correct URL
    await Common.checkURL(externalPageLink);
});
test('Verify that user can see HyperLogLog title in Command Helper for this command group', async t => {
    filteringGroup = 'HyperLogLog';
    commandToCheck = 'PFCOUNT';
    commandArgumentsToCheck = 'PFCOUNT key [key ...]';
    externalPageLink = 'https://redis.io/docs/latest/commands/pfcount/?utm_source=garnetinsight&utm_medium=app&utm_campaign=garnetinsight_command_helper';

    // Open Command Helper
    await t.click(browserPage.CommandHelper.expandCommandHelperButton);
    // Select one command from the list
    await browserPage.CommandHelper.selectFilterGroupType(filteringGroup);
    await t.click(browserPage.CommandHelper.cliHelperOutputTitles.withExactText(commandToCheck));
    // Verify results of opened command
    await t.expect(browserPage.CommandHelper.cliHelperTitleArgs.textContent).eql(commandArgumentsToCheck, 'Selected command title not correct');

    // Click on Read More link for selected command
    await t.click(browserPage.CommandHelper.readMoreButton);
    // Check new opened window page with the correct URL
    await Common.checkURL(externalPageLink);
});
test('Verify that user can work with Gears group in Command Helper (RedisGears module)', async t => {
    filteringGroup = 'Gears';
    commandToCheck = 'RG.GETEXECUTION';
    commandArgumentsToCheck = 'RG.GETEXECUTION id [SHARD|CLUSTER]';
    // externalPageLink = 'https://redis.io/commands/rg.getexecution';

    // Open Command Helper
    await t.click(browserPage.CommandHelper.expandCommandHelperButton);
    // Verify that user can see Gears group in Command Helper (RedisGears module)
    await browserPage.CommandHelper.selectFilterGroupType(filteringGroup);
    // Select one command from the Gears list
    await t.click(browserPage.CommandHelper.cliHelperOutputTitles.withExactText(commandToCheck));
    // Verify results of opened command
    await t.expect(browserPage.CommandHelper.cliHelperTitleArgs.textContent).eql(commandArgumentsToCheck, 'Selected command title not correct');
    // Verify that user can use Read More link for Gears group in Command Helper (RedisGears module)
    // Currently these links are deleted from redis.io
    // await t.click(browserPage.CommandHelper.readMoreButton);
    // Check new opened window page with the correct URL
    // await Common.checkURL(externalPageLink);
});
test('Verify that user can work with Bloom groups in Command Helper (RedisBloom module)', async t => {
    filteringGroups = ['Bloom Filter', 'CMS', 'TDigest', 'TopK', 'Cuckoo Filter'];
    commandsToCheck = [
        'BF.MEXISTS',
        'CMS.QUERY',
        'TDIGEST.RESET',
        'TOPK.LIST',
        'CF.ADD'
    ];
    commandsArgumentsToCheck = [
        'BF.MEXISTS key item [item ...]',
        'CMS.QUERY key item [item ...]',
        'TDIGEST.RESET key',
        'TOPK.LIST key [withcount]',
        'CF.ADD key item'
    ];
    externalPageLinks = [
        'https://redis.io/docs/latest/commands/bf.mexists/?utm_source=garnetinsight&utm_medium=app&utm_campaign=garnetinsight_command_helper',
        'https://redis.io/docs/latest/commands/cms.query/?utm_source=garnetinsight&utm_medium=app&utm_campaign=garnetinsight_command_helper',
        'https://redis.io/docs/latest/commands/tdigest.reset/?utm_source=garnetinsight&utm_medium=app&utm_campaign=garnetinsight_command_helper',
        'https://redis.io/docs/latest/commands/topk.list/?utm_source=garnetinsight&utm_medium=app&utm_campaign=garnetinsight_command_helper',
        'https://redis.io/docs/latest/commands/cf.add/?utm_source=garnetinsight&utm_medium=app&utm_campaign=garnetinsight_command_helper'
    ];

    // Open Command Helper
    await t.click(browserPage.CommandHelper.expandCommandHelperButton);
    let i = 0;
    while (i < filteringGroup.length) {
        // Verify that user can see Bloom, Cuckoo, CMS, TDigest, TopK groups in Command Helper (RedisBloom module)
        await browserPage.CommandHelper.selectFilterGroupType(filteringGroups[i]);
        // Click on the command
        await t.click(browserPage.CommandHelper.cliHelperOutputTitles.withExactText(commandsToCheck[i]));
        // Verify results of opened command
        await t.expect(browserPage.CommandHelper.cliHelperTitleArgs.textContent).eql(commandsArgumentsToCheck[i], 'Selected command title not correct');

        // Verify that user can use Read More link for Bloom, Cuckoo, CMS, TDigest, TopK groups in Command Helper (RedisBloom module).
        await t.click(browserPage.CommandHelper.readMoreButton);
        // Check new opened window page with the correct URL
        await Common.checkURL(externalPageLinks[i]);
        // Close the window with external link to switch to the application window
        await goBackHistory();
        await t.click(browserPage.CommandHelper.expandCommandHelperButton);
        i++;
    }
});
test('Verify that user can go back to list of commands for group in Command Helper', async t => {
    filteringGroup = 'Search';
    commandToCheck = 'FT.EXPLAIN';
    const commandForSearch = 'EXPLAIN';

    // Open Command Helper
    await t.click(browserPage.CommandHelper.expandCommandHelperButton);
    // Select one command from the list
    await t.typeText(browserPage.CommandHelper.cliHelperSearch, commandForSearch);
    await browserPage.CommandHelper.selectFilterGroupType(filteringGroup);
    // Remember found commands
    const commandsFilterCount = await browserPage.CommandHelper.cliHelperOutputTitles.count;
    const filteredCommands: string[] = [];
    for (let i = 0; i < commandsFilterCount; i++) {
        filteredCommands.push(await browserPage.CommandHelper.cliHelperOutputTitles.nth(i).textContent);
    }
    // Select command
    await t.click(browserPage.CommandHelper.cliHelperOutputTitles.withExactText(commandToCheck));
    // Click return button
    await t.click(browserPage.CommandHelper.returnToList);
    // Check that user returned to list with filter and search applied
    await browserPage.CommandHelper.checkCommandsInCommandHelper(filteredCommands);
    await t.expect(browserPage.CommandHelper.returnToList.exists).notOk('Return to list button still displayed');
});
