# Implementation Plan: Output calculated checksums in GH workflow

**JIRA Ticket:** [RI-7976](https://redislabs.atlassian.net/browse/RI-7976)
**Epic:** [RI-7576 - Tech Debt](https://redislabs.atlassian.net/browse/RI-7576)
**Parent:** N/A
**Plan Date:** 2026-01-29
**Planner:** Cursor Agent

***

## Executive Summary

This task automates the display of SHA-512 checksums in GitHub Actions workflow summaries, eliminating the need to manually navigate AWS S3 to retrieve checksum values for release notes.

**Components Affected:**

* `.github/generate-checksums-summary.js` (new file)
* `.github/workflows/aws-upload-dev.yml`
* `.github/workflows/aws-upload-prod.yml`

**Key Risks:**

1. YAML parsing dependency availability - Mitigated by using built-in Node.js YAML parsing or simple regex
2. File timing in workflows - Mitigated by placing step after artifact download
3. Breaking existing workflows - Mitigated by using `continue-on-error: true` initially

***

## 1. Requirements Summary

**Story (Why):**
As part of the release process, checksums are added to release notes for each OS app version (e.g., [v3.0.2 release notes](https://redis.io/docs/latest/develop/tools/insight/release-notes/v.3.0.2/)). Currently, to get checksums, developers must navigate to AWS → S3 → redisinsight.download → private/public → latest → `latest.yml` / `latest-mac.yml` / `latest-linux.yml` and manually copy-paste the values. This is time-consuming and error-prone.

**Acceptance Criteria (What):**

1. Checksums are displayed in GitHub Actions job summary
2. Checksums are formatted in a table ready for copy-paste to release notes
3. All platforms are covered: Windows, Linux (AppImage, deb, rpm), macOS (Intel, Apple Silicon)
4. Checksums are available in both staging and production release workflows

**Functional Requirements:**

* Parse `latest.yml`, `latest-linux.yml`, and `latest-mac.yml` files from build artifacts
* Extract SHA-512 checksums for each build artifact
* Generate Markdown table output matching release notes format
* Output to GitHub Actions job summary for easy access

**Non-Functional Requirements:**

* No impact on existing workflow performance
* Graceful handling of missing files
* Clear error messages if parsing fails

**Resources Provided:**

* [Release Notes Example v3.0.2](https://redis.io/docs/latest/develop/tools/insight/release-notes/v.3.0.2/) - Shows expected checksum format
* Related ticket: [RI-7889](https://redislabs.atlassian.net/browse/RI-7889) - Simplify release steps (Closed)

***

## 2. Current State Analysis

### Workflow Architecture

**Release Flow:**

```
release-stage.yml
    ├── tests.yml
    ├── build.yml
    │   ├── pipeline-build-linux.yml → linux-builds artifact (includes latest-linux.yml)
    │   ├── pipeline-build-macos.yml → macos-builds artifact (includes *-mac.yml)
    │   └── pipeline-build-windows.yml → windows-builds artifact (includes latest.yml)
    └── aws-upload-dev.yml (pre-release to staging S3)
    
After approval:
    └── release-prod.yml
        ├── tests.yml
        ├── build.yml
        ├── virustotal.yml
        ├── aws-upload-prod.yml (production S3)
        └── publish-stores.yml
```

### Frontend Changes

N/A - This is a CI/CD change only.

### Backend Changes

N/A - This is a CI/CD change only.

### Build Artifacts to Parse

**File: `latest.yml` (Windows)**

```yaml
version: 3.0.2
files:
  - url: Redis-Insight-win-installer.exe
    sha512: <base64-encoded-sha512>
    size: 123456789
path: Redis-Insight-win-installer.exe
sha512: <base64-encoded-sha512>
releaseDate: '2026-01-28T10:00:00.000Z'
```

**File: `latest-linux.yml`**

```yaml
version: 3.0.2
files:
  - url: Redis-Insight-linux-x86_64.AppImage
    sha512: <base64-encoded-sha512>
  - url: Redis-Insight-linux-amd64.deb
    sha512: <base64-encoded-sha512>
  - url: Redis-Insight-linux-x86_64.rpm
    sha512: <base64-encoded-sha512>
```

**File: `latest-mac.yml`**

```yaml
version: 3.0.2
files:
  - url: Redis-Insight-mac-x64.dmg
    sha512: <base64-encoded-sha512>
  - url: Redis-Insight-mac-arm64.dmg
    sha512: <base64-encoded-sha512>
```

### Existing Patterns to Reuse

* `.github/generate-build-summary.js` - Existing pattern for generating job summaries
* Uses `GITHUB_STEP_SUMMARY` environment variable
* Follows Node.js script pattern already in use

***

## 3. Implementation Plan

### Phase 1: Create Checksums Summary Script

**Goal:** Create a Node.js script that parses YAML files and outputs checksums to job summary

**Tasks:**

1. \[ ] Create `.github/generate-checksums-summary.js`
   * Files: `.github/generate-checksums-summary.js`
   * Acceptance: Script parses YAML files and generates Markdown table

**Script Requirements:**

```javascript
// File mapping for friendly names
const fileMappings = {
  'Redis-Insight-win-installer.exe': 'Windows',
  'Redis-Insight-linux-x86_64.AppImage': 'Linux AppImage',
  'Redis-Insight-linux-amd64.deb': 'Linux Debian',
  'Redis-Insight-linux-x86_64.rpm': 'Linux RPM',
  'Redis-Insight-mac-x64.dmg': 'MacOS Intel',
  'Redis-Insight-mac-arm64.dmg': 'MacOS Apple silicon',
};

// YAML files to parse
const yamlFiles = [
  'latest.yml',        // Windows
  'latest-linux.yml',  // Linux
  'latest-mac.yml',    // macOS
];
```

**Expected Output:**

```markdown
## SHA-512 Checksums

| Package | SHA-512 |
|---------|---------|
| Windows | 4wqbGo0XWd1iXmRMjVtDWCloUzNMWYq0rb13efWv8+... |
| Linux AppImage | bzOdG+/srFdZ9hvWamftwwE+4l4H2/7UuHPb9Xg/G... |
| Linux Debian | 0XrzscKQzrRlKRRuQu0AYdwoK/30HP9e9OsuRFjo... |
| Linux RPM | grPoYw+/ZPMlNC13muASRqebIHjel+LaqggyVW37... |
| MacOS Intel | Ta6PEtDBtjrV+Ut2ArQEaGHB/KYU1OvR6LNIMMTf... |
| MacOS Apple silicon | aAKmBHK+pBGm2yRSQmdzx2Eno9N237kPi/HmqQ... |
```

**Deliverables:**

* New script file `.github/generate-checksums-summary.js`
* Script handles missing files gracefully

**Testing:**

* Test with sample YAML files locally
* Verify output format matches release notes table

***

### Phase 2: Integrate into Staging Workflow

**Goal:** Add checksums output to staging release workflow

**Tasks:**

1. \[ ] Update `.github/workflows/aws-upload-dev.yml`
   * Files: `.github/workflows/aws-upload-dev.yml`
   * Acceptance: Checksums appear in job summary after staging release

**Changes to `aws-upload-dev.yml`:**

Add after line 71 (after `Generate job summary`):

```yaml
- name: Generate checksums summary
  run: node ./.github/generate-checksums-summary.js
  continue-on-error: true
```

**Deliverables:**

* Modified workflow file

**Testing:**

* Trigger staging release (push to `release/*` branch)
* Verify checksums in GitHub Actions job summary

***

### Phase 3: Integrate into Production Workflow

**Goal:** Add checksums output to production release workflow

**Tasks:**

1. \[ ] Update `.github/workflows/aws-upload-prod.yml`
   * Files: `.github/workflows/aws-upload-prod.yml`
   * Acceptance: Checksums appear in job summary after production release

**Changes to `aws-upload-prod.yml`:**

In `release-private` job, add after line 42 (after `Publish private`):

```yaml
- name: Generate checksums summary
  run: node ./.github/generate-checksums-summary.js
  continue-on-error: true
```

**Deliverables:**

* Modified workflow file

**Testing:**

* Verify in next production release
* Compare output with S3 YAML files

***

## 4. Testing Strategy

### Test Scenarios (from Acceptance Criteria)

**AC1: Checksums are displayed in GitHub Actions job summary**

* Test Scenario: Given a completed build, When aws-upload workflow runs, Then checksums appear in job summary
* Test Type: Integration (manual verification on staging release)
* Test Location: GitHub Actions UI

**AC2: Checksums are formatted in a table ready for copy-paste**

* Test Scenario: Given checksums in job summary, When copied to release notes, Then format matches expected table structure
* Test Type: Manual verification
* Test Location: Compare with https://redis.io/docs/latest/develop/tools/insight/release-notes/v.3.0.2/

**AC3: All platforms are covered**

* Test Scenario: Given complete build with all platforms, When checksums summary runs, Then Windows, Linux (3 types), macOS (2 types) are all listed
* Test Type: Integration
* Test Location: GitHub Actions UI

### Edge Cases and Error Scenarios

1. **Missing YAML file (e.g., only Linux build ran)**

   * Scenario: Only `latest-linux.yml` exists
   * Expected Behavior: Script outputs available checksums, skips missing files without error
   * Test: Run script with only one YAML file present

2. **Malformed YAML file**

   * Scenario: YAML file has unexpected format
   * Expected Error: Warning logged, script continues with other files
   * Test: Create malformed YAML and run script

3. **Empty release directory**

   * Scenario: No YAML files found
   * Expected Behavior: Script outputs "No checksums found" message
   * Test: Run script with empty release directory

### Test Data Needs

* Sample `latest.yml` file matching electron-builder format
* Sample `latest-linux.yml` file
* Sample `latest-mac.yml` file

***

## 5. Risk Assessment and Mitigation

### Technical Risks

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| YAML parsing not available in Node.js runtime | Low | Medium | Use simple regex parsing or inline YAML parse; Node 18+ has built-in YAML support via fs |
| File path issues across OS | Low | Low | Use `path.join()` for all paths; script runs on ubuntu-latest |
| electron-builder YAML format changes | Low | Medium | Document expected format; add defensive parsing |

### Integration Risks

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| Script fails and breaks workflow | Low | High | Use `continue-on-error: true` on script step |
| Files not available when script runs | Low | High | Place step after artifact download; verify file existence |
| Existing workflow behavior affected | Very Low | High | Script is additive only; no modifications to existing steps |

### Timeline Risks

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| None identified | - | - | Task is straightforward with clear scope |

### Knowledge Gaps

* Exact format of `latest-mac.yml` (may have different structure for multiple architectures)
  * How to find out: Check actual artifact from previous build or electron-builder documentation

***

## 6. Files to Create/Modify Summary

### New Files

| File | Description |
|------|-------------|
| `.github/generate-checksums-summary.js` | Node.js script to parse YAML files and output checksums to job summary |

### Modified Files

| File | Changes |
|------|---------|
| `.github/workflows/aws-upload-dev.yml` | Add step to generate checksums summary |
| `.github/workflows/aws-upload-prod.yml` | Add step to generate checksums summary |

***

## 7. PR Strategy

**Approach:** Single PR (Recommended)

This task is small and low-risk enough to be implemented in a single PR:

1. All changes are additive (no modifications to existing logic)
2. `continue-on-error: true` prevents any workflow disruption
3. Can be tested in staging before affecting production releases

**Branch Name:** `feat/RI-7976-output-checksums-workflow`

**PR Title:** `feat(ci): Output checksums in GitHub workflow summary (RI-7976)`

***

## 8. Acceptance Checklist

* \[ ] Script created and parses all YAML file types
* \[ ] Checksums appear in staging workflow job summary
* \[ ] Checksums appear in production workflow job summary
* \[ ] Output format matches release notes table format
* \[ ] All platforms covered: Windows, Linux (AppImage, deb, rpm), macOS (Intel, Apple Silicon)
* \[ ] Script handles missing files gracefully
* \[ ] No impact on existing workflow performance
