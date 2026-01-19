#!/usr/bin/env node
/**
 * Fetch JIRA tickets using JQL query and return detailed ticket information.
 * This script uses JIRA REST API to fetch tickets with all necessary details.
 */

const fs = require('fs');
const https = require('https');
const { URL } = require('url');

function parseJiraFilterUrl(urlString) {
  /** Extract JQL query from JIRA filter URL. */
  const url = new URL(urlString);
  const jql = url.searchParams.get('jql');
  if (!jql) {
    throw new Error('No JQL parameter found in URL');
  }
  return decodeURIComponent(jql);
}

function getJiraCredentials() {
  /** Get JIRA credentials from .env.mcp file. */
  const envFile = '.env.mcp';
  if (!fs.existsSync(envFile)) {
    throw new Error(`Credentials file ${envFile} not found. Please set up JIRA credentials.`);
  }

  const credentials = {};
  const content = fs.readFileSync(envFile, 'utf-8');
  const lines = content.split('\n');

  for (const line of lines) {
    const trimmed = line.trim();
    if (trimmed && trimmed.includes('=') && !trimmed.startsWith('#')) {
      const [key, ...valueParts] = trimmed.split('=');
      const value = valueParts.join('=').trim();
      credentials[key.trim()] = value;
    }
  }

  const required = ['JIRA_URL', 'JIRA_USERNAME', 'JIRA_API_TOKEN'];
  const missing = required.filter(key => !credentials[key]);
  if (missing.length > 0) {
    throw new Error(`Missing required credentials: ${missing.join(', ')}`);
  }

  return credentials;
}

function extractTextFromAdf(adfContent) {
  /** Extract plain text from Atlassian Document Format (ADF). */
  if (typeof adfContent === 'string') {
    return adfContent;
  }
  if (typeof adfContent !== 'object' || adfContent === null) {
    return String(adfContent);
  }

  const textParts = [];

  function traverse(node) {
    if (Array.isArray(node)) {
      for (const item of node) {
        traverse(item);
      }
    } else if (typeof node === 'object' && node !== null) {
      if (node.type === 'text' && node.text) {
        textParts.push(node.text);
      }
      if (node.content) {
        traverse(node.content);
      }
    }
  }

  traverse(adfContent);
  return textParts.join(' ').trim();
}

function fetchJiraTickets(jqlQuery, credentials) {
  /** Fetch tickets from JIRA using JQL query. */
  return new Promise((resolve, reject) => {
    const baseUrl = credentials.JIRA_URL.replace(/\/$/, '');
    const username = credentials.JIRA_USERNAME;
    const apiToken = credentials.JIRA_API_TOKEN;

    // Create authentication header
    const authString = `${username}:${apiToken}`;
    const authBase64 = Buffer.from(authString).toString('base64');

    // Fields to fetch (comprehensive list similar to CSV export)
    const fields = [
      'summary',
      'issuetype',
      'status',
      'priority',
      'labels',
      'description',
      'created',
      'updated',
      'resolved',
      'assignee',
      'reporter',
      'creator',
      'fixVersions',
      'components',
      'customfield_10020', // Sprint field
    ];

    const allTickets = [];
    let startAt = 0;

    function fetchPage() {
      const params = new URLSearchParams({
        jql: jqlQuery,
        fields: fields.join(','),
        maxResults: '1000',
        expand: 'changelog',
        startAt: String(startAt),
      });

      const searchUrl = `${baseUrl}/rest/api/3/search/jql?${params.toString()}`;
      const url = new URL(searchUrl);

      const options = {
        hostname: url.hostname,
        port: url.port || 443,
        path: url.pathname + url.search,
        method: 'GET',
        headers: {
          Authorization: `Basic ${authBase64}`,
          Accept: 'application/json',
          'Content-Type': 'application/json',
        },
        rejectUnauthorized: false, // For development - allows self-signed certificates
      };

      const req = https.request(options, (res) => {
        let data = '';

        res.on('data', (chunk) => {
          data += chunk;
        });

        res.on('end', () => {
          try {
            if (res.statusCode !== 200) {
              reject(new Error(`JIRA API error: ${res.statusCode} - ${data}`));
              return;
            }

            const responseData = JSON.parse(data);
            const issues = responseData.issues || [];

            if (issues.length === 0) {
              resolve(allTickets);
              return;
            }

            for (const issue of issues) {
              const ticket = {
                'Issue key': issue.key,
                Summary: issue.fields?.summary || '',
                'Issue Type': issue.fields?.issuetype?.name || '',
                Status: issue.fields?.status?.name || '',
                Priority: issue.fields?.priority?.name || '',
                Labels: issue.fields?.labels || [],
                Description: extractTextFromAdf(issue.fields?.description || ''),
                Created: issue.fields?.created || '',
                Updated: issue.fields?.updated || '',
                Resolved: issue.fields?.resolved || '',
                Assignee: issue.fields?.assignee?.displayName || '',
                Reporter: issue.fields?.reporter?.displayName || '',
              };
              allTickets.push(ticket);
            }

            startAt += issues.length;
            if (startAt >= (responseData.total || 0)) {
              resolve(allTickets);
            } else {
              // Fetch next page
              fetchPage();
            }
          } catch (error) {
            reject(new Error(`Failed to parse JSON response: ${error.message}`));
          }
        });
      });

      req.on('error', (error) => {
        reject(new Error(`Error fetching from JIRA: ${error.message}`));
      });

      req.setTimeout(30000, () => {
        req.destroy();
        reject(new Error('Request timeout'));
      });

      req.end();
    }

    fetchPage();
  });
}

async function main() {
  if (process.argv.length < 3) {
    console.error('Usage: node fetch-jira-tickets.js <jira-filter-url>');
    process.exit(1);
  }

  const url = process.argv[2];

  try {
    // Parse JQL from URL
    const jql = parseJiraFilterUrl(url);
    console.error(`Extracted JQL: ${jql}\n`);

    // Get credentials
    const credentials = getJiraCredentials();

    // Fetch tickets
    const tickets = await fetchJiraTickets(jql, credentials);

    // Output as JSON
    console.log(JSON.stringify(tickets, null, 2));
  } catch (error) {
    console.error(`Error: ${error.message}`);
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}

module.exports = { parseJiraFilterUrl, getJiraCredentials, fetchJiraTickets, extractTextFromAdf };
