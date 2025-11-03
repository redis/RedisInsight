import * as fs from 'fs';
import { Chance } from 'chance';
import editJsonFile from 'edit-json-file';
import { DatabaseHelper } from '../../../../helpers/database';
import { MyRedisDatabasePage } from '../../../../pageObjects';
import {commonUrl, ossStandaloneConfig, workingDirectory} from '../../../../helpers/conf';
import { DatabaseAPIRequests } from '../../../../helpers/api/api-database';

const myRedisDatabasePage = new MyRedisDatabasePage();
const databaseHelper = new DatabaseHelper();
const chance = new Chance();
const databaseAPIRequests = new DatabaseAPIRequests();

if (fs.existsSync(workingDirectory)) {
    const timestampPromoButtonPath = `${workingDirectory}/content/build.json`;
    const contentPromoButtonPath = `${workingDirectory}/content/create-redis.json`;
    const timestampPromoButtonFile = editJsonFile(timestampPromoButtonPath);
    const contentPromoButtonFile = editJsonFile(contentPromoButtonPath);
    const timestampBeforeUpdate = timestampPromoButtonFile.get('timestamp');
    const newTimestamp = timestampBeforeUpdate - 1;
    const newPromoButtonText = chance.word({ length: 10 });

    //Edit json file values
    contentPromoButtonFile.set('cloud.title', newPromoButtonText);
    contentPromoButtonFile.set('cloud.description', newPromoButtonText);
    contentPromoButtonFile.save();
    timestampPromoButtonFile.set('timestamp', newTimestamp);
    timestampPromoButtonFile.save();

    fixture `Auto-update in Promo Button`
        .meta({ type: 'critical_path', skipComment: "Skipped because it is not run in the CI" })
        .page(commonUrl)
        .beforeEach(async() => {
            await databaseHelper.acceptLicenseTerms();
        });
    test.skip('Verify that user has the ability to update "Create free database" button without changing the app', async t => {
        // Create new file paths due to cache-ability
        const timestampPathNew = editJsonFile(timestampPromoButtonPath);
        const contentPathNew = editJsonFile(contentPromoButtonPath);
        // Check the promo button after the opening of app
        await t.expect(myRedisDatabasePage.promoButton.textContent).notContains(newPromoButtonText, 'Promo button text is not updated'); // TODO: - check what is with this promo button
        // Get the values from build.json and create-redis.json files
        const actualTimestamp = await timestampPathNew.get('timestamp');
        const actualPromoButtonTitle = await contentPathNew.get('cloud.title');
        const actualPromoButtonDescription = await contentPathNew.get('cloud.description');
        // Check the json files are automatically updated
        await t.expect(actualPromoButtonTitle).notEql(newPromoButtonText, 'The cloud title in the create-redis.json file is automatically updated');
        await t.expect(actualPromoButtonDescription).notEql(newPromoButtonText, 'The cloud description in the create-redis.json file is automatically updated');
        await t.expect(actualTimestamp).notEql(newTimestamp, 'The timestamp in the build.json file is automatically updated');
    });
}
