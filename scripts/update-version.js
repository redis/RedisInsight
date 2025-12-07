/**
 * Script to update the version number in all necessary files
 *
 * Usage: node scripts/update-version.js <new-version>
 * Example: node scripts/update-version.js 2.65.0
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

if (process.argv.length < 3) {
  console.error('Please provide a version number as an argument.');
  console.error('Usage: node update-version.js <new-version>');
  process.exit(1);
}

const newVersion = process.argv[2];
const semverRegex = /^\d+\.\d+\.\d+$/;

if (!semverRegex.test(newVersion)) {
  console.error(
    'Invalid version format. Please use semantic versioning (e.g., 2.65.0).',
  );
  process.exit(1);
}

const filesToUpdate = [
  {
    path: path.join(__dirname, '../garnetinsight/package.json'),
    regex: /"version":\s*"([^"]+)"/,
    replacement: (match, p1) => match.replace(p1, newVersion),
  },
  {
    path: path.join(__dirname, '../garnetinsight/api/package.json'),
    regex: /"version":\s*"([^"]+)"/,
    replacement: (match, p1) => match.replace(p1, newVersion),
  },
  {
    path: path.join(__dirname, '../garnetinsight/api/config/default.ts'),
    regex: /appVersion:\s*process\.env\.RI_APP_VERSION\s*\|\|\s*'([^']+)'/,
    replacement: (match, p1) => match.replace(p1, newVersion),
  },
  {
    path: path.join(__dirname, '../garnetinsight/api/config/swagger.ts'),
    regex: /version:\s*'([^']+)'/,
    replacement: (match, p1) => match.replace(p1, newVersion),
  },
  {
    path: path.join(
      __dirname,
      '../garnetinsight/desktop/src/lib/aboutPanel/aboutPanel.ts',
    ),
    regex: /app\.getVersion\(\)\s*\|\|\s*'([^']+)'/,
    replacement: (match, p1) => match.replace(p1, newVersion),
  },
  {
    path: path.join(__dirname, '../.github/build/release-docker.sh'),
    regex: /-v\s*-\s*Semver\s*\(([^)]+)\)/,
    replacement: (match, p1) => match.replace(p1, newVersion),
  },
];

let updatedFiles = 0;
let skippedFiles = 0;
let errorFiles = 0;

filesToUpdate.forEach((file) => {
  try {
    if (!fs.existsSync(file.path)) {
      console.warn(`File not found: ${file.path}`);
      skippedFiles++;
      return;
    }

    let content = fs.readFileSync(file.path, 'utf8');
    const originalContent = content;

    content = content.replace(file.regex, file.replacement);

    if (content === originalContent) {
      console.warn(`No version pattern found in: ${file.path}`);
      skippedFiles++;
      return;
    }

    fs.writeFileSync(file.path, content);
    console.log(`Updated version in: ${file.path}`);
    updatedFiles++;
  } catch (error) {
    console.error(`Error updating file ${file.path}:`, error.message);
    errorFiles++;
  }
});

console.log('\n----------------------------------------');
console.log(`Version update summary for ${newVersion}:`);
console.log(`  Files updated: ${updatedFiles}`);
console.log(`  Files skipped: ${skippedFiles}`);
console.log(`  Files with errors: ${errorFiles}`);
console.log('----------------------------------------\n');

if (updatedFiles === filesToUpdate.length) {
  console.log('Version updated successfully!');
} else if (updatedFiles > 0) {
  console.log('Version updated successfully in SOME files!');
} else {
  console.log('No files were updated.');
  process.exit(1);
}
