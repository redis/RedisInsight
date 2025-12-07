import * as path from 'path';
import {
  getFile,
  updateFolderFromArchive,
  updateFile,
} from '../src/utils/file-helper';
import { get } from '../src/utils/config';

const PATH_CONFIG = get('dir_path');
const CONTENT_CONFIG = get('content');

const archiveUrl = new URL(
  path.join(CONTENT_CONFIG.updateUrl, CONTENT_CONFIG.zip),
).toString();

const buildInfoUrl = new URL(
  path.join(CONTENT_CONFIG.updateUrl, CONTENT_CONFIG.buildInfo),
).toString();

async function init() {
  try {
    // get archive
    const data = await getFile(archiveUrl);

    // extract archive to default folder
    await updateFolderFromArchive(PATH_CONFIG.defaultContent, data);

    // get build info
    const buildInfo = await getFile(buildInfoUrl);

    // save build info to default folder
    await updateFile(
      PATH_CONFIG.defaultContent,
      CONTENT_CONFIG.buildInfo,
      buildInfo,
    );

    process.exit(0);
  } catch (e) {
    console.error(
      'Something went wrong trying to get default commands jsons',
      e,
    );
    process.exit(1);
  }
}

init();
