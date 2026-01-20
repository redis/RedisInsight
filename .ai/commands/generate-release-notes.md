***

description: Generate release notes from JIRA tickets for a specific version
argument-hint: <version> \[jira-filter-link-or-jql-or-csv-file]
---------------------------------------------------------------

Generate release notes for RedisInsight releases based on JIRA tickets.

## Examples

```bash
# Generate from JIRA filter link (PREFERRED)
generate-release-notes 3.0.3 "https://redislabs.atlassian.net/jira/software/c/projects/RED/issues?jql=project%20%3D%20RedisInsight..."

# Generate from JIRA query (JQL)
generate-release-notes 3.0.2 "project = RI AND parent = RI-1234"

# Generate from CSV export
generate-release-notes 3.0.2 /path/to/jira-export.csv

# Generate from ticket keys
generate-release-notes 3.0.2 RI-5678,RI-7777,RI-8888
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
   * **Example**: `https://redislabs.atlassian.net/jira/software/c/projects/RED/issues?jql=project%20%3D%20RedisInsight...`
   * Extract the JQL query from the URL (decode URL-encoded parameters)
   * Use JIRA MCP tools to fetch all tickets matching the filter
   * For each ticket, fetch complete details including:
     * Issue key, summary, type, status, priority
     * Labels (check for "Github-Issue" label)
     * Description
     * All custom fields and metadata needed for categorization
   * Process the tickets the same way as CSV data

2. **JIRA Query (JQL)**: If a raw JQL query is provided (e.g., `project = RI AND parent = RI-1234`), use the JIRA MCP tools to fetch tickets with full details

3. **CSV File**: If a CSV file path is provided, parse it to extract ticket information
   * To export from JIRA: Go to JIRA → Search for issues → Run your JQL query → Export → CSV
   * The CSV will contain all ticket information needed for generation

4. **Ticket Keys**: If specific ticket keys are provided (e.g., `RI-5678,RI-7777`), fetch each ticket individually with full details

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
* Other bug tickets (without this label) should be excluded from the Bugs/Bug fixes section
* **Bugs with Github-Issue label should ONLY appear in the Bugs section, NOT in Headlines or Details sections**

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

* **If only bugs (with "Github-Issue" label)**: Use simple "Bug fixes" section only
* **If features/improvements exist**: Use full format with "Headlines", "Details", and "Bugs" sections
  * Note: The "Bugs" section should only include tickets with the "Github-Issue" label

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
* **IMPORTANT: Only include tickets with the "Github-Issue" label in this section**
* [Short description of problem and fix] (for JIRA tickets, don't include ticket ID)
* [#ISSUE-NUMBER](https://github.com/redis/RedisInsight/issues/ISSUE-NUMBER) [Summary] (for GitHub issues, use link format)

**SHA-512 Checksums**

https://redis.io/docs/latest/develop/tools/insight/release-notes/v.[VERSION]/

**Full Changelog**: https://github.com/redis/RedisInsight/compare/[LAST_RELEASED]...[VERSION]
```

**Important formatting notes from GitHub releases:**

* **For JIRA tickets**: Do NOT include ticket IDs (like #1234 or #RI-1234). Instead, provide a very short description of what was the problem and what was fixed. This information can be found in the JIRA ticket description or the GitHub pull request linked to the ticket.
* **For GitHub issues**: Use actual links in format `[#5678](https://github.com/redis/RedisInsight/issues/5678)` (not just `#5678` or `#RI-5678`)
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

## 4. Save Release Notes

Save the generated release notes to `RELEASE_NOTES_[VERSION].md` in the repository root.

**Important: Links**

* **Checksums link**: Use format `https://redis.io/docs/latest/develop/tools/insight/release-notes/v.[VERSION]/`
  * Example for 3.0.3: `https://redis.io/docs/latest/develop/tools/insight/release-notes/v.3.0.3/`
* **Full Changelog link**: Use format `https://github.com/redis/RedisInsight/compare/[LAST_RELEASED]...[VERSION]`
  * Example for 3.0.3 (if last release was 3.0.2): `https://github.com/redis/RedisInsight/compare/3.0.2...3.0.3`
  * Determine the last released version by checking GitHub releases or repository tags

## 5. Display Summary

Show a summary of:

* Total tickets processed
* Number of bugs, features, and improvements
* Which format was used (simple vs. full)
* File location

## JIRA Filter Link Processing

When a JIRA filter link is provided:

1. **Parse the URL and fetch tickets**: Extract the JQL query from the `jql` parameter in the URL and use JIRA MCP tools to fetch all tickets matching the query
   * Example URL: `https://redislabs.atlassian.net/jira/software/c/projects/RED/issues?jql=project%20%3D%20RedisInsight%20AND%20status%20%3D%20Closed`
   * Extract and decode: `project = RedisInsight AND status = Closed`
   * Use available JIRA MCP tools (check with `list_mcp_resources`) such as `jira_search` or `jira_get_project_issues`
   * If MCP tools are not available, use JIRA REST API directly with credentials from `.env.mcp`

2. **Fetch full details**: For each ticket returned, fetch complete information:
   * **Basic fields**: key, summary, type, status, priority, description
   * **Labels**: Extract all labels and check for "Github-Issue" label (critical for filtering)
   * **Custom fields**: Any additional fields needed for categorization
   * **Links**: Check for linked GitHub pull requests or issues
   * **Metadata**: Created date, updated date, resolved date, assignee, reporter

3. **Transform to CSV-like structure**: Convert the fetched ticket data into a structure similar to CSV format:
   ```javascript
   {
       'Issue key': 'RI-7894',
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
