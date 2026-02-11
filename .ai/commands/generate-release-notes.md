***

description: Generate release notes from JIRA tickets for a specific version
argument-hint: <version> \[jira-filter-link-or-jql-or-csv-file]
---------------------------------------------------------------

Generate release notes for RedisInsight releases based on JIRA tickets.

## Examples

```bash
# Generate from JIRA filter link (PREFERRED)
generate-release-notes 3.0.3 "https://<jira-domain>/jira/software/c/projects/<project_name>/issues?jql=project%20%3D%20<project_name>..."

# Generate from JIRA query (JQL)
generate-release-notes 3.0.2 "project = <project_key> AND parent = <ticket-key>"

# Generate from CSV export
generate-release-notes 3.0.2 /path/to/jira-export.csv

# Generate from ticket keys
generate-release-notes 3.0.2 <ticket-key-1>,<ticket-key-2>,<ticket-key-3>
```

**Always reference the GitHub releases page as the source of truth for format and style:**
https://github.com/redis/RedisInsight/releases

Use existing releases (especially recent ones like 3.0.2, 3.0.0) as examples for:

* Format and structure
* Tone and language
* Section organization
* Ticket reference format

## 1. Get Version and Ticket Data

**If version is not provided as an argument, prompt the user for it.**

The version should be in semantic versioning format (e.g., `3.0.2`).

**Ticket data can be provided in one of these ways:**

1. **JIRA Filter Link** (PREFERRED): If a JIRA filter link is provided:
   * **Detection**: Check if the input starts with `http://` or `https://` and contains `atlassian.net` and `jql=`
   * **Example**: `https://<jira-domain>/jira/software/c/projects/<project_name>/issues?jql=project%20%3D%20<project_name>...`
   * Extract the JQL query from the URL (decode URL-encoded parameters)
   * **Use the JavaScript script `scripts/fetch-jira-tickets.js` to fetch all tickets matching the filter** (or JIRA MCP tools if available)
   * For each ticket, fetch complete details including:
     * Issue key, summary, type, status, priority
     * Labels (check for "Github-Issue" label)
     * Description
     * All custom fields and metadata needed for categorization
   * Process the tickets the same way as CSV data

2. **JIRA Query (JQL)**: If a raw JQL query is provided (e.g., `project = <project_key> AND parent = <ticket-key>`), use the JIRA MCP tools to fetch tickets with full details

3. **CSV File**: If a CSV file path is provided, parse it to extract ticket information
   * To export from JIRA: Go to JIRA → Search for issues → Run your JQL query → Export → CSV
   * The CSV will contain all ticket information needed for generation

4. **Ticket Keys**: If specific ticket keys are provided (e.g., `<ticket-key-1>,<ticket-key-2>`), fetch each ticket individually with full details

## 2. Fetch and Categorize Tickets

For each ticket, analyze its essence to categorize it:

### Exclusion Rules

**Exclude entirely (do not include in any section):**

* **Spike tickets**: If issue type is "Spike", exclude from release notes
* **POC tickets**: If "POC" appears in the title or description (indicating proof-of-concept that is not implemented), exclude from release notes
* These tickets are not ready for release and should not be mentioned

### Categorization Logic

**Bug indicators:**

* Issue type contains "bug" or "defect"
* Summary contains: "fix", "bug", "error", "issue", "broken", "crash", "fail"
* Labels contain "bug" or "defect"

**IMPORTANT: Bugs/Bug fixes section filter:**

* **Only tickets with the "Github-Issue" label should be included in the Bugs/Bug fixes section**
* When processing tickets from JIRA query or CSV, filter bugs to only include those with the "Github-Issue" label
* **Include all bugs that have the "Github-Issue" label**—every such ticket must appear in the Bugs section with no limit or additional filtering
* Other bug tickets (without this label) should be excluded from the Bugs/Bug fixes section
* **Bugs with Github-Issue label should ONLY appear in the Bugs section, NOT in Headlines or Details sections**
* **Always list each of these bugs with the GitHub issue link**: For every ticket in the Bugs section (tickets with "Github-Issue" label), output the line in the form `[#ISSUE-NUMBER](https://github.com/redis/RedisInsight/issues/ISSUE-NUMBER) [Short description]`. Resolve the GitHub issue number from: (1) JIRA labels such as `Github-4658` (use the number part), (2) JIRA description or linked PR body (e.g. "References #5381", "Closes #5382"), or (3) search on GitHub (repo: redis/RedisInsight) for the issue or PR that matches the bug (e.g. by JIRA key like RI-7894 or by summary). If the number cannot be determined, still include the short description but add a note to look up the link.

**Feature indicators:**

* Issue type contains: "story", "feature", "epic", "enhancement"
* Summary contains: "add", "implement", "new", "introduce", "support", "enable"
* Labels contain "feature" or "enhancement"

**Improvement indicators:**

* Issue type contains: "task", "improvement"
* Summary contains: "improve", "enhance", "update", "optimize", "refactor"
* Labels contain "improvement"

## 3. Generate Release Notes

Use the template from `docs/release-notes/RELEASE_NOTES_TEMPLATE.md` as a reference.

### Format Selection

* **If only bugs (with "Github-Issue" label)**: Use simple "Bug fixes" section only; include every ticket that has the "Github-Issue" label
* **If features/improvements exist**: Use full format with "Headlines", "Details", and "Bugs" sections
  * Note: The "Bugs" section must include all tickets with the "Github-Issue" label (include every one)

### Section Organization Rules

**IMPORTANT: Avoid duplication between sections:**

* **Tickets with "Github-Issue" label**: These should **ONLY** appear in the "Bugs" section, never in "Headlines" or "Details" sections
* **No duplication**: Items in the Bugs section must not appear in Headlines or Details sections
* **Headlines and Details relationship**:
  * Headlines should contain short summaries of the most important user-facing features and improvements
  * Details can expand on Headlines items with more information, or include additional features/improvements not mentioned in Headlines
  * The same item can appear in both Headlines (short summary) and Details (full description), but items from Bugs section must not appear in either

### Release Notes Structure

**Reference format from GitHub releases:** https://github.com/redis/RedisInsight/releases

```markdown
# [VERSION] ([MONTH] [YEAR])

[Release description based on content]

### Headlines (if features exist - see 3.0.0 example)
* [Top 3-5 most important items - user-facing features or critical improvements]

### Details (if features/improvements exist - see 3.0.0 example)
* [Short description of what was added/improved] (for JIRA tickets, don't include ticket ID)
* [#ISSUE-NUMBER](https://github.com/redis/RedisInsight/issues/ISSUE-NUMBER) [Summary] (for GitHub issues, use link format)

### Bugs (if features exist) OR Bug fixes (if only bugs - see 3.0.2 example)
* **IMPORTANT: Include all tickets with the "Github-Issue" label in this section (every one, no limit). Always list each bug with its GitHub issue link.**
* Each line must be: `[#ISSUE-NUMBER](https://github.com/redis/RedisInsight/issues/ISSUE-NUMBER) [Short description of problem and fix]`
* Resolve ISSUE-NUMBER from JIRA labels (e.g. Github-4658 → 4658), ticket/PR references, or GitHub search if needed.

**SHA-512 Checksums**

https://redis.io/docs/latest/develop/tools/insight/release-notes/v.[VERSION]/

**Full Changelog**: https://github.com/redis/RedisInsight/compare/[LAST_RELEASED]...[VERSION]
```

**Important formatting notes from GitHub releases:**

* **For the Bugs section (tickets with "Github-Issue" label)**: Always list each bug with its GitHub issue link: `[#<issue-number>](https://github.com/redis/RedisInsight/issues/<issue-number>) [Short description]`. Resolve the issue number from JIRA labels (e.g. `Github-4658`), from "References #NNNN" / "Closes #NNNN" in linked PRs or descriptions, or by searching GitHub (repo: redis/RedisInsight) for the matching issue.
* **For other JIRA tickets** (Headlines/Details): Do NOT include ticket IDs. Provide a very short description of what was added or fixed.
* **For GitHub issues** (when referenced elsewhere): Use actual links in format `[#<issue-number>](https://github.com/redis/RedisInsight/issues/<issue-number>)` (not just `#<issue-number>` or `#<ticket-key>`).
* Use "SHA-512 Checksums" for all releases
* Keep descriptions concise and user-focused
* Headlines should highlight the most impactful user-facing changes

### Release Description

**Examples from GitHub releases:**

* **Major releases** (x.0.0): "This is the General Availability (GA) release of Redis Insight \[version], a major version upgrade that introduces \[key themes]."
  * See 3.0.0 example: mentions "new UI experience, new navigation architecture, and foundational improvements"
* **Patch releases with only bugs**:
  * Check ticket priorities to determine description:
    * If only high/critical priority bugs: "This maintenance patch release includes critical bug fixes for Redis Insight \[major.minor].0."
    * If only medium/low priority bugs: "This maintenance patch release includes non-critical bug fixes for Redis Insight \[major.minor].0."
    * If both critical and non-critical: "This maintenance patch release includes critical and non-critical bug fixes for Redis Insight \[major.minor].0."
  * See 3.0.2 example
* **Patch releases with features**: "This release includes new features, improvements, and bug fixes for Redis Insight."
  * See 2.64, 2.62, 2.60 examples for format with "Highlights" and "Details" sections

## 4. Generate All Release Note Formats

After generating the main release notes, create **two different formats** for different platforms:

### 4.1 GitHub/Redis Docs Format

Save the generated release notes to `RELEASE_NOTES_[VERSION].md` in the repository root.

**Important: Links**

* **Checksums link**: Use format `https://redis.io/docs/latest/develop/tools/insight/release-notes/v.[VERSION]/`
  * Example for 3.0.3: `https://redis.io/docs/latest/develop/tools/insight/release-notes/v.3.0.3/`
* **Full Changelog link**: Use format `https://github.com/redis/RedisInsight/compare/[LAST_RELEASED]...[VERSION]`
  * Example for 3.0.3 (if last release was 3.0.2): `https://github.com/redis/RedisInsight/compare/3.0.2...3.0.3`
  * Determine the last released version by checking GitHub releases or repository tags

### 4.2 Store Format (App Store & Microsoft Store)

Save to `RELEASE_NOTES_STORE_[VERSION].md` in the repository root.

**IMPORTANT:** Reuse the same content from the GitHub/Redis Docs format (`RELEASE_NOTES_[VERSION].md`), but apply different formatting. Only the formatting changes - the content (sections, descriptions, items) should remain the same.

**Note:** This single file is used for both App Store and Microsoft Store as they have identical format requirements.

**Format requirements (formatting changes only):**

* Plain text only (no markdown formatting)
* Section header: "Bug fixes" (if only bugs) or appropriate section name (if features exist) - keep the same section names from GitHub format
* Use bullet points with `•` character (not `*`)
* No version number or date header
* No links (remove SHA-512 Checksums and Full Changelog sections)
* No markdown headers (`#`, `###`)
* No bold formatting (`**`)
* Just the section headers and bullet points - same content, different formatting

**Example format:**

```
Bug fixes

• Fixed default database sorting order to display most recently used databases at the top
• Restored missing Pub/Sub functionality including message clear option, full message display with line wrapping, and descending chronological order (most recent messages first)
```

**If features/improvements exist, use appropriate section headers:**

```
Features

• [Feature description]

Improvements

• [Improvement description]

Bug fixes

• [Bug fix description]
```

## 5. Display Summary

Show a summary of:

* Total tickets processed
* Number of bugs, features, and improvements
* Which format was used (simple vs. full)
* File locations for all formats:
  * GitHub/Redis Docs: `RELEASE_NOTES_[VERSION].md`
  * App Store & Microsoft Store: `RELEASE_NOTES_STORE_[VERSION].md`

## JIRA Filter Link Processing

When a JIRA filter link is provided:

1. **Parse the URL and fetch tickets**: Extract the JQL query from the `jql` parameter in the URL and use the JavaScript script `scripts/fetch-jira-tickets.js` to fetch all tickets matching the query
   * Example URL: `https://<jira-domain>/jira/software/c/projects/<project_name>/issues?jql=project%20%3D%20<project_name>%20AND%20status%20%3D%20Closed`
   * Extract and decode: `project = <project_name> AND status = Closed`
   * **Use `node scripts/fetch-jira-tickets.js <jira-filter-url>` to fetch tickets** (the script uses JIRA REST API with credentials from `.env.mcp`)
   * Alternatively, if JIRA MCP tools are available, use them (check with `list_mcp_resources`) such as `jira_search` or `jira_get_project_issues`

2. **Fetch full details**: For each ticket returned, fetch complete information:
   * **Basic fields**: key, summary, type, status, priority, description
   * **Labels**: Extract all labels and check for "Github-Issue" label (critical for filtering)
   * **Custom fields**: Any additional fields needed for categorization
   * **Links**: Check for linked GitHub pull requests or issues
   * **Metadata**: Created date, updated date, resolved date, assignee, reporter

3. **Transform to CSV-like structure**: Convert the fetched ticket data into a structure similar to CSV format:
   ```javascript
   {
       'Issue key': '<ticket-key>',
       'Summary': 'Fix default database sorting...',
       'Issue Type': 'Bug',
       'Status': 'Closed',
       'Priority': 'Medium',
       'Labels': ['Github-Issue', 'Github-Issue-Notification'],
       'Description': 'Full description text...',
       // ... other fields
   }
   ```

4. **Process**: Use the same categorization and filtering logic as CSV processing

## Notes

* Keep summaries concise, user-focused, and descriptive
* For Headlines section, prioritize the most impactful user-facing changes (see 3.0.0 example)
* Ensure all closed tickets are included if they match the criteria
* **Always check GitHub releases page** before generating to ensure consistency with published format:
  https://github.com/redis/RedisInsight/releases
* Match the tone and style of existing releases (professional, clear, user-focused)
