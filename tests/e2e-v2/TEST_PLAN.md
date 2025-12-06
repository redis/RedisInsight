# RedisInsight E2E Test Plan

This document outlines the comprehensive E2E testing strategy for RedisInsight features.

> **📋 Rules**: Before implementing tests, read [`.ai/rules/e2e-testing.md`](../../.ai/rules/e2e-testing.md) for coding standards, patterns, and best practices.

## Overview

The test plan is organized by feature area, with tests categorized by priority:
- 🔴 **Critical** (`@critical`) - Must pass for release, core functionality
- 🟠 **Smoke** (`@smoke`) - Quick sanity checks, run on every PR
- 🟢 **Regression** (`@regression`) - Full coverage, run before release

## Test Status Legend

- ✅ Implemented
- 🔲 Not implemented
- ⏳ In progress
- ⏸️ Skipped

---

## 0. Navigation & Global UI (✅ Implemented)

### 0.1 Main Navigation
| Status | Priority | Test Case |
|--------|----------|-----------|
| ✅ | 🔴🟠 | Navigate to home via Redis logo |
| ✅ | 🟢 | Navigate to Settings page |
| ✅ | 🟢 | Show GitHub repo link |
| ✅ | 🟢 | Show Redis Cloud link |
| ✅ | 🟠 | Display main navigation |
| ✅ | 🟠 | Show Redis logo |
| ✅ | 🟠 | Show settings button |

### 0.2 Help Menu
| Status | Priority | Test Case |
|--------|----------|-----------|
| ✅ | 🟠 | Open Help Center |
| ✅ | 🟢 | Show Keyboard Shortcuts option |
| ✅ | 🟢 | Show Reset Onboarding option |
| ✅ | 🟢 | Show Release Notes link |
| ✅ | 🟢 | Show Provide Feedback link |

### 0.3 Notification Center
| Status | Priority | Test Case |
|--------|----------|-----------|
| ✅ | 🟠 | Open Notification Center |
| ✅ | 🟢 | Show notification center title |
| ✅ | 🟢 | Close notification center |
| 🔲 | 🟢 | View notification badge count |
| 🔲 | 🟢 | View notification list |
| 🔲 | 🟢 | Click notification links |

### 0.4 Copilot Panel
| Status | Priority | Test Case |
|--------|----------|-----------|
| ✅ | 🟠 | Open Copilot panel |
| ✅ | 🟢 | Close Copilot panel |
| 🔲 | 🟢 | Open full screen mode |
| ✅ | 🟢 | View sign-in options (Google, GitHub, SSO) |
| ✅ | 🟢 | Accept terms checkbox |

### 0.5 Insights Panel
| Status | Priority | Test Case |
|--------|----------|-----------|
| ✅ | 🟠 | Open Insights panel |
| ✅ | 🟢 | Close Insights panel |
| ✅ | 🟢 | Switch to Tutorials tab |
| ✅ | 🟢 | Switch to Tips tab |
| 🔲 | 🟢 | Expand/collapse tutorial folders |
| ✅ | 🟢 | View My tutorials section |

---

## 1. Database Management (✅ Partially Implemented)

### 1.1 Add Database
| Status | Priority | Test Case |
|--------|----------|-----------|
| ✅ | 🔴🟠 | Add standalone database |
| ✅ | 🟢 | Add database with no auth |
| ✅ | 🟢 | Add database with username only |
| ✅ | 🟢 | Add database with username and password |
| ✅ | 🔴🟠 | Add cluster database |
| 🔲 | 🟢 | Add database with TLS/SSL |
| 🔲 | 🟢 | Add database with SSH tunnel |
| 🔲 | 🟢 | Validate required fields |
| 🔲 | 🟢 | Test connection before saving |
| 🔲 | 🟢 | Cancel add database |
| 🔲 | 🟢 | Add database via Connection URL |
| 🔲 | 🟢 | Open Connection settings from URL form |
| 🔲 | 🟢 | Configure timeout setting |
| 🔲 | 🟢 | Select logical database |
| 🔲 | 🟢 | Force standalone connection |
| 🔲 | 🟢 | Enable automatic data decompression |
| 🔲 | 🟢 | Configure key name format (Unicode/ASCII/etc) |
| 🔲 | 🟢 | Add database via Redis Sentinel option |
| 🔲 | 🟢 | Add database via Redis Software option |

### 1.2 Database List
| Status | Priority | Test Case |
|--------|----------|-----------|
| ✅ | 🔴🟠 | Filter databases by search query |
| ✅ | 🟢 | Filter with partial match |
| ✅ | 🟢 | Case-insensitive search |
| ✅ | 🟢 | Filter by host:port |
| ✅ | 🟢 | Clear search |
| ✅ | 🟢 | No results message |
| ✅ | 🟠 | Show columns button |
| ✅ | 🔴 | Hide/show columns |
| ✅ | 🔴🟠 | Select single database |
| ✅ | 🟢 | Select multiple databases |
| ✅ | 🟢 | Select all databases |
| ✅ | 🔴 | Delete multiple databases |
| 🔲 | 🟢 | Edit database connection |
| 🔲 | 🟢 | Clone database connection |
| ✅ | 🔴 | Connect to database |
| 🔲 | 🟢 | Database connection status indicator |

### 1.4 Pagination (when > 15 databases)
| Status | Priority | Test Case |
|--------|----------|-----------|
| 🔲 | 🟠 | Show pagination when > 15 databases |
| 🔲 | 🟢 | Navigate to next page |
| 🔲 | 🟢 | Navigate to previous page |
| 🔲 | 🟢 | Navigate to first/last page |
| 🔲 | 🟢 | Change items per page (10, 25, 50, 100) |
| 🔲 | 🟢 | Select page from dropdown |
| 🔲 | 🟢 | Show correct row count "Showing X out of Y rows" |
| 🔲 | 🟢 | Pagination buttons disabled state (first/previous on page 1) |

### 1.5 Import/Export
| Status | Priority | Test Case |
|--------|----------|-----------|
| ✅ | 🟠 | Open import dialog |
| ✅ | 🔴 | Import single database |
| ✅ | 🔴 | Import multiple databases |
| ✅ | 🟢 | Show success count after import |
| ✅ | 🟢 | Cancel import dialog |
| 🔲 | 🔴 | Export databases |
| 🔲 | 🟢 | Import with errors (partial success) |
| 🔲 | 🟢 | Import invalid file format |

---

## 2. Browser Page (✅ Partially Implemented)

### 2.1 Key List View
| Status | Priority | Test Case |
|--------|----------|-----------|
| ✅ | 🔴🟠 | View key list |
| ✅ | 🔴🟠 | Search/filter keys by pattern |
| ✅ | 🟠 | Filter by key type |
| ✅ | 🟢 | Filter keys by exact name |
| ✅ | 🟢 | Clear search filter |
| ✅ | 🟠 | Click on key to view details |
| ✅ | 🟢 | Refresh key list |
| ✅ | 🟢 | Show no results message for non-matching pattern |
| ✅ | 🔴 | Delete key |
| 🔲 | 🟢 | Delete multiple keys (bulk) |
| 🔲 | 🟠 | Search by Values of Keys |
| 🔲 | 🟢 | Configure columns visibility |
| 🔲 | 🟢 | Configure auto-refresh |
| 🔲 | 🟢 | View database stats (CPU, Keys, Memory, Clients) |

### 2.2 Key Tree View (✅ Implemented)
| Status | Priority | Test Case |
|--------|----------|-----------|
| ✅ | 🟠 | Switch to tree view |
| ✅ | 🟢 | Expand/collapse tree nodes |
| ✅ | 🟢 | Configure delimiter |
| ✅ | 🟢 | Sort tree nodes |
| ✅ | 🟢 | View folder percentage and count |
| 🔲 | 🟢 | Scan more keys |
| ✅ | 🟢 | Open tree view settings |

### 2.3 Add Keys (✅ Implemented)
| Status | Priority | Test Case |
|--------|----------|-----------|
| ✅ | 🔴🟠 | Add String key |
| ✅ | 🔴🟠 | Add Hash key |
| ✅ | 🟠 | Add List key |
| ✅ | 🟠 | Add Set key |
| ✅ | 🟠 | Add Sorted Set (ZSet) key |
| ✅ | 🟠 | Add Stream key |
| ✅ | 🟠 | Add JSON key |
| 🔲 | 🟢 | Add key with TTL |
| ✅ | 🟢 | Validate key name (required) |
| ✅ | 🟢 | Cancel add key dialog |

### 2.4 Key Details - String
| Status | Priority | Test Case |
|--------|----------|-----------|
| ✅ | 🔴🟠 | View string value |
| ✅ | 🔴 | Edit string value |
| 🔲 | 🟢 | View/edit TTL |
| 🔲 | 🟢 | Copy value |
| 🔲 | 🟢 | Change value format (text/binary/hex) |

### 2.5 Key Details - Hash (✅ Implemented)
| Status | Priority | Test Case |
|--------|----------|-----------|
| ✅ | 🔴🟠 | View hash fields |
| ✅ | 🔴 | Add hash field |
| ✅ | 🔴 | Edit hash field |
| ✅ | 🔴 | Delete hash field |
| 🔲 | 🟢 | Search hash fields |
| 🔲 | 🟢 | Pagination |

### 2.6 Key Details - List
| Status | Priority | Test Case |
|--------|----------|-----------|
| ✅ | 🔴🟠 | View list elements |
| ✅ | 🔴 | Add element (LPUSH/RPUSH) |
| ✅ | 🔴 | Edit list element |
| ✅ | 🔴 | Remove element |
| 🔲 | 🟢 | Search by index |

### 2.7 Key Details - Set (✅ Implemented)
| Status | Priority | Test Case |
|--------|----------|-----------|
| ✅ | 🔴🟠 | View set members |
| ✅ | 🔴 | Add member |
| ✅ | 🔴 | Remove member |
| 🔲 | 🟢 | Search members |

### 2.8 Key Details - Sorted Set (✅ Implemented)
| Status | Priority | Test Case |
|--------|----------|-----------|
| ✅ | 🔴🟠 | View sorted set members |
| ✅ | 🔴 | Add member with score |
| 🔲 | 🔴 | Edit member score |
| ✅ | 🔴 | Remove member |
| 🔲 | 🟢 | Search members |
| 🔲 | 🟢 | Sort by score/member |

### 2.9 Key Details - Stream (✅ Implemented)
| Status | Priority | Test Case |
|--------|----------|-----------|
| ✅ | 🔴🟠 | View stream entries |
| ✅ | 🔴 | Add stream entry |
| ✅ | 🔴 | Remove stream entry |
| ✅ | 🟢 | View consumer groups |
| 🔲 | 🟢 | Add consumer group |
| 🔲 | 🟢 | View consumers |

### 2.10 Key Details - JSON
| Status | Priority | Test Case |
|--------|----------|-----------|
| ✅ | 🔴🟠 | View JSON value |
| 🔲 | 🔴 | Edit JSON value |
| 🔲 | 🟢 | Add JSON path |
| 🔲 | 🟢 | Delete JSON path |
| 🔲 | 🟢 | Expand/collapse JSON tree |

### 2.11 Bulk Actions
| Status | Priority | Test Case |
|--------|----------|-----------|
| ✅ | 🟠 | Open Bulk Actions panel |
| ✅ | 🟢 | Show Delete Keys tab by default |
| ✅ | 🟢 | Switch to Upload Data tab |
| ✅ | 🟢 | Close Bulk Actions panel |
| ✅ | 🟢 | Show message when no pattern set |
| ✅ | 🔴 | Filter by pattern for deletion |
| ✅ | 🟠 | Show file upload area |
| 🔲 | 🔴 | Bulk delete keys |
| 🔲 | 🟢 | Bulk delete with pattern |
| 🔲 | 🔴 | Bulk upload data |
| 🔲 | 🟢 | View bulk action progress |

---

## 3. Workbench (� In Progress)

### 3.1 Command Execution
| Status | Priority | Test Case |
|--------|----------|-----------|
| ✅ | 🔴🟠 | Execute single Redis command |
| ✅ | 🔴 | Execute multiple commands |
| ✅ | 🔴 | View command result |
| 🔲 | 🟢 | Command autocomplete |
| 🔲 | 🟢 | Command syntax highlighting |
| ✅ | 🔴 | Handle command error |
| 🔲 | 🟢 | Clear editor |
| 🔲 | 🟢 | History navigation |
| ✅ | 🟢 | Toggle Raw mode |
| ✅ | 🟢 | Toggle Group results |

### 3.2 Results View
| Status | Priority | Test Case |
|--------|----------|-----------|
| ✅ | 🔴🟠 | View text result |
| 🔲 | 🟢 | View table result |
| 🔲 | 🟢 | View JSON result |
| 🔲 | 🟢 | Copy result |
| 🔲 | 🟢 | Expand/collapse results |
| ✅ | 🟢 | Clear results |

### 3.3 Tutorials
| Status | Priority | Test Case |
|--------|----------|-----------|
| 🔲 | 🟠 | Open Intro to search tutorial |
| 🔲 | 🟢 | Open Basic use cases tutorial |
| 🔲 | 🟢 | Open Intro to vector search tutorial |
| 🔲 | 🟢 | Click Explore button |

### 3.4 Profiler (Bottom Panel)
| Status | Priority | Test Case |
|--------|----------|-----------|
| ✅ | 🔴 | Start profiler |
| ✅ | 🔴 | Stop profiler |
| 🔲 | 🟢 | Toggle Save Log |
| ✅ | 🟢 | View profiler warning |
| ✅ | 🟢 | Hide/close profiler panel |
| ✅ | 🟢 | Reset profiler |
| ✅ | 🟠 | Open profiler panel |

### 3.5 Command Helper (Bottom Panel)
| Status | Priority | Test Case |
|--------|----------|-----------|
| ✅ | 🟠 | Open Command Helper panel |
| ✅ | 🟢 | Search for a command |
| ✅ | 🟢 | Filter commands by category |
| 🔲 | 🟢 | View command details |
| ✅ | 🟢 | Hide/close Command Helper panel |

---

## 4. CLI (� In Progress)

### 4.1 CLI Panel
| Status | Priority | Test Case |
|--------|----------|-----------|
| ✅ | 🔴🟠 | Open CLI panel |
| ✅ | 🔴 | Execute command |
| ✅ | 🔴 | View command output |
| ✅ | 🟢 | Close CLI panel |
| ✅ | 🟢 | Hide CLI panel |
| ✅ | 🟢 | Handle command errors |
| ✅ | 🟢 | Execute multiple commands in sequence |
| 🔲 | 🟢 | Command history (up/down arrows) |
| 🔲 | 🟢 | Tab completion |
| 🔲 | 🟢 | Multiple CLI sessions |

---

## 5. Pub/Sub (✅ Implemented)

### 5.1 Subscribe
| Status | Priority | Test Case |
|--------|----------|-----------|
| ✅ | 🔴🟠 | Subscribe to channel |
| ✅ | 🔴 | Subscribe with pattern |
| 🔲 | 🔴 | Receive messages |
| ✅ | 🔴 | Unsubscribe |
| 🔲 | 🟢 | Multiple subscriptions |
| 🔲 | 🟢 | Clear messages |

### 5.2 Publish
| Status | Priority | Test Case |
|--------|----------|-----------|
| ✅ | 🔴🟠 | Publish message to channel (form fill) |
| 🔲 | 🟢 | Publish with different formats |

---

## 6. Analytics (✅ Implemented)

### 6.1 Slow Log
| Status | Priority | Test Case |
|--------|----------|-----------|
| ✅ | 🔴🟠 | View slow log entries |
| ✅ | 🔴 | Refresh slow log |
| ✅ | 🟢 | Clear slow log button visible |
| ✅ | 🟢 | Configure slow log button visible |
| 🔲 | 🟢 | Sort entries |
| 🔲 | 🟢 | Filter entries |

### 6.2 Database Analysis
| Status | Priority | Test Case |
|--------|----------|-----------|
| ✅ | 🔴🟠 | Run database analysis |
| ✅ | 🔴 | View analysis results |
| ✅ | 🟢 | View top keys table |
| ✅ | 🟢 | View top namespaces |
| 🔲 | 🟢 | View TTL distribution |
| ✅ | 🟢 | View recommendations (Tips tab) |
| 🔲 | 🟢 | History of analyses

### 6.3 Cluster Details
| Status | Priority | Test Case |
|--------|----------|-----------|
| 🔲 | 🔴🟠 | View cluster nodes |
| 🔲 | 🟢 | View node details |
| 🔲 | 🟢 | View slot distribution |
| 🔲 | 🟢 | Refresh cluster info |

---

## 7. Settings (✅ Implemented)

### 7.1 General Settings
| Status | Priority | Test Case |
|--------|----------|-----------|
| ✅ | 🟠 | View settings page |
| ✅ | 🔴 | Show theme dropdown |
| 🔲 | 🟢 | Toggle show notifications |
| ✅ | 🟢 | Show date/time format options |
| 🔲 | 🟢 | Change date/time format (custom) |
| ✅ | 🟢 | Show time zone dropdown |

### 7.2 Privacy Settings
| Status | Priority | Test Case |
|--------|----------|-----------|
| ✅ | 🟢 | View privacy settings |
| ✅ | 🟢 | Show usage data switch |
| ✅ | 🟢 | Show privacy policy link |

### 7.3 Workbench Settings
| Status | Priority | Test Case |
|--------|----------|-----------|
| ✅ | 🟢 | Show editor cleanup switch |
| ✅ | 🟢 | Show pipeline commands setting |
| 🔲 | 🟢 | Configure command timeout |

### 7.4 Redis Cloud Settings
| Status | Priority | Test Case |
|--------|----------|-----------|
| 🔲 | 🟢 | View Redis Cloud settings |
| 🔲 | 🟢 | Configure cloud account |

### 7.5 Advanced Settings
| Status | Priority | Test Case |
|--------|----------|-----------|
| ✅ | 🟢 | Show keys to scan setting |
| ✅ | 🟢 | Show advanced settings warning |

---

## 8. Vector Search (⏸️ Skipped - Feature not ready)

### 8.1 Index Management
| Status | Priority | Test Case |
|--------|----------|-----------|
| ⏸️ | 🔴🟠 | View indexes |
| ⏸️ | 🔴 | Create index |
| ⏸️ | 🔴 | Delete index |
| ⏸️ | 🟢 | View index info |

### 8.2 Query
| Status | Priority | Test Case |
|--------|----------|-----------|
| ⏸️ | 🔴🟠 | Execute vector search query |
| ⏸️ | 🔴 | View search results |
| ⏸️ | 🟢 | Save query |
| ⏸️ | 🟢 | Load saved query |

---

## 9. Redis Cloud Integration (⏸️ Skipped)

> **Note**: Requires Redis Cloud account credentials. Skipped - external dependency.

### 9.1 Auto-Discovery
| Status | Priority | Test Case |
|--------|----------|-----------|
| ⏸️ | 🔴 | Connect to Redis Cloud account |
| ⏸️ | 🔴 | View subscriptions |
| ⏸️ | 🔴 | View databases |
| ⏸️ | 🔴 | Add cloud database to list |

---

## 10. Sentinel (🔲 Not Implemented)

### 10.1 Sentinel Discovery
| Status | Priority | Test Case |
|--------|----------|-----------|
| 🔲 | 🔴 | Connect to Sentinel |
| 🔲 | 🔴 | Discover databases |
| 🔲 | 🔴 | Add discovered database |

---

## 11. RDI - Redis Data Integration (⏸️ Skipped)

> **Note:** RDI tests are skipped due to external dependencies (requires RDI backend services).
> These tests should be run in environments with RDI infrastructure available.

### 11.1 RDI Instance Management
| Status | Priority | Test Case |
|--------|----------|-----------|
| 🔲 | 🔴 | Add RDI instance |
| 🔲 | 🔴 | Connect to RDI instance |
| 🔲 | 🔴 | View RDI instance list |
| 🔲 | 🟠 | Edit RDI instance |
| 🔲 | 🟠 | Delete RDI instance |
| 🔲 | 🟢 | Test RDI connection |

### 11.2 RDI Pipeline
| Status | Priority | Test Case |
|--------|----------|-----------|
| 🔲 | 🔴 | View pipeline status |
| 🔲 | 🔴 | Start pipeline |
| 🔲 | 🔴 | Stop pipeline |
| 🔲 | 🟠 | Reset pipeline |
| 🔲 | 🟢 | View pipeline statistics |

### 11.3 RDI Jobs
| Status | Priority | Test Case |
|--------|----------|-----------|
| 🔲 | 🔴 | View jobs list |
| 🔲 | 🔴 | Deploy job |
| 🔲 | 🟠 | Edit job configuration |
| 🔲 | 🟠 | Delete job |
| 🔲 | 🟢 | Dry run job |

### 11.4 RDI Configuration
| Status | Priority | Test Case |
|--------|----------|-----------|
| 🔲 | 🔴 | View configuration |
| 🔲 | 🔴 | Edit configuration |
| 🔲 | 🟠 | Deploy configuration |
| 🔲 | 🟢 | Download template |

---

## Test Implementation Priority

### Phase 1 - Core Functionality (First)
1. Browser page - Key list, Add keys, Key details (String, Hash)
2. Workbench - Command execution, Results
3. CLI panel

### Phase 2 - Key Type Coverage
1. Key details - List, Set, ZSet, Stream, JSON
2. Bulk actions

### Phase 3 - Analytics & Monitoring
1. Slow Log
2. Database Analysis
3. Pub/Sub

### Phase 4 - Advanced Features
1. Settings
2. Cluster Details
3. Vector Search

### Phase 5 - Integrations
1. Redis Cloud
2. Sentinel
3. RDI (requires external dependencies - skipped in standard CI)

---

## Test Data Requirements

### Redis Data for Browser Tests
- String keys with various values
- Hash keys with multiple fields
- List keys with elements
- Set keys with members
- Sorted Set keys with scores
- Stream keys with entries
- JSON keys with nested objects

### Redis Configuration for Analytics
- Slow log enabled with low threshold
- Cluster setup for cluster details tests

---

## Environment Requirements

| Environment | Use Case |
|-------------|----------|
| Local | Development testing |
| CI | Automated PR checks |
| Staging | Pre-release validation |

---

## Notes

- All tests should be independent and clean up after themselves
- Use unique prefixes for test data to avoid conflicts
- Tests requiring specific Redis modules should be tagged appropriately
- Network-dependent tests (Cloud, Sentinel) may need mocking in CI

