const fs = require('fs');
const path = require('path');

const { appendFile } = fs.promises;

const {
  AWS_DEFAULT_REGION,
  AWS_BUCKET_NAME_TEST,
  SUB_PATH,
  GITHUB_STEP_SUMMARY,
} = process.env;

const Categories = {
  Linux: 'Linux Builds',
  MacOS: 'MacOS Builds',
  Windows: 'Windows Builds',
  Docker: 'Docker Builds',
};

const directoryPath = path.join(process.cwd(), 'release');
const dockerDirectoryPath = path.join(directoryPath, 'docker');

async function generateBuildSummary() {
  try {
    // Read the contents of the release directory and Docker subdirectory
    const files = fs.readdirSync(directoryPath);
    const dockerFiles = fs.existsSync(dockerDirectoryPath)
      ? fs.readdirSync(dockerDirectoryPath).map((file) => `docker/${file}`)
      : [];

    // Combine all files into a single array
    const allFiles = [...files, ...dockerFiles];

    // Mapping file names to Markdown links and categories
    const fileMappings = {
      'Redis-Insight-mac-arm64.dmg': {
        name: 'Garnet Insight for Mac (arm64 DMG)',
        category: Categories.MacOS,
      },
      'Redis-Insight-mac-x64.dmg': {
        name: 'Garnet Insight for Mac (x64 DMG)',
        category: Categories.MacOS,
      },
      'Redis-Insight-win-installer.exe': {
        name: 'Garnet Insight Windows Installer (exe)',
        category: Categories.Windows,
      },
      'Redis-Insight-linux-x86_64.AppImage': {
        name: 'Garnet Insight for Linux (AppImage)',
        category: Categories.Linux,
      },
      'Redis-Insight-linux-amd64.deb': {
        name: 'Garnet Insight for Linux (deb)',
        category: Categories.Linux,
      },
      'Redis-Insight-linux-amd64.snap': {
        name: 'Garnet Insight for Linux (snap)',
        category: Categories.Linux,
      },
      'Redis-Insight-linux-x86_64.rpm': {
        name: 'Garnet Insight for Linux (rpm)',
        category: Categories.Linux,
      },
      'docker/docker-linux-alpine.amd64.tar': {
        name: 'Garnet Insight Docker Image (amd64)',
        category: Categories.Docker,
      },
      'docker/docker-linux-alpine.arm64.tar': {
        name: 'Garnet Insight Docker Image (arm64)',
        category: Categories.Docker,
      },
    };

    const categories = {};

    // Populate categories with existing files
    allFiles.forEach((file) => {
      const mapping = fileMappings[file];
      if (mapping) {
        if (!categories[mapping.category]) {
          categories[mapping.category] = [];
        }
        const s3path = `https://s3.${AWS_DEFAULT_REGION}.amazonaws.com/${AWS_BUCKET_NAME_TEST}`;
        const href = `${s3path}/public/${SUB_PATH}/${file}`;

        categories[mapping.category].push(`- [${mapping.name}](${href})`);
      }
    });

    // Prepare the summary markdown document
    const markdownLines = ['## Builds:', ''];

    // Append categories to markdown if they have entries
    Object.keys(categories).forEach((category) => {
      if (categories[category].length) {
        markdownLines.push(`### ${category}`, '', ...categories[category], '');
      }
    });

    const data = markdownLines.join('\n');
    const summaryFilePath = GITHUB_STEP_SUMMARY;

    await appendFile(summaryFilePath, data, { encoding: 'utf8' });

    console.log('Build summary generated successfully.');
  } catch (error) {
    console.error(error);
  }
}

generateBuildSummary();
