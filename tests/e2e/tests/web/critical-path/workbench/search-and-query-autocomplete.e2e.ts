import { Common, DatabaseHelper } from '../../../../helpers';
import { DatabaseAPIRequests } from '../../../../helpers/api/api-database';
import { BrowserPage, WorkbenchPage } from '../../../../pageObjects';
import { ExploreTabs, rte } from '../../../../helpers/constants';
import { commonUrl, ossStandaloneConfig } from '../../../../helpers/conf';
import { APIKeyRequests } from '../../../../helpers/api/api-keys';

const databaseHelper = new DatabaseHelper();
const databaseAPIRequests = new DatabaseAPIRequests();
const browserPage = new BrowserPage();
const workbenchPage = new WorkbenchPage();
const apiKeyRequests = new APIKeyRequests();

const keyName = Common.generateWord(10);
let keyNames: string[];
let indexName1: string;
let indexName2: string;
let indexName3: string;

fixture `Autocomplete for entered commands in search and query`
    .meta({ type: 'critical_path', rte: rte.standalone })
    .page(commonUrl)
    .beforeEach(async t => {
        await databaseHelper.acceptLicenseTermsAndAddDatabaseApi(ossStandaloneConfig);
        indexName1 = `idx1:${keyName}`;
        indexName2 = `idx2:${keyName}`;
        indexName3 = `idx3:${keyName}`;
        keyNames = [`${keyName}:1`, `${keyName}:2`, `${keyName}:3`];
        const commands = [
            `HSET ${keyNames[0]} "name" "Hall School" "description" " Spanning 10 states" "class" "independent" "type" "traditional" "address_city" "London" "address_street" "Manor Street" "students" 342 "location" "51.445417, -0.258352"`,
            `HSET ${keyNames[1]} "name" "Garden School" "description" "Garden School is a new outdoor" "class" "state" "type" "forest; montessori;" "address_city" "London" "address_street" "Gordon Street" "students" 1452 "location" "51.402926, -0.321523"`,
            `HSET ${keyNames[2]} "name" "Gillford School" "description" "Gillford School is a centre" "class" "private" "type" "democratic; waldorf" "address_city" "Goudhurst" "address_street" "Goudhurst" "students" 721 "location" "51.112685, 0.451076"`,
            `FT.CREATE ${indexName1} ON HASH PREFIX 1 "${keyName}:" SCHEMA name TEXT NOSTEM description TEXT class TAG type TAG SEPARATOR ";" address_city AS city TAG address_street AS address TEXT NOSTEM students NUMERIC SORTABLE location GEO`,
            `FT.CREATE ${indexName2} ON HASH PREFIX 1 "${keyName}:" SCHEMA name TEXT NOSTEM description TEXT class TAG type TAG SEPARATOR ";" address_city AS city TAG address_street AS address TEXT NOSTEM students NUMERIC SORTABLE location GEO`
        ];

        // Create 3 keys and index
        await browserPage.Cli.sendCommandsInCli(commands);
        await t.click(browserPage.NavigationTabs.workbenchButton);
    })
    .afterEach(async() => {
        // Clear and delete database
        await apiKeyRequests.deleteKeyByNameApi(keyName, ossStandaloneConfig.databaseName);
        await browserPage.Cli.sendCommandsInCli([
            `DEL ${keyNames.join(' ')}`, `FT.DROPINDEX ${indexName1}`,
            `DEL ${keyNames.join(' ')}`, `FT.DROPINDEX ${indexName2}`,
        ]);
    });
test
    .skip('Verify that tutorials can be opened from Workbench', async t => {
    await t.click(browserPage.NavigationTabs.workbenchButton);
    await t.click(workbenchPage.getTutorialLinkLocator('sq-intro'));
    await t.expect(workbenchPage.InsightsPanel.sidePanel.exists).ok('Insight panel is not opened');
    const tab = await browserPage.InsightsPanel.setActiveTab(ExploreTabs.Tutorials);
    await t.expect(tab.preselectArea.textContent).contains('INTRODUCTION', 'the tutorial page is incorrect');
});
test('Verify that user can use show more to see command fully in 2nd tooltip', async t => {
    const commandDetails = [
        'index query [VERBATIM] [LOAD count field [field ...]]',
        'Run a search query on an index and perform aggregate transformations on the results',
        'Arguments:',
        'required index',
        'required query',
        'optional [verbatim]'
    ];
    await t.typeText(workbenchPage.queryInput, 'FT.A', { replace: true });
    // Verify that user can use show more to see command fully in 2nd tooltip
    await t.pressKey('ctrl+space');
    await t.expect(workbenchPage.MonacoEditor.monacoCommandDetails.exists).ok('The "read more" about the command is not opened');
    for(const detail of commandDetails) {
        await t.expect(workbenchPage.MonacoEditor.monacoCommandDetails.textContent).contains(detail, `The ${detail} command detail is not displayed`);
    }
    // Verify that user can close show more tooltip by 'x' or 'Show less'
    await t.pressKey('ctrl+space');
    await t.expect(workbenchPage.MonacoEditor.monacoCommandDetails.exists).notOk('The "read more" about the command is not closed');
});
test('Verify full commands suggestions with index and query for FT.AGGREGATE', async t => {
    const groupByArgInfo = 'GROUPBY nargs property [property ...] [REDUCE ';
    const indexFields = [
        'address',
        'city',
        'class',
        'description',
        'location',
        'name',
        'students',
        'type'
    ];
    const ftSortedCommands = ['FT.SEARCH', 'FT.AGGREGATE', 'FT.CREATE', 'FT.EXPLAIN', 'FT.PROFILE'];

    // Verify basic commands suggestions FT.SEARCH and FT.AGGREGATE
    await t.typeText(workbenchPage.queryInput, 'FT', { replace: true });
    // Verify custom sorting for FT. commands
    await t.expect(await workbenchPage.MonacoEditor.getSuggestionsArrayFromMonaco(5)).eql(ftSortedCommands, 'Wrong order of FT commands');
    // Verify that the list with FT.SEARCH and FT.AGGREGATE auto-suggestions is displayed
    await t.expect(workbenchPage.MonacoEditor.monacoSuggestion.withText('FT._LIST').exists).ok('FT._LIST auto-suggestions are not displayed');
    await t.expect(workbenchPage.MonacoEditor.monacoSuggestion.withText('FT.AGGREGATE').exists).ok('FT.AGGREGATE auto-suggestions are not displayed');

    // Select command and check result
    await t.typeText(workbenchPage.queryInput, '.AG', { replace: false });
    await t.pressKey('enter');
    let script = await workbenchPage.queryInputScriptArea.textContent;
    await t.expect(script.replace(/\s/g, ' ')).contains('FT.AGGREGATE ', 'Result of sent command exists');

    // Verify that user can see the list of all the indexes in database when put a space after only FT.SEARCH and FT.AGGREGATE commands
    await t.expect(script.replace(/\s/g, ' ')).contains(`'${indexName1}' 'query to search' `, 'Index not suggested into input');
    await t.expect(workbenchPage.MonacoEditor.monacoSuggestion.withExactText(indexName1).exists).ok('Index not auto-suggested');
    await t.expect(workbenchPage.MonacoEditor.monacoSuggestion.withExactText(indexName2).exists).ok('All indexes not auto-suggested');

    await t.pressKey('tab');
    await t.wait(200);
    await t.typeText(workbenchPage.queryInput, '@', { replace: false });
    script = await workbenchPage.queryInputScriptArea.textContent;
    // Verify that user can see the list of fields from the index selected when type in “@”
    await t.expect(script.replace(/\s/g, ' ')).contains('address', 'Index not suggested into input');
    for(const field of indexFields) {
        await t.expect(workbenchPage.MonacoEditor.monacoSuggestion.withExactText(field).exists).ok(`${field} Index field not auto-suggested`);
    }
    // Verify that user can use autosuggestions by typing fields from index after "@"
    await t.typeText(workbenchPage.queryInput, 'ci', { replace: false });
    await t.expect(workbenchPage.MonacoEditor.monacoSuggestion.withExactText('city').exists).ok('Index field not auto-suggested after starting typing');
    await t.expect(workbenchPage.MonacoEditor.monacoSuggestion.count).eql(1, 'Wrong index fields suggested after typing first letter');

    // Go out of index field
    await t.pressKey('tab');
    await t.pressKey('tab');
    await t.pressKey('right');
    await t.pressKey('space');
    // Verify contextual suggestions after typing letters for commands
    await t.expect(workbenchPage.MonacoEditor.monacoSuggestion.withExactText('APPLY').exists).ok('FT.AGGREGATE arguments not suggested');
    await t.typeText(workbenchPage.queryInput, 'g', { replace: false });
    await t.expect(workbenchPage.MonacoEditor.monacoSuggestion.nth(0).textContent).contains('GROUPBY', 'Argument not suggested after typing first letters');

    await t.pressKey('tab');
    // Verify that user can see widget about entered argument
    await t.expect(workbenchPage.MonacoEditor.monacoHintWithArguments.textContent).contains(groupByArgInfo, 'Widget with info about entered argument not displayed');

    await t.typeText(workbenchPage.queryInput, '1 "London"', { replace: false });
    await t.pressKey('space');
    // Verify correct order of suggested arguments like LOAD, GROUPBY, SORTBY
    await t.expect(workbenchPage.MonacoEditor.monacoSuggestion.nth(0).textContent).contains('REDUCE', 'Incorrect order of suggested arguments');
    await t.pressKey('tab');
    await t.typeText(workbenchPage.queryInput, 'SUM 1 @students', { replace: false });
    await t.pressKey('space');

    // Verify expression and function suggestions like AS for APPLY/GROUPBY
    await t.expect(workbenchPage.MonacoEditor.monacoSuggestion.nth(0).textContent).contains('AS', 'Incorrect order of suggested arguments');
    await t.pressKey('tab');
    await t.typeText(workbenchPage.queryInput, 'stud', { replace: false });

    await t.pressKey('space');
    // Verify multiple argument option suggestions
    await t.expect(workbenchPage.MonacoEditor.monacoSuggestion.nth(0).textContent).contains('REDUCE', 'Incorrect order of suggested arguments');
    // Verify complex command sequences like nargs and properties are suggested accurately for GROUPBY
    const expectedText = `FT.AGGREGATE '${indexName1}' '@city:{tag} ' GROUPBY 1 "London" REDUCE SUM 1 @students AS stud REDUCE`.trim().replace(/\s+/g, ' ');
    await t.expect((await workbenchPage.queryInputForText.innerText).trim().replace(/\s+/g, ' ')).contains(expectedText, 'Incorrect order of entered arguments');
});
test('Verify full commands suggestions with index and query for FT.SEARCH', async t => {
    await t.typeText(workbenchPage.queryInput, 'FT.SEA', { replace: true });
    // Select command and check result
    await t.pressKey('enter');
    const script = await workbenchPage.queryInputScriptArea.textContent;
    await t.expect(script.replace(/\s/g, ' ')).contains('FT.SEARCH ', 'Result of sent command exists');

    await t.pressKey('tab')
    // Select '@city' field
    await workbenchPage.selectFieldUsingAutosuggest('city')
    await t.expect(workbenchPage.MonacoEditor.monacoSuggestion.withExactText('DIALECT').exists).ok('FT.SEARCH arguments not suggested');
    await t.typeText(workbenchPage.queryInput, 'n', { replace: false });
    await t.expect(workbenchPage.MonacoEditor.monacoSuggestion.nth(0).textContent).contains('NOCONTENT', 'Argument not suggested after typing first letters');
    await t.pressKey('tab');
    // Verify that FT.SEARCH and FT.AGGREGATE non-multiple arguments are suggested only once
    await t.pressKey('space');
    await t.expect(workbenchPage.MonacoEditor.monacoSuggestion.withText('NOCONTENT').exists).notOk('Non-multiple arguments are suggested not only once');

    // Verify that suggestions correct to closest valid commands or options for invalid typing like WRONGCOMMAND
    await t.typeText(workbenchPage.queryInput, 'WRONGCOMMAND', { replace: false });
    await t.expect(workbenchPage.MonacoEditor.monacoSuggestion.withExactText('WITHSORTKEYS').exists).ok('Closest suggestions not displayed');

    await t.pressKey('space');
    await t.pressKey('backspace');
    await t.pressKey('backspace');
    // Verify that 'No suggestions' tooltip is displayed when returning to invalid typing like WRONGCOMMAND
    await t.expect(workbenchPage.MonacoEditor.monacoSuggestWidget.textContent).contains('No suggestions.', 'Index not auto-suggested');
});
test('Verify full commands suggestions with index and query for FT.PROFILE(SEARCH)', async t => {
    await t.typeText(workbenchPage.queryInput, 'FT.PR', { replace: true });
    // Select command and check result
    await t.pressKey('enter');
    const script = await workbenchPage.queryInputScriptArea.textContent;
    await t.expect(script.replace(/\s/g, ' ')).contains('FT.PROFILE ', 'Result of sent command exists');

    await t.pressKey('tab');
    await t.expect(workbenchPage.MonacoEditor.monacoSuggestion.withExactText('AGGREGATE').exists).ok('FT.PROFILE aggregate argument not suggested');
    await t.expect(workbenchPage.MonacoEditor.monacoSuggestion.withExactText('SEARCH').exists).ok('FT.PROFILE search argument not suggested');

    // Select SEARCH command
    await t.typeText(workbenchPage.queryInput, 'SEA', { replace: false });
    await t.pressKey('enter');
    await t.expect(workbenchPage.MonacoEditor.monacoSuggestion.withExactText('LIMITED').exists).ok('FT.PROFILE SEARCH arguments not suggested');
    await t.expect(workbenchPage.MonacoEditor.monacoSuggestion.withExactText('QUERY').exists).ok('FT.PROFILE SEARCH arguments not suggested');

    // Select QUERY
    await t.typeText(workbenchPage.queryInput, 'QUE', { replace: false });
    await t.pressKey('enter');
    await workbenchPage.selectFieldUsingAutosuggest('city');
    // Verify that there are no more suggestions
    await t.expect(workbenchPage.MonacoEditor.monacoSuggestion.exists).notOk('Additional invalid commands suggested');
    const expectedText = `FT.PROFILE '${indexName1}' SEARCH QUERY '@city:{tag} '`.trim().replace(/\s+/g, ' ');
    // Verify command entered correctly
    await t.expect((await workbenchPage.queryInputForText.innerText).trim().replace(/\s+/g, ' ')).contains(expectedText, 'Incorrect order of entered arguments');
});
test('Verify full commands suggestions with index and query for FT.PROFILE(AGGREGATE)', async t => {
    await t.typeText(workbenchPage.queryInput, 'FT.PR', { replace: true });
    // Select command and check result
    await t.pressKey('enter');
    await t.pressKey('tab');
    // Select AGGREGATE command
    await t.typeText(workbenchPage.queryInput, 'AGG', { replace: false });
    await t.pressKey('enter');
    await t.expect(workbenchPage.MonacoEditor.monacoSuggestion.withExactText('LIMITED').exists).ok('FT.PROFILE AGGREGATE arguments not suggested');
    await t.expect(workbenchPage.MonacoEditor.monacoSuggestion.withExactText('QUERY').exists).ok('FT.PROFILE AGGREGATE arguments not suggested');

    // Select QUERY
    await t.typeText(workbenchPage.queryInput, 'QUE', { replace: false });
    await t.pressKey('enter');
    await workbenchPage.selectFieldUsingAutosuggest('city');
    // Verify that there are no more suggestions
    await t.expect(workbenchPage.MonacoEditor.monacoSuggestion.exists).notOk('Additional invalid commands suggested');
    const expectedText = `FT.PROFILE '${indexName1}' AGGREGATE QUERY '@city:{tag} '`.trim().replace(/\s+/g, ' ');
    // Verify command entered correctly
    await t.expect((await workbenchPage.queryInputForText.innerText).trim().replace(/\s+/g, ' ')).contains(expectedText, 'Incorrect order of entered arguments');
});
test('Verify full commands suggestions with index and query for FT.EXPLAIN', async t => {
    await t.typeText(workbenchPage.queryInput, 'FT.EX', { replace: true });
    // Select command and check result
    await t.pressKey('enter');
    await t.pressKey('tab');
    await workbenchPage.selectFieldUsingAutosuggest('city');

    await t.expect(workbenchPage.MonacoEditor.monacoSuggestion.withExactText('DIALECT').exists).ok('FT.EXPLAIN arguments not suggested');
    // Add DIALECT
    await t.pressKey('enter');
    await t.typeText(workbenchPage.queryInput, 'dialectTest', { replace: false });
    // Verify that there are no more suggestions
    await t.pressKey('space');
    await t.expect(workbenchPage.MonacoEditor.monacoSuggestion.exists).notOk('Additional invalid commands suggested');
    const expectedText = `FT.EXPLAIN '${indexName1}' '@city:{tag} ' DIALECT dialectTest`.trim().replace(/\s+/g, ' ');
    // Verify command entered correctly
    await t.expect((await workbenchPage.queryInputForText.innerText).trim().replace(/\s+/g, ' ')).contains(expectedText, 'Incorrect order of entered arguments');
});
test('Verify commands suggestions for APPLY and FILTER', async t => {
    await t.typeText(workbenchPage.queryInput, 'FT.AGGREGATE ', { replace: true });
    await t.pressKey('enter');

    await t.typeText(workbenchPage.queryInput, '*');
    await t.pressKey('right');
    await t.pressKey('space');
    // Verify APPLY command
    await t.expect(workbenchPage.MonacoEditor.monacoSuggestion.withExactText('APPLY').exists).ok('Apply is not suggested');
    await t.pressKey('enter');

    await t.typeText(workbenchPage.queryInput, 'g');
    await t.expect(workbenchPage.MonacoEditor.monacoSuggestion.exists).ok('commands is not suggested');
    await t.pressKey('enter');
    await t.typeText(workbenchPage.queryInput, '@', { replace: false });
    await t.expect(workbenchPage.MonacoEditor.monacoSuggestion.visible).ok('Suggestions not displayed');
    await t.typeText(workbenchPage.queryInput, 'location', { replace: false });
    await t.typeText(workbenchPage.queryInput, ', "40.7128,-74.0060"');
    for (let i = 0; i < 3; i++) {
        await t.pressKey('right');
    }
    await t.pressKey('space');
    await t.typeText(workbenchPage.queryInput, 'a');
    await t.pressKey('tab');
    await t.typeText(workbenchPage.queryInput, 'apply_key', { replace: false });

    await t.pressKey('space');
    // Verify Filter command
    await t.typeText(workbenchPage.queryInput, 'F');
    await t.expect(workbenchPage.MonacoEditor.monacoSuggestion.withExactText('FILTER').exists).ok('FILTER is not suggested');
    await t.pressKey('enter');
    await t.typeText(workbenchPage.queryInput, 'apply_key < 5000', { replace: false });
    await t.pressKey('right');
    await t.pressKey('space');
    await t.expect(workbenchPage.MonacoEditor.monacoSuggestion.withExactText('GROUPBY').exists).ok('query can not be prolong');
});
test('Verify REDUCE commands', async t => {
    await t.typeText(workbenchPage.queryInput, `FT.AGGREGATE ${indexName1} "*" GROUPBY 1 @location`, { replace: true });
    await t.pressKey('space');
    // select Reduce
    await t.expect(workbenchPage.MonacoEditor.monacoSuggestion.withExactText('REDUCE').exists).ok('REDUCE is not suggested');
    await t.typeText(workbenchPage.queryInput, 'R');
    await t.pressKey('enter');

    // set value of reduce
    await t.expect(workbenchPage.MonacoEditor.monacoSuggestion.visible).ok('Suggestions not displayed');
    // Select COUNT
    await t.typeText(workbenchPage.queryInput, 'CO');
    await t.pressKey('enter');
    await t.typeText(workbenchPage.queryInput, '0');

    // verify that count of nargs is correct
    await t.pressKey('space');
    await t.expect(workbenchPage.MonacoEditor.monacoSuggestion.withExactText('AS').exists).ok('AS is not suggested');
    await t.pressKey('enter');
    await t.typeText(workbenchPage.queryInput, 'item_count ');

    // add additional reduce
    await t.expect(workbenchPage.MonacoEditor.monacoSuggestion.withExactText('REDUCE').exists).ok('Apply is not suggested');
    await t.typeText(workbenchPage.queryInput, 'R');
    await t.pressKey('enter');
    await t.typeText(workbenchPage.queryInput, 'SUM');
    await t.pressKey('enter');
    await t.typeText(workbenchPage.queryInput, '1 ');

    await t.typeText(workbenchPage.queryInput, '@', { replace: false });
    await t.expect(workbenchPage.MonacoEditor.monacoSuggestion.visible).ok('Suggestions not displayed');
    await t.typeText(workbenchPage.queryInput, 'students ', { replace: false });
    await t.expect(workbenchPage.MonacoEditor.monacoSuggestion.withExactText('AS').exists).ok('AS is not suggested');
    await t.pressKey('enter');
    await t.typeText(workbenchPage.queryInput, 'total_students');
});
// todo: rewrite. seems flaky. passes when run as a single test when failing when run with other tests
test.skip('Verify suggestions for fields', async t => {
    await t.typeText(workbenchPage.queryInput, 'FT.AGGREGATE ', { replace: true });
    await t.typeText(workbenchPage.queryInput, 'idx1');
    await t.pressKey('enter');
    await t.wait(200);

    await t.typeText(workbenchPage.queryInput, '@');
    await t.expect(workbenchPage.MonacoEditor.monacoSuggestion.visible).ok('Suggestions not displayed');

    // verify suggestions for geo
    await t.typeText(workbenchPage.queryInput, 'l');
    await t.pressKey('tab');
    await t.expect((await workbenchPage.MonacoEditor.getTextFromMonaco()).trim()).eql(`FT.AGGREGATE '${indexName1}' '@location:[lon lat radius unit] '`);

    // verify for numeric
    await t.typeText(workbenchPage.queryInput, 'FT.AGGREGATE ', { replace: true });
    await t.typeText(workbenchPage.queryInput, 'idx1');
    await t.pressKey('enter');
    await t.wait(200);

    await t.typeText(workbenchPage.queryInput, '@');
    await t.typeText(workbenchPage.queryInput, 's');
    await t.pressKey('tab');
    await t.expect((await workbenchPage.MonacoEditor.getTextFromMonaco()).trim()).eql(`FT.AGGREGATE '${indexName1}' '@students:[range] '`);
});
// Unskip after fixing https://redislabs.atlassian.net/browse/RI-6212
test.skip
    .after(async() => {
    // Clear and delete database
        await apiKeyRequests.deleteKeyByNameApi(keyName, ossStandaloneConfig.databaseName);
        await browserPage.Cli.sendCommandsInCli([`DEL ${keyNames.join(' ')}`, `FT.DROPINDEX ${indexName1}`]);
        await browserPage.Cli.sendCommandsInCli([`DEL ${keyNames.join(' ')}`, `FT.DROPINDEX ${indexName2}`]);
        await browserPage.Cli.sendCommandsInCli([`DEL ${keyNames.join(' ')}`, `FT.DROPINDEX ${indexName3}`]);
        await databaseAPIRequests.deleteStandaloneDatabaseApi(ossStandaloneConfig);
    })('Verify commands suggestions for CREATE', async t => {
        await t.typeText(workbenchPage.queryInput, 'FT.CREATE ', { replace: true });
        // Verify that indexes are not suggested for FT.CREATE
        await t.expect(workbenchPage.MonacoEditor.monacoSuggestion.exists).notOk('Existing index suggested');

        // Enter index name
        await t.typeText(workbenchPage.queryInput, indexName3);
        await t.pressKey('space');

        // Select FILTER keyword
        await t.typeText(workbenchPage.queryInput, 'FI');
        await t.pressKey('tab');
        await t.typeText(workbenchPage.queryInput, 'filterNew', { replace: false });
        await t.pressKey('space');

        // Select SCHEMA keyword
        await t.typeText(workbenchPage.queryInput, 'SCH');
        await t.pressKey('tab');
        await t.typeText(workbenchPage.queryInput, 'field_name', { replace: false });
        await t.pressKey('space');

        // Select TEXT keyword
        await t.typeText(workbenchPage.queryInput, 'te', { replace: false });
        await t.pressKey('tab');

        // Select SORTABLE
        await t.typeText(workbenchPage.queryInput, 'so', { replace: false });
        await t.pressKey('tab');

        // Enter second field to SCHEMA
        await t.typeText(workbenchPage.queryInput, 'field2_num', { replace: false });
        await t.pressKey('space');
        await t.expect(workbenchPage.MonacoEditor.monacoSuggestion.withExactText('NUMERIC').exists).ok('query can not be prolong');

        // Select NUMERIC keyword
        await t.typeText(workbenchPage.queryInput, 'so', { replace: false });
        await t.pressKey('tab');

        await t.expect((await workbenchPage.MonacoEditor.getTextFromMonaco()).trim()).eql(`FT.CREATE ${indexName3} FILTER filterNew SCHEMA field_name TEXT SORTABLE field2_num NUMERIC`);
    });
