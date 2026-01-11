/**
 * Script to generate release notes from Jira tickets and GitHub PRs
 *
 * Usage: node scripts/generate-release-notes.js <version> [options]
 * Example: node scripts/generate-release-notes.js 3.0.0 --jira-project RI --github-token <token>
 *
 * Options:
 *   --jira-project <project>    Jira project key (default: RI)
 *   --jira-version <version>     Jira release version name (default: same as version)
 *   --github-token <token>       GitHub token for API access
 *   --github-owner <owner>      GitHub repository owner (default: redis)
 *   --github-repo <repo>         GitHub repository name (default: RedisInsight)
 *   --base-branch <branch>       Base branch for PR comparison (default: main)
 *   --output <file>              Output file path (default: RELEASE_NOTES.md)
 *   --template <file>            Template file path (default: RELEASE_NOTES_TEMPLATE.md)
 */

const fs = require('fs');
const path = require('path');
const https = require('https');

// Parse command line arguments
const args = process.argv.slice(2);
const version = args[0];

if (!version) {
  console.error('Please provide a version number as the first argument.');
  console.error('Usage: node scripts/generate-release-notes.js <version> [options]');
  process.exit(1);
}

const semverRegex = /^\d+\.\d+\.\d+$/;
if (!semverRegex.test(version)) {
  console.error('Invalid version format. Please use semantic versioning (e.g., 3.0.0).');
  process.exit(1);
}

// Parse options
const options = {
  jiraProject: 'RI',
  jiraVersion: version,
  githubToken: process.env.GITHUB_TOKEN,
  githubOwner: 'redis',
  githubRepo: 'RedisInsight',
  baseBranch: 'main',
  output: 'RELEASE_NOTES.md',
  template: path.join(__dirname, '../RELEASE_NOTES_TEMPLATE.md'),
};

for (let i = 1; i < args.length; i += 2) {
  const key = args[i];
  const value = args[i + 1];
  
  if (key === '--jira-project') options.jiraProject = value;
  else if (key === '--jira-version') options.jiraVersion = value;
  else if (key === '--github-token') options.githubToken = value;
  else if (key === '--github-owner') options.githubOwner = value;
  else if (key === '--github-repo') options.githubRepo = value;
  else if (key === '--base-branch') options.baseBranch = value;
  else if (key === '--output') options.output = value;
  else if (key === '--template') options.template = value;
}

// Helper function to make HTTP requests
function httpRequest(url, options = {}) {
  return new Promise((resolve, reject) => {
    const urlObj = new URL(url);
    const requestOptions = {
      hostname: urlObj.hostname,
      path: urlObj.pathname + urlObj.search,
      method: options.method || 'GET',
      headers: {
        'User-Agent': 'RedisInsight-Release-Notes-Generator',
        ...options.headers,
      },
    };

    if (options.token) {
      requestOptions.headers['Authorization'] = `Bearer ${options.token}`;
    }

    const req = https.request(requestOptions, (res) => {
      let data = '';
      res.on('data', (chunk) => {
        data += chunk;
      });
      res.on('end', () => {
        if (res.statusCode >= 200 && res.statusCode < 300) {
          try {
            resolve(JSON.parse(data));
          } catch (e) {
            resolve(data);
          }
        } else {
          reject(new Error(`HTTP ${res.statusCode}: ${data}`));
        }
      });
    });

    req.on('error', reject);
    req.end();
  });
}

// Fetch Jira tickets for a release version
async function fetchJiraTickets(project, version) {
  console.log(`Fetching Jira tickets for project ${project}, version ${version}...`);
  
  // Note: This requires Jira API credentials
  // For now, return empty array - this should be implemented with actual Jira API
  // const jiraUrl = `https://redislabs.atlassian.net/rest/api/3/search?jql=project=${project}%20AND%20fixVersion=${version}`;
  
  console.warn('Jira API integration not yet implemented. Please fetch tickets manually.');
  return [];
}

// Fetch GitHub PRs merged since last release
async function fetchGitHubPRs(owner, repo, baseBranch, token) {
  if (!token) {
    console.warn('GitHub token not provided. Skipping GitHub PR fetch.');
    return [];
  }

  console.log(`Fetching GitHub PRs for ${owner}/${repo}...`);
  
  try {
    // Get the latest release tag
    const releases = await httpRequest(
      `https://api.github.com/repos/${owner}/${repo}/releases`,
      { token }
    );
    
    const latestRelease = releases[0];
    const since = latestRelease ? latestRelease.published_at : null;
    
    // Get PRs merged to base branch
    const prs = await httpRequest(
      `https://api.github.com/repos/${owner}/${repo}/pulls?state=closed&base=${baseBranch}&sort=updated&direction=desc&per_page=100`,
      { token }
    );
    
    // Filter PRs merged since last release
    const mergedPRs = prs.filter((pr) => {
      if (!pr.merged_at) return false;
      if (since && new Date(pr.merged_at) < new Date(since)) return false;
      return true;
    });
    
    return mergedPRs.map((pr) => ({
      number: pr.number,
      title: pr.title,
      url: pr.html_url,
      mergedAt: pr.merged_at,
      labels: pr.labels.map((l) => l.name),
    }));
  } catch (error) {
    console.error('Error fetching GitHub PRs:', error.message);
    return [];
  }
}

// Extract Jira ticket IDs from PR titles
function extractJiraTickets(prs) {
  const ticketRegex = /(RI-\d+)/gi;
  const tickets = new Set();
  
  prs.forEach((pr) => {
    const matches = pr.title.match(ticketRegex);
    if (matches) {
      matches.forEach((ticket) => tickets.add(ticket));
    }
  });
  
  return Array.from(tickets);
}

// Categorize PRs
function categorizePRs(prs) {
  const categories = {
    features: [],
    bugs: [],
    improvements: [],
    other: [],
  };
  
  prs.forEach((pr) => {
    const title = pr.title.toLowerCase();
    const labels = pr.labels.map((l) => l.toLowerCase());
    
    if (labels.includes('bug') || title.includes('fix') || title.includes('bug')) {
      categories.bugs.push(pr);
    } else if (labels.includes('feature') || title.includes('feat') || title.includes('add')) {
      categories.features.push(pr);
    } else if (labels.includes('enhancement') || title.includes('improve') || title.includes('update')) {
      categories.improvements.push(pr);
    } else {
      categories.other.push(pr);
    }
  });
  
  return categories;
}

// Generate release notes
async function generateReleaseNotes() {
  console.log(`Generating release notes for version ${version}...`);
  
  // Load template
  let template = '';
  if (fs.existsSync(options.template)) {
    template = fs.readFileSync(options.template, 'utf8');
  } else {
    template = `# ${version} ([Month Year])

This release includes improvements and bug fixes.

### Headlines

* TBD

### Details

* TBD

### Bugs

* TBD
`;
  }
  
  // Fetch data
  const [jiraTickets, githubPRs] = await Promise.all([
    fetchJiraTickets(options.jiraProject, options.jiraVersion),
    fetchGitHubPRs(options.githubOwner, options.githubRepo, options.baseBranch, options.githubToken),
  ]);
  
  // Extract Jira ticket IDs from PRs
  const ticketIds = extractJiraTickets(githubPRs);
  console.log(`Found ${ticketIds.length} Jira ticket references: ${ticketIds.join(', ')}`);
  
  // Categorize PRs
  const categorized = categorizePRs(githubPRs);
  
  // Generate content
  let content = template.replace(/\d+\.\d+\.\d+/, version);
  
  // Add PRs to content
  if (githubPRs.length > 0) {
    let details = '\n### Details\n\n';
    let bugs = '\n### Bugs\n\n';
    
    categorized.features.forEach((pr) => {
      details += `* ${pr.title} (${pr.url})\n`;
    });
    
    categorized.improvements.forEach((pr) => {
      details += `* ${pr.title} (${pr.url})\n`;
    });
    
    categorized.bugs.forEach((pr) => {
      bugs += `* ${pr.title} (${pr.url})\n`;
    });
    
    if (categorized.features.length > 0 || categorized.improvements.length > 0) {
      content = content.replace(/### Details[\s\S]*?(?=###|$)/, details);
    }
    
    if (categorized.bugs.length > 0) {
      content = content.replace(/### Bugs[\s\S]*?(?=###|$)/, bugs);
    }
  }
  
  // Write output
  fs.writeFileSync(options.output, content);
  console.log(`Release notes written to ${options.output}`);
  console.log(`\nSummary:`);
  console.log(`  - GitHub PRs: ${githubPRs.length}`);
  console.log(`  - Features: ${categorized.features.length}`);
  console.log(`  - Improvements: ${categorized.improvements.length}`);
  console.log(`  - Bugs: ${categorized.bugs.length}`);
  console.log(`  - Jira tickets: ${ticketIds.length}`);
}

// Run
generateReleaseNotes().catch((error) => {
  console.error('Error generating release notes:', error);
  process.exit(1);
});
