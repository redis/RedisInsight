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
| ✅ | 🟢 | View notification badge count |
| ✅ | 🟢 | View notification list |
| ✅ | 🟢 | Click notification links |

### 0.4 Copilot Panel
| Status | Priority | Test Case |
|--------|----------|-----------|
| ✅ | 🟠 | Open Copilot panel |
| ✅ | 🟢 | Close Copilot panel |
| ✅ | 🟢 | Open full screen mode |
| ✅ | 🟢 | View sign-in options (Google, GitHub, SSO) |
| ✅ | 🟢 | Accept terms checkbox |

### 0.5 Insights Panel
| Status | Priority | Test Case |
|--------|----------|-----------|
| ✅ | 🟠 | Open Insights panel |
| ✅ | 🟢 | Close Insights panel |
| ✅ | 🟢 | Switch to Tutorials tab |
| ✅ | 🟢 | Switch to Tips tab |
| ✅ | 🟢 | Expand/collapse tutorial folders |
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
| ✅ | 🟢 | Validate required fields |
| ✅ | 🟢 | Test connection before saving |
| ✅ | 🟢 | Cancel add database |
| ✅ | 🟢 | Add database via Connection URL |
| ✅ | 🟢 | Open Connection settings from URL form |
| ✅ | 🟢 | Configure timeout setting |
| ✅ | 🟢 | Select logical database |
| 🔲 | 🟢 | Logical database index displayed in database list |
| 🔲 | 🟢 | Logical database index displayed in database header |
| 🔲 | 🟢 | Logical database index displayed in edit form |
| ✅ | 🟢 | Force standalone connection |
| ✅ | 🟢 | Enable automatic data decompression |
| ✅ | 🟢 | Configure key name format (Unicode/ASCII/etc) |
| 🔲 | 🟢 | Add database via Redis Sentinel option |
| 🔲 | 🟢 | Add database via Redis Software option |
| 🔲 | 🟢 | Auto-discover databases from Redis Software |
| 🔲 | 🟢 | Auto-discover Redis Cloud databases after signing in |
| 🔲 | 🟢 | Add databases using Cloud API keys |
| 🔲 | 🟢 | Check connection state persists across app restarts |

### 1.1.1 Connection Security
| Status | Priority | Test Case |
|--------|----------|-----------|
| 🔲 | 🟢 | Add database using SSH tunneling |
| 🔲 | 🟢 | Connect using SNI configuration |
| 🔲 | 🟢 | Connect with TLS using CA, client, and private key certificates |

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
| ✅ | 🟢 | Edit database connection |
| ✅ | 🟢 | Clone database connection |
| ✅ | 🔴 | Connect to database |
| 🔲 | 🟢 | Database connection status indicator |
| 🔲 | 🟢 | Search by database name |
| 🔲 | 🟢 | Search by host |
| 🔲 | 🟢 | Search by port |
| 🔲 | 🟢 | Search by connection type (OSS Cluster, Sentinel) |
| 🔲 | 🟢 | Search by last connection time |
| 🔲 | 🟢 | Verify Redis Stack icon displayed for databases with modules |

### 1.3 Clone Database
| Status | Priority | Test Case |
|--------|----------|-----------|
| ✅ | 🟠 | Clone standalone database with pre-populated form |
| ✅ | 🟠 | Clone database with same name |
| ✅ | 🟠 | Clone database with new name |
| ✅ | 🟢 | Cancel clone operation |
| ✅ | 🟢 | Go back to edit dialog from clone dialog |
| 🔲 | 🟢 | Clone OSS Cluster database |
| 🔲 | 🟢 | Clone Sentinel database |
| 🔲 | 🟢 | Verify "New Connection" badge on cloned database |
| 🔲 | 🟢 | Verify cloned database appears in list after creation |

### 1.4 Pagination (when > 15 databases)
| Status | Priority | Test Case |
|--------|----------|-----------|
| ✅ | 🟠 | Show pagination when > 15 databases |
| ✅ | 🟢 | Navigate to next page |
| ✅ | 🟢 | Navigate to previous page |
| ✅ | 🟢 | Navigate to first/last page |
| ✅ | 🟢 | Change items per page (10, 25, 50, 100) |
| ✅ | 🟢 | Select page from dropdown |
| ✅ | 🟢 | Show correct row count "Showing X out of Y rows" |
| ✅ | 🟢 | Pagination buttons disabled state (first/previous on page 1) |

### 1.5 Import/Export
| Status | Priority | Test Case |
|--------|----------|-----------|
| ✅ | 🟠 | Open import dialog |
| ✅ | 🔴 | Import single database |
| ✅ | 🔴 | Import multiple databases |
| ✅ | 🟢 | Show success count after import |
| ✅ | 🟢 | Cancel import dialog |
| ✅ | 🔴 | Export databases |
| 🔲 | 🟢 | Import with errors (partial success) |
| 🔲 | 🟢 | Import invalid file format |
| 🔲 | 🟢 | Confirm database tags are exported/imported correctly |
| 🔲 | 🟢 | Confirm import summary distinguishes Fully/Partially Imported and Failed |

### 1.6 Database Tags
| Status | Priority | Test Case |
|--------|----------|-----------|
| 🔲 | 🟠 | Add descriptive tags to a database |
| 🔲 | 🟢 | Remove tags from a database |
| 🔲 | 🟢 | Import tags automatically from Redis Cloud databases |

### 1.7 Certificate and Encryption Handling
| Status | Priority | Test Case |
|--------|----------|-----------|
| 🔲 | 🟢 | Store credentials encrypted in local keychain when encryption enabled |
| 🔲 | 🟢 | Display warning when encryption disabled and credentials stored as plaintext |

### 1.8 Decompression
| Status | Priority | Test Case |
|--------|----------|-----------|
| 🔲 | 🟢 | Confirm setting a decompression type works |

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
| ✅ | 🟢 | Delete multiple keys (bulk) |
| ✅ | 🟠 | Search by Values of Keys |
| ✅ | 🟢 | Configure columns visibility |
| ✅ | 🟢 | Configure auto-refresh |
| ✅ | 🟢 | View database stats (CPU, Keys, Memory, Clients) |

### 2.2 Key Tree View (✅ Implemented)
| Status | Priority | Test Case |
|--------|----------|-----------|
| ✅ | 🟠 | Switch to tree view |
| ✅ | 🟢 | Expand/collapse tree nodes |
| ✅ | 🟢 | Configure delimiter |
| ✅ | 🟢 | Sort tree nodes |
| ✅ | 🟢 | View folder percentage and count |
| ✅ | 🟢 | Scan more keys (covered by "should show scan more button when searching" test) |
| ✅ | 🟢 | Open tree view settings |
| 🔲 | 🟢 | Tree view mode state persists after page refresh |
| 🔲 | 🟢 | Filter state preserved when switching between Browser and Tree view |
| 🔲 | 🟢 | Key type filter state preserved when switching views |
| 🔲 | 🟢 | Configure multiple delimiters in tree view |
| 🔲 | 🟢 | Cancel delimiter change reverts to previous value |
| 🔲 | 🟢 | Verify namespace tooltip shows key pattern and delimiter |
| 🔲 | 🟢 | Scan DB by 10K keys in tree view |

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
| ✅ | 🟢 | Add key with TTL |
| ✅ | 🟢 | Validate key name (required) |
| ✅ | 🟢 | Cancel add key dialog |

### 2.4 Key Details - String
| Status | Priority | Test Case |
|--------|----------|-----------|
| ✅ | 🔴🟠 | View string value |
| ✅ | 🔴 | Edit string value |
| ✅ | 🟢 | View/edit TTL |
| ✅ | 🟢 | Copy key name (covered by "should show copy key name button on hover" test) |
| ✅ | 🟢 | Change value format (text/binary/hex) |
| 🔲 | 🟢 | Rename key and confirm new name propagates across Browser |
| 🔲 | 🟢 | Confirm TTL countdown updates in real time |

### 2.5 Key Details - Hash (✅ Implemented)
| Status | Priority | Test Case |
|--------|----------|-----------|
| ✅ | 🔴🟠 | View hash fields |
| ✅ | 🔴 | Add hash field |
| ✅ | 🔴 | Edit hash field |
| ✅ | 🔴 | Delete hash field |
| ✅ | 🟢 | Search hash fields |
| ⏭️ | 🟢 | Pagination (N/A - hash fields use virtual scrolling, not pagination) |

### 2.6 Key Details - List
| Status | Priority | Test Case |
|--------|----------|-----------|
| ✅ | 🔴🟠 | View list elements |
| ✅ | 🔴 | Add element (LPUSH/RPUSH) |
| ✅ | 🔴 | Edit list element |
| ✅ | 🔴 | Remove element |
| ✅ | 🟢 | Search by index |

### 2.7 Key Details - Set (✅ Implemented)
| Status | Priority | Test Case |
|--------|----------|-----------|
| ✅ | 🔴🟠 | View set members |
| ✅ | 🔴 | Add member |
| ✅ | 🔴 | Remove member |
| ✅ | 🟢 | Search members |

### 2.8 Key Details - Sorted Set (✅ Implemented)
| Status | Priority | Test Case |
|--------|----------|-----------|
| ✅ | 🔴🟠 | View sorted set members |
| ✅ | 🔴 | Add member with score |
| ✅ | 🔴 | Edit member score |
| ✅ | 🔴 | Remove member |
| ✅ | 🟢 | Search members |
| ✅ | 🟢 | Sort by score/member |

### 2.9 Key Details - Stream (✅ Implemented)
| Status | Priority | Test Case |
|--------|----------|-----------|
| ✅ | 🔴🟠 | View stream entries |
| ✅ | 🔴 | Add stream entry |
| ✅ | 🔴 | Remove stream entry |
| ✅ | 🟢 | View consumer groups (covered by "should show no consumer groups message" test) |
| ✅ | 🟢 | Add consumer group |
| ⏭️ | 🟢 | View consumers (N/A - requires active consumers which need external client) |

### 2.9.1 Stream Consumer Groups
| Status | Priority | Test Case |
|--------|----------|-----------|
| 🔲 | 🟠 | Create consumer group with Entry ID "0" (from beginning) |
| 🔲 | 🟠 | Create consumer group with Entry ID "$" (new messages only) |
| 🔲 | 🟢 | Create consumer group with custom Entry ID |
| 🔲 | 🟢 | View consumer group columns (Group Name, Consumers, Pending, Last Delivered ID) |
| 🔲 | 🟢 | View consumer information columns (Consumer Name, Pending, Idle Time) |
| 🔲 | 🟢 | Delete consumer from consumer group |
| 🔲 | 🟢 | Delete consumer group |
| 🔲 | 🟢 | Edit Last Delivered ID for consumer group |

### 2.9.2 Stream Pending Messages
| Status | Priority | Test Case |
|--------|----------|-----------|
| 🔲 | 🟠 | View pending messages for consumer |
| 🔲 | 🟢 | Acknowledge pending message |
| 🔲 | 🟢 | Claim pending message |
| 🔲 | 🟢 | Claim pending message with idle time parameter |
| 🔲 | 🟢 | Force claim pending message |

### 2.10 Key Details - JSON
| Status | Priority | Test Case |
|--------|----------|-----------|
| ✅ | 🔴🟠 | View JSON value |
| ✅ | 🔴 | Edit JSON value |
| ✅ | 🟢 | Add JSON path (covered by "should add JSON field" test) |
| ✅ | 🟢 | Delete JSON path (covered by "should remove JSON field" test) |
| ⏭️ | 🟢 | Expand/collapse JSON tree (N/A - JSON tree view not available in current UI) |

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
| ✅ | 🔴 | Bulk delete keys |
| ✅ | 🟢 | Bulk delete with pattern |
| ✅ | 🔴 | Bulk upload data |
| 🔲 | 🟢 | View bulk action progress |
| 🔲 | 🟢 | Confirm summary screen displays processed, deleted, failed counts |
| 🔲 | 🟢 | Confirm deletion failures surfaced in summary log |
| 🔲 | 🟢 | Confirm performance when deleting thousands of keys |
| 🔲 | 🟢 | Confirm performance when bulk uploading large datasets (>10K keys) |

### 2.12 Value Formatters
| Status | Priority | Test Case |
|--------|----------|-----------|
| ✅ | 🟠 | Display format dropdown |
| ✅ | 🟠 | Switch to ASCII format |
| ✅ | 🟠 | Switch to HEX format |
| ✅ | 🟠 | Switch to Binary format |
| ✅ | 🟠 | Switch to JSON format |
| ✅ | 🟢 | Show all format options in dropdown |
| 🔲 | 🟢 | View value in Msgpack format |
| 🔲 | 🟢 | View value in Protobuf format |
| 🔲 | 🟢 | View value in Java serialized format |
| 🔲 | 🟢 | View value in PHP serialized format |
| 🔲 | 🟢 | View value in Pickle format |
| 🔲 | 🟢 | View value in DateTime/timestamp format |
| 🔲 | 🟢 | Confirm conversion between formats is smooth |
| 🔲 | 🟢 | Confirm non-editable formats disable inline editing |
| 🔲 | 🟢 | Confirm tooltip explains conversion errors |
| 🔲 | 🟢 | Confirm switching formats for large keys (>10MB) doesn't freeze UI |
| 🔲 | 🟢 | Edit value in JSON format and save |
| 🔲 | 🟢 | Edit value in PHP serialized format and save |
| 🔲 | 🟢 | Verify bigInt values display correctly |

### 2.13 Search Keys (Search Index)
| Status | Priority | Test Case |
|--------|----------|-----------|
| 🔲 | 🟠 | Create a new search index from index creation form |
| 🔲 | 🟠 | Select existing index and search by indexed fields |
| 🔲 | 🟢 | Perform search by full key name with exact match |
| 🔲 | 🟢 | Create index with FT.CREATE command with multiple prefixes |
| 🔲 | 🟢 | Switch between RediSearch mode and pattern mode |
| 🔲 | 🟢 | View tooltip explaining RediSearch mode |
| 🔲 | 🟢 | Search by index in Browser view |
| 🔲 | 🟢 | Search by index in Tree view |
| 🔲 | 🟢 | View filter history for RediSearch queries |
| 🔲 | 🟢 | Verify context persistence for RediSearch across navigation |
| 🔲 | 🟢 | Display "No Redis Query Engine" message when module not available |
| 🔲 | 🟢 | Delete search index with FT.DROPINDEX |

### 2.14 Key Filtering Patterns
| Status | Priority | Test Case |
|--------|----------|-----------|
| ✅ | 🟠 | Filter keys with asterisk (*) wildcard |
| ✅ | 🟢 | Filter keys with question mark (?) single character wildcard |
| ✅ | 🟢 | Filter keys with [xy] character class (matches x or y) |
| 🔲 | 🟢 | Filter keys with [^x] negated character class |
| ✅ | 🟢 | Filter keys with [a-z] character range |
| 🔲 | 🟢 | Escape special characters in filter pattern |
| ✅ | 🟢 | Clear filter and search again |
| 🔲 | 🟢 | Filter exact key name in large database (10M+ keys) |
| 🔲 | 🟢 | Filter by pattern in large database (10M+ keys) |
| 🔲 | 🟢 | Filter by key type in large database |

### 2.15 Browser Context
| Status | Priority | Test Case |
|--------|----------|-----------|
| ✅ | 🟠 | Browser context preserved when switching tabs |
| ✅ | 🟢 | Selected key details preserved when switching tabs |
| ✅ | 🟢 | Context cleared when page is reloaded |
| 🔲 | 🟢 | CLI command history preserved in context |
| 🔲 | 🟢 | Context cleared when navigating to different database |

---

## 3. Workbench (� In Progress)

### 3.1 Command Execution
| Status | Priority | Test Case |
|--------|----------|-----------|
| ✅ | 🔴🟠 | Execute single Redis command |
| ✅ | 🔴 | Execute multiple commands |
| ✅ | 🔴 | View command result |
| ✅ | 🟢 | Command autocomplete |
| ✅ | 🟢 | Command syntax highlighting |
| ✅ | 🔴 | Handle command error |
| ✅ | 🟢 | Clear editor |
| ✅ | 🟢 | History navigation |
| ✅ | 🟢 | Toggle Raw mode |
| ✅ | 🟢 | Toggle Group results |
| 🔲 | 🟢 | Confirm command history persists after page refresh or session restart |
| 🔲 | 🟢 | Re-run a previous command from history |
| 🔲 | 🟢 | Run commands with quantifier (e.g., "10 RANDOMKEY") |
| 🔲 | 🟢 | View group summary (X Command(s) - Y success, Z error(s)) |
| 🔲 | 🟢 | View full list of commands with results in group mode |
| 🔲 | 🟢 | Copy all commands from group result |
| 🔲 | 🟢 | View group results in full screen mode |
| 🔲 | 🟢 | Original datetime preserved in history after page refresh |
| 🔲 | 🟢 | Display message when result exceeds 1MB after refresh |
| 🔲 | 🟢 | History limited to 30 commands (oldest replaced by newest) |
| 🔲 | 🟢 | Quick-access to command history with Up Arrow |
| 🔲 | 🟢 | Use Non-Redis Editor with Shift+Space |

### 3.1.1 Workbench Context
| Status | Priority | Test Case |
|--------|----------|-----------|
| ✅ | 🟠 | Editor content preserved when switching tabs |
| ✅ | 🟢 | Command results preserved when switching tabs |
| ✅ | 🟢 | Context cleared when page is reloaded |
| 🔲 | 🟢 | Insights panel state preserved when navigating |

### 3.2 Results View
| Status | Priority | Test Case |
|--------|----------|-----------|
| ✅ | 🔴🟠 | View text result |
| ✅ | 🟢 | View table result |
| ✅ | 🟢 | View JSON result |
| ✅ | 🟢 | Copy result |
| ✅ | 🟢 | Expand/collapse results |
| ✅ | 🟢 | Clear results |
| ✅ | 🟢 | Re-run command |
| ✅ | 🟢 | Delete command result |

### 3.2.1 Plugin and Visualization Support
| Status | Priority | Test Case |
|--------|----------|-----------|
| 🔲 | 🟠 | Confirm plugins for Search, TimeSeries load correctly |
| 🔲 | 🟢 | Run FT.SEARCH command and confirm visualized table output |
| 🔲 | 🟢 | Run TS.RANGE command and confirm chart visualization |
| 🔲 | 🟢 | Confirm plugins display module-specific icons and metadata |
| 🔲 | 🟢 | Switch between views (Table ↔ Text) and confirm format updates instantly |
| 🔲 | 🟢 | Confirm TimeSeries visualization displays correct axes, values, and units |

### 3.3 Tutorials
| Status | Priority | Test Case |
|--------|----------|-----------|
| ✅ | 🟠 | Open Intro to search tutorial |
| ✅ | 🟢 | Open Basic use cases tutorial |
| ✅ | 🟢 | Open Intro to vector search tutorial |
| ✅ | 🟢 | Click Explore button |
| ✅ | 🟢 | Close insights panel |

### 3.4 Profiler (Bottom Panel)
| Status | Priority | Test Case |
|--------|----------|-----------|
| ✅ | 🔴 | Start profiler |
| ✅ | 🔴 | Stop profiler |
| ✅ | 🟢 | Toggle Save Log |
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
| ✅ | 🟢 | View command details |
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
| ✅ | 🟢 | Command history (up/down arrows) |
| ✅ | 🟢 | Tab completion |
| ⏸️ | 🟢 | Multiple CLI sessions | Feature not available in current UI |
| 🔲 | 🟢 | Run commands on Cluster databases and confirm transparent node redirection |

### 4.2 Command Helper Integration
| Status | Priority | Test Case |
|--------|----------|-----------|
| 🔲 | 🟠 | Type command in CLI; confirm Command Helper updates dynamically |
| 🔲 | 🟢 | Filter helper results by command category (Keys, Strings, JSON, Search) |
| 🔲 | 🟢 | Open "Read more" link and confirm redirection to Redis.io documentation |
| 🔲 | 🟢 | Confirm helper displays module-specific commands (FT., JSON., TS.*) |

---

## 5. Pub/Sub (✅ Partially Implemented)

### 5.1 Subscribe
| Status | Priority | Test Case |
|--------|----------|-----------|
| ✅ | 🔴🟠 | Subscribe to channel |
| ✅ | 🔴 | Subscribe with pattern |
| ✅ | 🔴 | Receive messages |
| ✅ | 🔴 | Unsubscribe |
| ⏸️ | 🟢 | Multiple subscriptions | Feature not available - single pattern subscription only |
| ⏸️ | 🟢 | Clear messages | <!-- Feature not implemented in UI yet -->
| 🔲 | 🟢 | Confirm newest messages appear at top of message table |
| 🔲 | 🟢 | Confirm connection/subscription persist while navigating in same DB context |
| 🔲 | 🟢 | Confirm performance under high throughput (≥5,000 messages/minute) |

### 5.2 Publish
| Status | Priority | Test Case |
|--------|----------|-----------|
| ✅ | 🔴🟠 | Publish message to channel (form fill) |
| ⏸️ | 🟢 | Publish with different formats | Feature not available - plain text only |
| 🔲 | 🟢 | Confirm published message appears instantly in message feed |
| 🔲 | 🟢 | Confirm publish button shows status report with affected clients count |

### 5.3 Message Table View
| Status | Priority | Test Case |
|--------|----------|-----------|
| ✅ | 🟠 | View message table with subscribed messages |
| 🔲 | 🟢 | Navigate message table pages |
| 🔲 | 🟢 | Sort message table by columns |
| 🔲 | 🟢 | Confirm table configuration persists across navigation |
| 🔲 | 🟢 | Confirm message table scrollable with 100+ rows |
| ✅ | 🟢 | Confirm status bar shows proper subscription status |
| ✅ | 🟢 | Confirm message count displays in status bar |

### 5.4 Cluster Mode (Pub/Sub)
| Status | Priority | Test Case |
|--------|----------|-----------|
| 🔲 | 🟠 | Confirm info message about SPUBLISH on welcome screen |
| 🔲 | 🟢 | Confirm status report doesn't show affected clients in cluster mode |
| ⏸️ | 🟢 | SPUBLISH messages visibility | _Note: Use SSUBSCRIBE in Workbench_ |

---

## 6. Analytics (✅ Implemented)

### 6.1 Slow Log
| Status | Priority | Test Case |
|--------|----------|-----------|
| ✅ | 🔴🟠 | View slow log entries |
| ✅ | 🔴 | Refresh slow log |
| ✅ | 🟢 | Clear slow log button visible |
| ✅ | 🟢 | Configure slow log button visible |
| ✅ | 🟢 | Sort entries |
| ⏸️ | 🟢 | Filter entries | _Skipped: No filter UI available in current version_ |
| 🔲 | 🟢 | Confirm slowlog-max-len and slowlog-log-slower-than configuration values display |
| 🔲 | 🟢 | View command timestamp, duration, and execution details |
| 🔲 | 🟢 | Change duration units between milliseconds and microseconds |
| 🔲 | 🟢 | Adjust slowlog-log-slower-than threshold and confirm results update |
| 🔲 | 🟢 | Confirm empty state message displays correctly |
| 🔲 | 🟢 | Confirm performance with thousands of slowlog entries |

### 6.2 Database Analysis
| Status | Priority | Test Case |
|--------|----------|-----------|
| ✅ | 🔴🟠 | Run database analysis |
| ✅ | 🔴 | View analysis results |
| ✅ | 🟢 | View top keys table |
| ✅ | 🟢 | View top namespaces |
| ✅ | 🟢 | View TTL distribution |
| ✅ | 🟢 | View recommendations (Tips tab) |
| ✅ | 🟢 | History of analyses |
| 🔲 | 🟢 | Confirm charts for data types, namespaces, expirations render |
| 🔲 | 🟢 | Confirm extrapolation toggle adjusts charted values |
| 🔲 | 🟢 | Confirm analysis distinguishes between scanned and estimated data |
| 🔲 | 🟢 | Confirm responsiveness on large datasets |
| 🔲 | 🟢 | Sort namespaces by key pattern |
| 🔲 | 🟢 | Sort namespaces by memory |
| 🔲 | 🟢 | Sort namespaces by number of keys |
| 🔲 | 🟢 | Filter namespace to Browser view |
| 🔲 | 🟢 | Display "No namespaces" message with Tree View link |
| 🔲 | 🟢 | Toggle "No Expiry" in TTL distribution graph |
| 🔲 | 🟢 | View analysis history (up to 5 reports) |
| 🔲 | 🟢 | Vote recommendation as useful |
| 🔲 | 🟢 | Vote recommendation as not useful |
| 🔲 | 🟢 | Expand/collapse recommendation details |
| 🔲 | 🟢 | View recommendation labels (code changes, configuration changes) |
| 🔲 | 🟢 | Open tutorial from recommendation |

### 6.2.1 Profiler
| Status | Priority | Test Case |
|--------|----------|-----------|
| ✅ | 🔴 | Start profiler |
| ✅ | 🔴 | Stop profiler |
| ✅ | 🟢 | Toggle Save Log |
| ✅ | 🟢 | View profiler warning |
| 🔲 | 🟢 | Observe live command feed without delay |
| 🔲 | 🟢 | Toggle "Save Logs" and confirm local temp log file creation |
| 🔲 | 🟢 | Test profiler behavior under heavy load (thousands of commands/minute) |

### 6.3 Cluster Details
> ⚠️ **SKIPPED**: Requires properly configured OSS Cluster infrastructure (multiple nodes)

| Status | Priority | Test Case |
|--------|----------|-----------|
| ⏭️ | 🔴🟠 | View cluster nodes |
| ⏭️ | 🟢 | View node details |
| ⏭️ | 🟢 | View slot distribution |
| ⏭️ | 🟢 | Refresh cluster info |
| ⏭️ | 🟢 | View Overview tab by default for OSS Cluster |
| ⏭️ | 🟢 | View cluster header info (Type, Version, User) |
| ⏭️ | 🟢 | View cluster uptime |
| ⏭️ | 🟢 | View primary node statistics table |
| ⏭️ | 🟢 | View columns (Commands/s, Clients, Total Keys, Network Input/Output, Total Memory) |
| ⏭️ | 🟢 | Verify dynamic values update in statistics table |

---

## 7. Settings (✅ Implemented)

### 7.1 General Settings
| Status | Priority | Test Case |
|--------|----------|-----------|
| ✅ | 🟠 | View settings page |
| ✅ | 🔴 | Show theme dropdown |
| ✅ | 🟢 | Toggle show notifications |
| ✅ | 🟢 | Show date/time format options |
| ✅ | 🟢 | Change date/time format (custom) |
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
| ⏭️ | 🟢 | Configure command timeout (N/A - per-database setting, not in settings page) |

### 7.4 Redis Cloud Settings
| Status | Priority | Test Case |
|--------|----------|-----------|
| ✅ | 🟢 | View Redis Cloud settings |
| ✅ | 🟢 | Configure cloud account |

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

## 10. Sentinel (⏸️ Skipped)

> **Note:** Sentinel tests are skipped due to external dependencies (requires Sentinel infrastructure).
> These tests should be run in environments with Sentinel setup available.

### 10.1 Sentinel Discovery
| Status | Priority | Test Case |
|--------|----------|-----------|
| ⏸️ | 🔴 | Connect to Sentinel |
| ⏸️ | 🔴 | Discover databases |
| ⏸️ | 🔴 | Add discovered database |

---

## 11. RDI - Redis Data Integration (⏸️ Skipped)

> **Note:** RDI tests are skipped due to external dependencies (requires RDI backend services).
> These tests should be run in environments with RDI infrastructure available.

### 11.1 RDI Instance Management
| Status | Priority | Test Case |
|--------|----------|-----------|
| ⏸️ | 🔴 | Add RDI instance |
| ⏸️ | 🔴 | Connect to RDI instance |
| ⏸️ | 🔴 | View RDI instance list |
| ⏸️ | 🟠 | Edit RDI instance |
| ⏸️ | 🟠 | Delete RDI instance |
| ⏸️ | 🟢 | Test RDI connection |
| ⏸️ | 🟢 | Error message displayed for invalid/non-existent RDI instance |

### 11.2 RDI Pipeline
| Status | Priority | Test Case |
|--------|----------|-----------|
| ⏸️ | 🔴 | View pipeline status |
| ⏸️ | 🔴 | Start pipeline |
| ⏸️ | 🔴 | Stop pipeline |
| ⏸️ | 🟠 | Reset pipeline |
| ⏸️ | 🟢 | View pipeline statistics |
| ⏸️ | 🟢 | Popover displayed for Reset button |
| ⏸️ | 🟢 | Popover displayed for Stop button |
| ⏸️ | 🟢 | Deploy successfully deploys configuration with success notification |
| ⏸️ | 🟢 | Pipeline state: Not running / Streaming |
| ⏸️ | 🟢 | Show loading indicators when waiting for action |

### 11.3 RDI Jobs
| Status | Priority | Test Case |
|--------|----------|-----------|
| ⏸️ | 🔴 | View jobs list |
| ⏸️ | 🔴 | Deploy job |
| ⏸️ | 🟠 | Edit job configuration |
| ⏸️ | 🟠 | Delete job |
| ⏸️ | 🟢 | Dry run job |
| ⏸️ | 🟢 | Add job via side menu |
| ⏸️ | 🟢 | Delete job via side menu |
| ⏸️ | 🟢 | Job shows unsaved changes indicator (blue) |
| ⏸️ | 🟢 | Job shows error indicator (red icon with hover details) |

### 11.4 RDI Configuration
| Status | Priority | Test Case |
|--------|----------|-----------|
| ⏸️ | 🔴 | View configuration |
| ⏸️ | 🔴 | Edit configuration |
| ⏸️ | 🟠 | Deploy configuration |
| 🔲 | 🟢 | Download template |
| ⏸️ | 🟢 | Configuration shows unsaved changes indicator |
| ⏸️ | 🟢 | Configuration shows error indicator with hover details |
| ⏸️ | 🟢 | Insert template button opens menu |
| ⏸️ | 🟢 | Apply template only works on empty editor |

### 11.5 RDI Control Menu
| Status | Priority | Test Case |
|--------|----------|-----------|
| ⏸️ | 🟢 | Download deployed pipeline action |
| ⏸️ | 🟢 | Import pipeline from ZIP file |
| ⏸️ | 🟢 | Upload from file allows only ZIP files |
| ⏸️ | 🟢 | Save to file (ZIP) successfully |

### 11.6 RDI Analytics
| Status | Priority | Test Case |
|--------|----------|-----------|
| ⏸️ | 🟢 | Auto-refresh opens configuration panel |
| ⏸️ | 🟢 | Auto-refresh can be disabled |
| ⏸️ | 🟢 | Display data based on pipeline metrics |
| ⏸️ | 🟢 | Test connection opens panel with results |
| ⏸️ | 🟢 | Test connection displays all targets and sources |

---

## 12. Miscellaneous

### 12.1 Notifications
| Status | Priority | Test Case |
|--------|----------|-----------|
| 🔲 | 🟠 | Confirm unread notifications display with distinct highlight/badge |
| 🔲 | 🟢 | Confirm notification badge count updates when new messages arrive |
| 🔲 | 🟢 | Confirm each notification displays title, description, and timestamp |

### 12.2 Telemetry & Analytics
| Status | Priority | Test Case |
|--------|----------|-----------|
| 🔲 | 🟢 | Trigger key events and confirm telemetry records correctly |
| 🔲 | 🟢 | Confirm telemetry payloads contain Database ID, Timestamp, Event Type |
| 🔲 | 🟢 | Confirm telemetry events appear in analytics console/local logs |
| 🔲 | 🟢 | Disable telemetry in Settings and confirm no new events logged |

### 12.3 EULA & Onboarding
| Status | Priority | Test Case |
|--------|----------|-----------|
| 🔲 | 🟠 | First launch shows EULA & Privacy Agreement dialog |
| 🔲 | 🟢 | "Use recommended settings" auto-selects telemetry and encryption |
| 🔲 | 🟢 | Decline analytics confirms telemetry events not sent |
| 🔲 | 🟢 | Confirm onboarding progresses correctly |
| 🔲 | 🟢 | Reset onboarding from Help Center |
| 🔲 | 🟢 | Onboarding step: Browser |
| 🔲 | 🟢 | Onboarding step: Tree view |
| 🔲 | 🟢 | Onboarding step: Filter and search |
| 🔲 | 🟢 | Onboarding step: CLI (panel opens) |
| 🔲 | 🟢 | Onboarding step: Command Helper (panel opens) |
| 🔲 | 🟢 | Onboarding step: Profiler (panel opens) |
| 🔲 | 🟢 | Onboarding step: Try Workbench (shows CLIENT LIST or FT.INFO) |
| 🔲 | 🟢 | Onboarding step: Explore and learn more |
| 🔲 | 🟢 | Onboarding step: Upload your tutorials |
| 🔲 | 🟢 | Onboarding step: Database Analysis |
| 🔲 | 🟢 | Onboarding step: Slow Log |
| 🔲 | 🟢 | Onboarding step: Pub/Sub |
| 🔲 | 🟢 | Onboarding step: Great job! (final step) |
| 🔲 | 🟢 | Skip tour button completes onboarding |
| 🔲 | 🟢 | Back button navigates to previous step |
| 🔲 | 🟢 | Onboarding state persists after page refresh |
| 🔲 | 🟢 | Final step closes when navigating to another page |

### 12.4 Redis Cloud Conversion Funnel
| Status | Priority | Test Case |
|--------|----------|-----------|
| ⏸️ | 🟠 | User signs up with Google/GitHub → account, subscription, DB created → redirected to RI |
| ⏸️ | 🟢 | Existing Redis Cloud user without DB → free DB created → connection prompt |
| ⏸️ | 🟢 | All CTAs to Redis Cloud complete successfully (including tutorials) |
| ⏸️ | 🟢 | All CTAs pass UTM parameters correctly to Redis Cloud |
| ⏸️ | 🟢 | Telemetry events for conversion funnel are successful |

### 12.5 App Settings
| Status | Priority | Test Case |
|--------|----------|-----------|
| 🔲 | 🟢 | Open Settings and update general preferences (theme, telemetry) |
| 🔲 | 🟢 | Confirm edits apply immediately across UI |

### 12.6 Deep Linking (URL Handling)
| Status | Priority | Test Case |
|--------|----------|-----------|
| 🔲 | 🟠 | Add database via redisinsight://databases/connect?redisUrl=... |
| 🔲 | 🟢 | Auto-connect to database with redirect to workbench |
| 🔲 | 🟢 | Open specific tutorial via tutorial parameter |
| 🔲 | 🟢 | Cloud parameters (cloudBdbId, subscriptionType, planMemoryLimit, memoryLimitMeasurementUnit) |
| 🔲 | 🟢 | Onboarding parameter opens onboarding flow |
| 🔲 | 🟢 | Copilot parameter opens AI assistant |
| 🔲 | 🟢 | Invalid URL shows error message |
| 🔲 | 🟢 | URL with missing required parameters shows validation error |

### 12.7 Keyboard Shortcuts
| Status | Priority | Test Case |
|--------|----------|-----------|
| ✅ | 🟠 | Open keyboard shortcuts panel from Help Center |
| ✅ | 🟠 | View Desktop application shortcuts section |
| ✅ | 🟠 | View CLI shortcuts section |
| ✅ | 🟠 | View Workbench shortcuts section |
| ✅ | 🟢 | Close shortcuts panel |
| ✅ | 🟢 | Display desktop shortcuts (Open new window, Reload page) |
| ✅ | 🟢 | Display CLI shortcuts (Autocomplete, Clear screen, etc.) |
| ✅ | 🟢 | Display Workbench shortcuts (Run Commands, etc.) |
| 🔲 | 🟢 | Up arrow navigates command history in CLI |
| 🔲 | 🟢 | Shift+Space opens Non-Redis Editor |

### 12.8 Live Recommendations
| Status | Priority | Test Case |
|--------|----------|-----------|
| ✅ | 🟠 | View live recommendations in Insights panel |
| ✅ | 🟢 | Recommendations are database-specific (shown after analysis) |
| ✅ | 🟢 | View recommendation voting options |
| 🔲 | 🟢 | Vote recommendation as not useful |
| 🔲 | 🟢 | Hide recommendation |
| 🔲 | 🟢 | Snooze recommendation |
| 🔲 | 🟢 | Expand/collapse recommendation details |
| 🔲 | 🟢 | View recommendation labels (code changes, configuration changes) |
| 🔲 | 🟢 | Open tutorial from recommendation |
| 🔲 | 🟢 | Recommendations sync with Database Analysis recommendations |

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

