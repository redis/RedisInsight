***

description: Generate release notes from JIRA tickets for a specific version
argument-hint: <version> \[jira-query-or-csv-file]
--------------------------------------------------

Generate release notes for RedisInsight releases based on JIRA tickets.

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

1. **JIRA Query**: If a JIRA query is provided (e.g., `project = RI AND parent = RI-1234`), use the JIRA MCP tools to fetch tickets
2. **CSV File**: If a CSV file path is provided, parse it to extract ticket information
   * To export from JIRA: Go to JIRA → Search for issues → Run your JQL query → Export → CSV
   * The CSV will contain all ticket information needed for generation
3. **Ticket Keys**: If specific ticket keys are provided (e.g., `RI-5678,RI-7777`), fetch each ticket individually

## 2. Fetch and Categorize Tickets

For each ticket, analyze its essence to categorize it:

### Categorization Logic

**Bug indicators:**

* Issue type contains "bug" or "defect"
* Summary contains: "fix", "bug", "error", "issue", "broken", "crash", "fail"
* Labels contain "bug" or "defect"

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

* **If only bugs**: Use simple "Bug fixes" section only
* **If features/improvements exist**: Use full format with "Headlines", "Details", and "Bugs" sections

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
* [Short description of problem and fix] (for JIRA tickets, don't include ticket ID)
* [#ISSUE-NUMBER](https://github.com/redis/RedisInsight/issues/ISSUE-NUMBER) [Summary] (for GitHub issues, use link format)

**SHA-256 Checksums** or **SHA-512 Checksums**

https://redis.io/docs/latest/develop/tools/insight/release-notes/v.[VERSION]/

**Full Changelog**: https://github.com/redis/RedisInsight/compare/[LAST_RELEASED]...[VERSION]
```

**Important formatting notes from GitHub releases:**

* **For JIRA tickets**: Do NOT include ticket IDs (like #1234 or #RI-1234). Instead, provide a very short description of what was the problem and what was fixed. This information can be found in the JIRA ticket description or the GitHub pull request linked to the ticket.
* **For GitHub issues**: Use actual links in format `[#5678](https://github.com/redis/RedisInsight/issues/5678)` (not just `#5678` or `#RI-5678`)
* Use "SHA-256 Checksums" for older releases, "SHA-512 Checksums" for newer ones
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

## Examples

```bash
# Generate from JIRA query
generate-release-notes 3.0.2 "project = RI AND parent = RI-1234"

# Generate from CSV export
generate-release-notes 3.0.2 /path/to/jira-export.csv

# Generate from ticket keys
generate-release-notes 3.0.2 RI-5678,RI-7777,RI-8888
```

## Notes

* **JIRA tickets**: Do NOT include ticket IDs. Instead, provide a very short description of the problem and fix based on:
  * JIRA ticket description (what was the issue and how it was resolved)
  * GitHub pull request linked to the ticket (if available)
  * Example: "Fixed tooltip layout issue where the link was displayed on a separate row" instead of "#1234 \[Index] Create index identifier tooltip..."
* **GitHub issues**: Use actual links in format `[#5678](https://github.com/redis/RedisInsight/issues/5678)` (not just `#5678` or `#RI-5678`) - match the format from GitHub releases
* Keep summaries concise, user-focused, and descriptive
* For Headlines section, prioritize the most impactful user-facing changes (see 3.0.0 example)
* Ensure all closed tickets are included if they match the criteria
* **Always check GitHub releases page** before generating to ensure consistency with published format:
  https://github.com/redis/RedisInsight/releases
* Match the tone and style of existing releases (professional, clear, user-focused)
