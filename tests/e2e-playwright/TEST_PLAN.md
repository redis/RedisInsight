# RedisInsight E2E Test Plan

This document outlines the comprehensive E2E testing strategy for RedisInsight features.

> **📋 Rules**: Before implementing tests, read [`.ai/rules/e2e-testing.md`](../../.ai/rules/e2e-testing.md) for coding standards, patterns, and best practices.

## Overview

The test plan is organized by feature area. Tests are grouped for parallel execution:
- **main** - Default group for all tests that can run in parallel
- Additional groups can be added for tests requiring special conditions (app reinstall, auto-update, etc.)

## Test Status Legend

- ✅ Implemented
- 🔲 Not implemented
- ⏳ In progress
- ⏸️ Skipped

---

## 0. Navigation & Global UI

### 0.1 Main Navigation
| Status | Group | Test Case |
|--------|-------|-----------|
| ✅ | main | Navigate to Settings page |
| ✅ | main | Navigate to home via Redis logo |
| ✅ | main | Show GitHub repo link |
| ✅ | main | Show Redis Cloud link |

### 0.2 Help Menu
| Status | Group | Test Case |
|--------|-------|-----------|
| ✅ | main | should open Help Center and display all menu options |
| ✅ | main | should have Release Notes link pointing to GitHub releases |
| ✅ | main | should have Provide Feedback link pointing to GitHub issues |

### 0.3 Notification Center
| Status | Group | Test Case |
|--------|-------|-----------|
| ✅ | main | should open Notification Center and display notifications |
| ✅ | main | should close Notification Center |
| ✅ | main | should display notification links that are clickable |
| ✅ | main | should show unread badge when there are unread notifications |

### 0.4 Copilot Panel
| Status | Group | Test Case |
|--------|-------|-----------|
| 🔲 | main | Open Copilot panel |
| 🔲 | main | Close Copilot panel |
| 🔲 | main | Open full screen mode |
| 🔲 | main | View sign-in options (Google, GitHub, SSO) |
| 🔲 | main | Accept terms checkbox |

### 0.5 Insights Panel ✅
| Status | Group | Test Case |
|--------|-------|-----------|
| ✅ | main | Open Insights panel |
| ✅ | main | Close Insights panel |
| ✅ | main | Switch to Tutorials tab |
| ✅ | main | Switch to Tips tab |
| ✅ | main | Expand/collapse tutorial folders |
| ✅ | main | View Tutorials section |
| ✅ | main | Run through a tutorial with pagination |
| ✅ | main | Run a tutorial command |
| 🔲 | main | Upload custom tutorial |
| 🔲 | main | Delete custom tutorial |
| 🔲 | main | View Tips when no recommendations |
| 🔲 | main | Vote on a tip (like/dislike) |
| 🔲 | main | Show/hide hidden tips |
| 🔲 | main | Navigate to database analysis from Tips |

---

## 1. Database Management

### 1.1 Add Database
| Status | Group | Test Case |
|--------|-------|-----------|
| ✅ | main | should add standalone database |
| ✅ | main | should add database with no auth |
| ✅ | main | should add database with username only |
| ✅ | main | should add database with username and password |
| ✅ | main | should add cluster database |
| ✅ | main | should add database with TLS/SSL |
| ✅ | main | should validate required fields |
| ✅ | main | should test connection before saving |
| ✅ | main | should cancel add database |
| ✅ | main | should add database via Connection URL |
| ✅ | main | should open Connection settings from URL form |
| ✅ | main | should configure timeout setting |
| ✅ | main | should select logical database |
| ✅ | main | should display logical database index in database list |
| ✅ | main | should display logical database index in database header |
| ✅ | main | should display logical database index in edit form |
| ✅ | main | should enable force standalone connection |
| ✅ | main | should enable automatic data decompression |
| ✅ | main | should configure key name format |

### 1.1.1 Connection Security
| Status | Group | Test Case |
|--------|-------|-----------|
| 🔲 | main | Add database using SSH tunneling |
| 🔲 | main | Connect using SNI configuration |
| 🔲 | main | Connect with TLS using CA, client, and private key certificates |

### 1.1.2 Add Database (Advanced)
| Status | Group | Test Case |
|--------|-------|-----------|
| 🔲 | main | should add database with SSH tunnel |
| 🔲 | main | should add database via Redis Sentinel option |
| 🔲 | main | should add database via Redis Software option |
| 🔲 | main | should auto-discover databases from Redis Software |
| 🔲 | main | should auto-discover Redis Cloud databases after signing in |
| 🔲 | main | should add databases using Cloud API keys |

### 1.2 Database List
| Status | Group | Test Case |
|--------|-------|-----------|
| ✅ | main | Filter databases by search query |
| ✅ | main | Filter with partial match |
| ✅ | main | Case-insensitive search |
| ✅ | main | Filter by host:port |
| ✅ | main | Clear search |
| ✅ | main | No results message |
| ✅ | main | Show columns button |
| ✅ | main | Hide/show columns |
| ✅ | main | Select single database |
| ✅ | main | Select multiple databases |
| ✅ | main | Select all databases |
| ✅ | main | Delete multiple databases |
| ✅ | main | Edit database connection |
| ✅ | main | Clone database connection |
| ✅ | main | Connect to database |
| 🔲 | main | Database connection status indicator |
| ✅ | main | Search by database name |
| ✅ | main | Search by host |
| ✅ | main | Search by port |
| 🔲 | main | Search by connection type (OSS Cluster, Sentinel) |
| 🔲 | main | Search by last connection time |
| ✅ | main | Verify Redis Stack icon displayed for databases with modules |

### 1.3 Clone Database
| Status | Group | Test Case |
|--------|-------|-----------|
| ✅ | main | Clone standalone database with pre-populated form |
| ✅ | main | Clone database with same name |
| ✅ | main | Clone database with new name |
| ✅ | main | Cancel clone operation |
| ✅ | main | Go back to edit dialog from clone dialog |
| ✅ | main | Clone OSS Cluster database |
| 🔲 | main | Clone Sentinel database |
| ✅ | main | Verify "New Connection" badge on cloned database |
| ✅ | main | Verify cloned database appears in list after creation |

### 1.4 Pagination (when > 15 databases)
| Status | Group | Test Case |
|--------|-------|-----------|
| 🔲 | main | Show pagination when > 15 databases |
| 🔲 | main | Navigate to next page |
| 🔲 | main | Navigate to previous page |
| 🔲 | main | Navigate to first/last page |
| 🔲 | main | Change items per page (10, 25, 50, 100) |
| 🔲 | main | Select page from dropdown |
| 🔲 | main | Show correct row count "Showing X out of Y rows" |
| 🔲 | main | Pagination buttons disabled state (first/previous on page 1) |

### 1.5 Import/Export
| Status | Group | Test Case |
|--------|-------|-----------|
| 🔲 | main | Open import dialog |
| 🔲 | main | Import single database |
| 🔲 | main | Import multiple databases |
| 🔲 | main | Show success count after import |
| 🔲 | main | Cancel import dialog |
| 🔲 | main | Export databases |
| 🔲 | main | Import with errors (partial success) |
| 🔲 | main | Import invalid file format |
| 🔲 | main | Confirm database tags are exported/imported correctly |
| 🔲 | main | Confirm import summary distinguishes Fully/Partially Imported and Failed |

### 1.6 Database Tags
| Status | Group | Test Case |
|--------|-------|-----------|
| ✅ | main | should open tags dialog for a database |
| ✅ | main | should add descriptive tags to a database |
| ✅ | main | should remove tags from a database |
| ✅ | main | should cancel adding a tag without saving |
| ✅ | main | should persist tags after saving and reopening |
| 🔲 | main | Import tags automatically from Redis Cloud databases |

### 1.7 Certificate and Encryption Handling
| Status | Group | Test Case |
|--------|-------|-----------|
| 🔲 | main | Store credentials encrypted in local keychain when encryption enabled |
| 🔲 | main | Display warning when encryption disabled and credentials stored as plaintext |

### 1.8 Decompression
| Status | Group | Test Case |
|--------|-------|-----------|
| 🔲 | main | Confirm setting a decompression type works |

---

## 2. Browser Page

### 2.1 Key List View
| Status | Group | Test Case |
|--------|-------|-----------|
| 🔲 | main | View key list |
| 🔲 | main | Search/filter keys by pattern |
| 🔲 | main | Filter by key type |
| 🔲 | main | Filter keys by exact name |
| 🔲 | main | Clear search filter |
| 🔲 | main | Click on key to view details |
| 🔲 | main | Refresh key list |
| 🔲 | main | Show no results message for non-matching pattern |
| 🔲 | main | Delete key |
| 🔲 | main | Delete multiple keys (bulk) |
| 🔲 | main | Search by Values of Keys |
| 🔲 | main | Configure columns visibility |
| 🔲 | main | Configure auto-refresh |
| 🔲 | main | View database stats (CPU, Keys, Memory, Clients) |

### 2.2 Key Tree View
| Status | Group | Test Case |
|--------|-------|-----------|
| 🔲 | main | Switch to tree view |
| 🔲 | main | Expand/collapse tree nodes |
| 🔲 | main | Configure delimiter |
| 🔲 | main | Sort tree nodes |
| 🔲 | main | View folder percentage and count |
| 🔲 | main | Scan more keys (covered by "should show scan more button when searching" test) |
| 🔲 | main | Open tree view settings |
| 🔲 | main | Tree view mode state persists after page refresh |
| 🔲 | main | Filter state preserved when switching between Browser and Tree view |
| 🔲 | main | Key type filter state preserved when switching views |
| 🔲 | main | Configure multiple delimiters in tree view |
| 🔲 | main | Cancel delimiter change reverts to previous value |
| 🔲 | main | Verify namespace tooltip shows key pattern and delimiter |
| 🔲 | main | Scan DB by 10K keys in tree view |

### 2.3 Add Keys
| Status | Group | Test Case |
|--------|-------|-----------|
| ✅ | main | Add String key |
| ✅ | main | Add Hash key |
| ✅ | main | Add List key |
| ✅ | main | Add Set key |
| ✅ | main | Add Sorted Set (ZSet) key |
| ✅ | main | Add Stream key |
| ✅ | main | Add JSON key |
| ✅ | main | Add key with TTL |
| ✅ | main | Validate key name (required) |
| ✅ | main | Cancel add key dialog |

### 2.4 Key Details - String
| Status | Group | Test Case |
|--------|-------|-----------|
| 🔲 | main | View string value |
| 🔲 | main | Edit string value |
| 🔲 | main | View/edit TTL |
| 🔲 | main | Copy key name (covered by "should show copy key name button on hover" test) |
| 🔲 | main | Change value format (text/binary/hex) |
| 🔲 | main | Rename key and confirm new name propagates across Browser |
| 🔲 | main | Confirm TTL countdown updates in real time |

### 2.5 Key Details - Hash
| Status | Group | Test Case |
|--------|-------|-----------|
| 🔲 | main | View hash fields |
| 🔲 | main | Add hash field |
| 🔲 | main | Edit hash field |
| 🔲 | main | Delete hash field |
| 🔲 | main | Search hash fields |
| 🔲 | main | Pagination (N/A - hash fields use virtual scrolling, not pagination) |

### 2.6 Key Details - List
| Status | Group | Test Case |
|--------|-------|-----------|
| 🔲 | main | View list elements |
| 🔲 | main | Add element (LPUSH/RPUSH) |
| 🔲 | main | Edit list element |
| 🔲 | main | Remove element |
| 🔲 | main | Search by index |

### 2.7 Key Details - Set
| Status | Group | Test Case |
|--------|-------|-----------|
| 🔲 | main | View set members |
| 🔲 | main | Add member |
| 🔲 | main | Remove member |
| 🔲 | main | Search members |

### 2.8 Key Details - Sorted Set
| Status | Group | Test Case |
|--------|-------|-----------|
| 🔲 | main | View sorted set members |
| 🔲 | main | Add member with score |
| 🔲 | main | Edit member score |
| 🔲 | main | Remove member |
| 🔲 | main | Search members |
| 🔲 | main | Sort by score/member |

### 2.9 Key Details - Stream
| Status | Group | Test Case |
|--------|-------|-----------|
| 🔲 | main | View stream entries |
| 🔲 | main | Add stream entry |
| 🔲 | main | Remove stream entry |
| 🔲 | main | View consumer groups (covered by "should show no consumer groups message" test) |
| 🔲 | main | Add consumer group |
| 🔲 | main | View consumers (N/A - requires active consumers which need external client) |

### 2.9.1 Stream Consumer Groups
| Status | Group | Test Case |
|--------|-------|-----------|
| 🔲 | main | Create consumer group with Entry ID "0" (from beginning) |
| 🔲 | main | Create consumer group with Entry ID "$" (new messages only) |
| 🔲 | main | Create consumer group with custom Entry ID |
| 🔲 | main | View consumer group columns (Group Name, Consumers, Pending, Last Delivered ID) - covered by "should open Consumer Groups tab" test |
| 🔲 | main | View consumer information columns (Consumer Name, Pending, Idle Time) |
| 🔲 | main | Delete consumer from consumer group |
| 🔲 | main | Delete consumer group |
| 🔲 | main | Edit Last Delivered ID for consumer group |
| 🔲 | main | Cancel creating consumer group |

### 2.9.2 Stream Pending Messages
| Status | Group | Test Case |
|--------|-------|-----------|
| 🔲 | main | View pending messages for consumer |
| 🔲 | main | Acknowledge pending message |
| 🔲 | main | Claim pending message |
| 🔲 | main | Claim pending message with idle time parameter |
| 🔲 | main | Force claim pending message |

### 2.10 Key Details - JSON
| Status | Group | Test Case |
|--------|-------|-----------|
| 🔲 | main | View JSON value |
| 🔲 | main | Edit JSON value |
| 🔲 | main | Add JSON path (covered by "should add JSON field" test) |
| 🔲 | main | Delete JSON path (covered by "should remove JSON field" test) |
| 🔲 | main | Expand/collapse JSON tree (N/A - JSON tree view not available in current UI) |

### 2.11 Bulk Actions
| Status | Group | Test Case |
|--------|-------|-----------|
| 🔲 | main | Open Bulk Actions panel |
| 🔲 | main | Show Delete Keys tab by default |
| 🔲 | main | Switch to Upload Data tab |
| 🔲 | main | Close Bulk Actions panel |
| 🔲 | main | Show message when no pattern set |
| 🔲 | main | Filter by pattern for deletion |
| 🔲 | main | Show file upload area |
| 🔲 | main | Bulk delete keys |
| 🔲 | main | Bulk delete with pattern |
| 🔲 | main | Bulk upload data |
| 🔲 | main | View bulk action progress (expected key count before deletion) |
| 🔲 | main | Confirm summary screen displays processed, deleted, failed counts |
| 🔲 | main | Confirm deletion failures surfaced in summary log |
| 🔲 | main | Confirm performance when deleting thousands of keys |
| 🔲 | main | Confirm performance when bulk uploading large datasets (>10K keys) |

### 2.12 Value Formatters
| Status | Group | Test Case |
|--------|-------|-----------|
| 🔲 | main | Display format dropdown |
| 🔲 | main | Switch to ASCII format |
| 🔲 | main | Switch to HEX format |
| 🔲 | main | Switch to Binary format |
| 🔲 | main | Switch to JSON format |
| 🔲 | main | Show all format options in dropdown |
| 🔲 | main | View value in Msgpack format |
| 🔲 | main | View value in Protobuf format |
| 🔲 | main | View value in Java serialized format |
| 🔲 | main | View value in PHP serialized format |
| 🔲 | main | View value in Pickle format |
| 🔲 | main | View value in DateTime/timestamp format |
| 🔲 | main | Confirm conversion between formats is smooth |
| 🔲 | main | Confirm non-editable formats disable inline editing |
| 🔲 | main | Confirm tooltip explains conversion errors |
| 🔲 | main | Confirm switching formats for large keys (>10MB) doesn't freeze UI |
| 🔲 | main | Edit value in JSON format and save |
| 🔲 | main | Edit value in PHP serialized format and save |
| 🔲 | main | Verify bigInt values display correctly |

### 2.13 Search Keys (Search Index)
| Status | Group | Test Case |
|--------|-------|-----------|
| 🔲 | main | Create a new search index from index creation form |
| 🔲 | main | Select existing index and search by indexed fields |
| 🔲 | main | Perform search by full key name with exact match |
| 🔲 | main | Create index with FT.CREATE command with multiple prefixes |
| 🔲 | main | Switch between RediSearch mode and pattern mode |
| 🔲 | main | View tooltip explaining RediSearch mode |
| 🔲 | main | Search by index in Browser view |
| 🔲 | main | Search by index in Tree view |
| 🔲 | main | View filter history for RediSearch queries |
| 🔲 | main | Verify context persistence for RediSearch across navigation |
| 🔲 | main | Display "No Redis Query Engine" message when module not available |
| 🔲 | main | Delete search index with FT.DROPINDEX |

### 2.14 Key Filtering Patterns
| Status | Group | Test Case |
|--------|-------|-----------|
| ✅ | main | Filter keys with asterisk (*) wildcard |
| ✅ | main | Filter keys with question mark (?) single character wildcard |
| ✅ | main | Filter keys with [xy] character class (matches x or y) |
| ✅ | main | Filter keys with [^x] negated character class |
| ✅ | main | Filter keys with [a-z] character range |
| ✅ | main | Escape special characters in filter pattern |
| ✅ | main | Clear filter and search again |
| 🔲 | main | Filter exact key name in large database (10M+ keys) |
| 🔲 | main | Filter by pattern in large database (10M+ keys) |
| 🔲 | main | Filter by key type in large database |

### 2.15 Browser Context
| Status | Group | Test Case |
|--------|-------|-----------|
| 🔲 | main | Browser context preserved when switching tabs |
| 🔲 | main | Selected key details preserved when switching tabs |
| 🔲 | main | Context cleared when page is reloaded |
| 🔲 | main | CLI command history preserved in context |
| 🔲 | main | Context cleared when navigating to different database |

---

## 3. Workbench

### 3.1 Command Execution
| Status | Group | Test Case |
|--------|-------|-----------|
| 🔲 | main | Execute single Redis command |
| 🔲 | main | Execute multiple commands |
| 🔲 | main | View command result |
| 🔲 | main | Command autocomplete |
| 🔲 | main | Command syntax highlighting |
| 🔲 | main | Handle command error |
| 🔲 | main | Clear editor |
| 🔲 | main | History navigation |
| 🔲 | main | Toggle Raw mode |
| 🔲 | main | Toggle Group results |
| 🔲 | main | Confirm command history persists after page refresh or session restart |
| 🔲 | main | Re-run a previous command from history |
| 🔲 | main | Run commands with quantifier (e.g., "10 RANDOMKEY") |
| 🔲 | main | View group summary (X Command(s) - Y success, Z error(s)) |
| 🔲 | main | View full list of commands with results in group mode |
| 🔲 | main | Copy all commands from group result |
| 🔲 | main | View group results in full screen mode |
| 🔲 | main | Original datetime preserved in history after page refresh |
| 🔲 | main | Display message when result exceeds 1MB after refresh |
| 🔲 | main | History limited to 30 commands (oldest replaced by newest) |
| 🔲 | main | Quick-access to command history with Up Arrow |
| 🔲 | main | Use Non-Redis Editor with Shift+Space |

### 3.1.1 Workbench Context
| Status | Group | Test Case |
|--------|-------|-----------|
| 🔲 | main | Editor content preserved when switching tabs |
| 🔲 | main | Command results preserved when switching tabs |
| 🔲 | main | Context cleared when page is reloaded |
| 🔲 | main | Insights panel state preserved when navigating |

### 3.2 Results View
| Status | Group | Test Case |
|--------|-------|-----------|
| 🔲 | main | View text result |
| 🔲 | main | View table result |
| 🔲 | main | View JSON result |
| 🔲 | main | Copy result |
| 🔲 | main | Expand/collapse results |
| 🔲 | main | Clear results |
| 🔲 | main | Re-run command |
| 🔲 | main | Delete command result |

### 3.2.1 Plugin and Visualization Support
| Status | Group | Test Case |
|--------|-------|-----------|
| 🔲 | main | Confirm plugins for Search, TimeSeries load correctly |
| 🔲 | main | Run FT.SEARCH command and confirm visualized table output |
| 🔲 | main | Run TS.RANGE command and confirm chart visualization |
| 🔲 | main | Confirm plugins display module-specific icons and metadata |
| 🔲 | main | Switch between views (Table ↔ Text) and confirm format updates instantly |
| 🔲 | main | Confirm TimeSeries visualization displays correct axes, values, and units |

### 3.3 Tutorials
| Status | Group | Test Case |
|--------|-------|-----------|
| 🔲 | main | Open Intro to search tutorial |
| 🔲 | main | Open Basic use cases tutorial |
| 🔲 | main | Open Intro to vector search tutorial |
| 🔲 | main | Click Explore button |
| 🔲 | main | Close insights panel |

### 3.4 Profiler (Bottom Panel)
| Status | Group | Test Case |
|--------|-------|-----------|
| 🔲 | main | Start profiler |
| 🔲 | main | Stop profiler |
| 🔲 | main | Toggle Save Log |
| 🔲 | main | View profiler warning |
| 🔲 | main | Hide/close profiler panel |
| 🔲 | main | Reset profiler |
| 🔲 | main | Open profiler panel |

### 3.5 Command Helper (Bottom Panel)
| Status | Group | Test Case |
|--------|-------|-----------|
| ✅ | main | Open Command Helper panel |
| ✅ | main | Search for a command |
| ✅ | main | Filter commands by category |
| ✅ | main | View command details |
| ✅ | main | Hide/close Command Helper panel |

---

## 4. CLI

### 4.1 CLI Panel
| Status | Group | Test Case |
|--------|-------|-----------|
| ✅ | main | Open CLI panel |
| ✅ | main | Execute command |
| ✅ | main | View command output |
| ✅ | main | Close CLI panel |
| ✅ | main | Hide CLI panel |
| ✅ | main | Handle command errors |
| ✅ | main | Execute multiple commands in sequence |
| ✅ | main | Command history (up/down arrows) |
| ✅ | main | Tab completion |

### 4.2 Command Helper Integration
| Status | Group | Test Case |
|--------|-------|-----------|
| 🔲 | main | Type command in CLI; confirm Command Helper updates dynamically |
| 🔲 | main | Filter helper results by command category (Keys, Strings, JSON, Search) |
| 🔲 | main | Open "Read more" link and confirm redirection to Redis.io documentation |
| 🔲 | main | Confirm helper displays module-specific commands (FT., JSON., TS.*) |

---

## 5. Pub/Sub

### 5.1 Subscribe
| Status | Group | Test Case |
|--------|-------|-----------|
| 🔲 | main | Subscribe to channel |
| 🔲 | main | Subscribe with pattern |
| 🔲 | main | Receive messages |
| 🔲 | main | Unsubscribe |
| 🔲 | main | Multiple subscriptions | Feature not available - single pattern subscription only |
| 🔲 | main | Clear messages | <!-- Feature not implemented in UI yet -->
| 🔲 | main | Confirm newest messages appear at top of message table |
| 🔲 | main | Confirm connection/subscription persist while navigating in same DB context |
| 🔲 | main | Confirm performance under high throughput (≥5,000 messages/minute) |

### 5.2 Publish
| Status | Group | Test Case |
|--------|-------|-----------|
| 🔲 | main | Publish message to channel (form fill) |
| 🔲 | main | Publish with different formats | Feature not available - plain text only |
| 🔲 | main | Confirm published message appears instantly in message feed | _Covered by "should receive published message" test_ |
| 🔲 | main | Confirm publish button shows status report with affected clients count |

### 5.3 Message Table View
| Status | Group | Test Case |
|--------|-------|-----------|
| 🔲 | main | View message table with subscribed messages |
| 🔲 | main | Navigate message table pages |
| 🔲 | main | Sort message table by columns |
| 🔲 | main | Confirm table configuration persists across navigation |
| 🔲 | main | Confirm message table with multiple messages |
| 🔲 | main | Confirm status bar shows proper subscription status |
| 🔲 | main | Confirm message count displays in status bar |

### 5.4 Cluster Mode (Pub/Sub)
| Status | Group | Test Case |
|--------|-------|-----------|
| 🔲 | main | Confirm info message about SPUBLISH on welcome screen |
| 🔲 | main | Confirm status report doesn't show affected clients in cluster mode |
| 🔲 | main | SPUBLISH messages visibility | _Note: Use SSUBSCRIBE in Workbench_ |

---

## 6. Analytics

### 6.1 Slow Log
| Status | Group | Test Case |
|--------|-------|-----------|
| 🔲 | main | View slow log entries |
| 🔲 | main | Refresh slow log |
| 🔲 | main | Clear slow log button visible |
| 🔲 | main | Configure slow log button visible |
| 🔲 | main | Sort entries |
| 🔲 | main | Filter entries | _Skipped: No filter UI available in current version_ |
| 🔲 | main | Confirm slowlog-max-len and slowlog-log-slower-than configuration values display |
| 🔲 | main | View command timestamp, duration, and execution details |
| 🔲 | main | Change duration units between milliseconds and microseconds | _Skipped: No UI to change display units - duration always shown in msec_ |
| 🔲 | main | Adjust slowlog-log-slower-than threshold and confirm results update |
| 🔲 | main | Confirm empty state message displays correctly |
| 🔲 | main | Confirm performance with thousands of slowlog entries |

### 6.2 Database Analysis
| Status | Group | Test Case |
|--------|-------|-----------|
| ✅ | main | Run database analysis |
| ✅ | main | View analysis results |
| ✅ | main | View top keys table |
| ✅ | main | View top namespaces |
| ✅ | main | View TTL distribution |
| ✅ | main | View recommendations (Tips tab) |
| ✅ | main | History of analyses |
| ✅ | main | Confirm charts for data types, namespaces, expirations render |
| ✅ | main | Confirm extrapolation toggle adjusts charted values | Uses pre-seeded big database (port 8103) for partial scan |
| ✅ | main | Confirm analysis distinguishes between scanned and estimated data |
| ✅ | main | Confirm responsiveness on large datasets |
| ✅ | main | Sort namespaces by key pattern |
| ✅ | main | Sort namespaces by memory |
| ✅ | main | Sort namespaces by number of keys |
| ✅ | main | Filter namespace to Browser view |
| 🔲 | main | Display "No namespaces" message with Tree View link |
| ✅ | main | Toggle "No Expiry" in TTL distribution graph |
| ✅ | main | View analysis history (up to 5 reports) |
| ✅ | main | View voting section for recommendations |
| 🔲 | main | Vote recommendation as useful | Voting buttons disabled - requires telemetry enabled |
| 🔲 | main | Vote recommendation as not useful | Voting buttons disabled - requires telemetry enabled |
| ✅ | main | Expand/collapse recommendation details |
| ✅ | main | View recommendation labels (code changes, configuration changes) |
| ✅ | main | Open tutorial from recommendation |

### 6.2.1 Profiler
| Status | Group | Test Case |
|--------|-------|-----------|
| 🔲 | main | Start profiler |
| 🔲 | main | Stop profiler |
| 🔲 | main | Toggle Save Log |
| 🔲 | main | View profiler warning |
| 🔲 | main | Observe live command feed without delay |
| 🔲 | main | Toggle "Save Logs" and confirm local temp log file creation |
| 🔲 | main | Test profiler behavior under heavy load (thousands of commands/minute) |

### 6.3 Cluster Details
> ⚠️ Requires properly configured OSS Cluster infrastructure (multiple nodes)

| Status | Group | Test Case |
|--------|-------|-----------|
| 🔲 | main | View cluster nodes |
| 🔲 | main | View node details |
| 🔲 | main | View slot distribution |
| 🔲 | main | Refresh cluster info |
| 🔲 | main | View Overview tab by default for OSS Cluster |
| 🔲 | main | View cluster header info (Type, Version, User) |
| 🔲 | main | View cluster uptime |
| 🔲 | main | View primary node statistics table |
| 🔲 | main | View columns (Commands/s, Clients, Total Keys, Network Input/Output, Total Memory) |
| 🔲 | main | Verify dynamic values update in statistics table |

---

## 7. Settings

### 7.1 General Settings
| Status | Group | Test Case |
|--------|-------|-----------|
| ✅ | main | View settings page |
| ✅ | main | Show theme dropdown |
| ✅ | main | Toggle show notifications |
| ✅ | main | Show date/time format options |
| ✅ | main | Change date/time format (custom) |
| ✅ | main | Show time zone dropdown |

### 7.2 Privacy Settings
| Status | Group | Test Case |
|--------|-------|-----------|
| 🔲 | main | View privacy settings |
| 🔲 | main | Show usage data switch |
| 🔲 | main | Show privacy policy link |

### 7.3 Workbench Settings
| Status | Group | Test Case |
|--------|-------|-----------|
| 🔲 | main | Show editor cleanup switch |
| 🔲 | main | Show pipeline commands setting |
| 🔲 | main | Configure command timeout (N/A - per-database setting, not in settings page) |

### 7.4 Redis Cloud Settings
| Status | Group | Test Case |
|--------|-------|-----------|
| 🔲 | main | View Redis Cloud settings |
| 🔲 | main | Configure cloud account |

### 7.5 Advanced Settings
| Status | Group | Test Case |
|--------|-------|-----------|
| 🔲 | main | Show keys to scan setting |
| 🔲 | main | Show advanced settings warning |

---

## 8. Vector Search

### 8.1 Index Management
| Status | Group | Test Case |
|--------|-------|-----------|
| 🔲 | main | View indexes |
| 🔲 | main | Create index |
| 🔲 | main | Delete index |
| 🔲 | main | View index info |

### 8.2 Query
| Status | Group | Test Case |
|--------|-------|-----------|
| 🔲 | main | Execute vector search query |
| 🔲 | main | View search results |
| 🔲 | main | Save query |
| 🔲 | main | Load saved query |

---

## 9. Redis Cloud Integration

> ⚠️ Requires Redis Cloud account credentials.

### 9.1 Auto-Discovery
| Status | Group | Test Case |
|--------|-------|-----------|
| 🔲 | main | Connect to Redis Cloud account |
| 🔲 | main | View subscriptions |
| 🔲 | main | View databases |
| 🔲 | main | Add cloud database to list |

---

## 10. Sentinel

> ⚠️ Sentinel tests require external dependencies (requires Sentinel infrastructure).
> These tests should be run in environments with Sentinel setup available.

### 10.1 Sentinel Discovery
| Status | Group | Test Case |
|--------|-------|-----------|
| 🔲 | main | Connect to Sentinel |
| 🔲 | main | Discover databases |
| 🔲 | main | Add discovered database |

---

## 11. RDI - Redis Data Integration

> ⚠️ RDI require external dependencies (requires RDI backend services).
> These tests should be run in environments with RDI infrastructure available.

### 11.1 RDI Instance Management
| Status | Group | Test Case |
|--------|-------|-----------|
| 🔲 | main | Add RDI instance |
| 🔲 | main | Connect to RDI instance |
| 🔲 | main | View RDI instance list |
| 🔲 | main | Edit RDI instance |
| 🔲 | main | Delete RDI instance |
| 🔲 | main | Test RDI connection |
| 🔲 | main | Error message displayed for invalid/non-existent RDI instance |

### 11.2 RDI Pipeline
| Status | Group | Test Case |
|--------|-------|-----------|
| 🔲 | main | View pipeline status |
| 🔲 | main | Start pipeline |
| 🔲 | main | Stop pipeline |
| 🔲 | main | Reset pipeline |
| 🔲 | main | View pipeline statistics |
| 🔲 | main | Popover displayed for Reset button |
| 🔲 | main | Popover displayed for Stop button |
| 🔲 | main | Deploy successfully deploys configuration with success notification |
| 🔲 | main | Pipeline state: Not running / Streaming |
| 🔲 | main | Show loading indicators when waiting for action |

### 11.3 RDI Jobs
| Status | Group | Test Case |
|--------|-------|-----------|
| 🔲 | main | View jobs list |
| 🔲 | main | Deploy job |
| 🔲 | main | Edit job configuration |
| 🔲 | main | Delete job |
| 🔲 | main | Dry run job |
| 🔲 | main | Add job via side menu |
| 🔲 | main | Delete job via side menu |
| 🔲 | main | Job shows unsaved changes indicator (blue) |
| 🔲 | main | Job shows error indicator (red icon with hover details) |

### 11.4 RDI Configuration
| Status | Group | Test Case |
|--------|-------|-----------|
| 🔲 | main | View configuration |
| 🔲 | main | Edit configuration |
| 🔲 | main | Deploy configuration |
| 🔲 | main | Download template |
| 🔲 | main | Configuration shows unsaved changes indicator |
| 🔲 | main | Configuration shows error indicator with hover details |
| 🔲 | main | Insert template button opens menu |
| 🔲 | main | Apply template only works on empty editor |

### 11.5 RDI Control Menu
| Status | Group | Test Case |
|--------|-------|-----------|
| 🔲 | main | Download deployed pipeline action |
| 🔲 | main | Import pipeline from ZIP file |
| 🔲 | main | Upload from file allows only ZIP files |
| 🔲 | main | Save to file (ZIP) successfully |

### 11.6 RDI Analytics
| Status | Group | Test Case |
|--------|-------|-----------|
| 🔲 | main | Auto-refresh opens configuration panel |
| 🔲 | main | Auto-refresh can be disabled |
| 🔲 | main | Display data based on pipeline metrics |
| 🔲 | main | Test connection opens panel with results |
| 🔲 | main | Test connection displays all targets and sources |

---

## 12. Miscellaneous

### 12.1 Notifications
| Status | Group | Test Case |
|--------|-------|-----------|
| 🔲 | main | Confirm unread notifications display with distinct highlight/badge |
| 🔲 | main | Confirm notification badge count updates when new messages arrive |
| 🔲 | main | Confirm each notification displays title, description, and timestamp |

### 12.2 Telemetry & Analytics
| Status | Group | Test Case |
|--------|-------|-----------|
| 🔲 | main | Trigger key events and confirm telemetry records correctly |
| 🔲 | main | Confirm telemetry payloads contain Database ID, Timestamp, Event Type |
| 🔲 | main | Confirm telemetry events appear in analytics console/local logs |
| 🔲 | main | Disable telemetry in Settings and confirm no new events logged |

### 12.3 EULA & Privacy Settings

> **Special Test Requirements:**
> - EULA tests require fresh app state (no agreements stored)
> - EULA popup blocks all UI interactions until accepted
> - **Must run in isolation** - before other tests or in separate test run
> - UI shows popup when: `config.agreements = null` OR consent key missing OR `spec.since > applied.version`
> - **Reset via API:** `DELETE /api/settings/agreements` - resets agreements to null, triggering EULA popup on next page load
> - **Auto-accept via env:** `RI_ACCEPT_TERMS_AND_CONDITIONS=true` - bypasses EULA popup entirely
> - **Test file:** `tests/settings/eula/eula.spec.ts`

| Status | Group | Test Case |
|--------|-------|-----------|
| 🔲 | main | First launch shows EULA & Privacy Agreement dialog |
| 🔲 | main | Submit button disabled until EULA checkbox checked |
| 🔲 | main | "Use recommended settings" toggle auto-selects telemetry and encryption |
| 🔲 | main | Encryption checkbox enabled by default |
| 🔲 | main | Analytics checkbox respects "Use recommended settings" toggle |
| 🔲 | main | Notifications checkbox available |
| 🔲 | main | EULA link opens Redis license page |
| 🔲 | main | Privacy policy link works |
| 🔲 | main | Accepting EULA stores agreement version in database |
| 🔲 | main | Version bump shows EULA popup again |
| 🔲 | main | Decline analytics confirms telemetry events not sent |

### 12.4 Onboarding Tour

| Status | Group | Test Case |
|--------|-------|-----------|
| 🔲 | main | Onboarding starts after EULA acceptance (first database connection) |
| 🔲 | main | Reset onboarding from Help Menu |
| 🔲 | main | Onboarding step: Browser |
| 🔲 | main | Onboarding step: Tree view |
| 🔲 | main | Onboarding step: Filter and search |
| 🔲 | main | Onboarding step: CLI (panel opens) |
| 🔲 | main | Onboarding step: Command Helper (panel opens) |
| 🔲 | main | Onboarding step: Profiler (panel opens) |
| 🔲 | main | Onboarding step: Try Workbench (shows CLIENT LIST or FT.INFO) |
| 🔲 | main | Onboarding step: Explore and learn more |
| 🔲 | main | Onboarding step: Upload your tutorials |
| 🔲 | main | Onboarding step: Database Analysis |
| 🔲 | main | Onboarding step: Slow Log |
| 🔲 | main | Onboarding step: Pub/Sub |
| 🔲 | main | Onboarding step: Great job! (final step) |
| 🔲 | main | Skip tour button completes onboarding |
| 🔲 | main | Back button navigates to previous step |
| 🔲 | main | Next button advances to next step |
| 🔲 | main | Onboarding state persists after page refresh |
| 🔲 | main | Final step closes when navigating to another page |

### 12.5 Redis Cloud Conversion Funnel
| Status | Group | Test Case |
|--------|-------|-----------|
| 🔲 | main | User signs up with Google/GitHub → account, subscription, DB created → redirected to RI |
| 🔲 | main | Existing Redis Cloud user without DB → free DB created → connection prompt |
| 🔲 | main | All CTAs to Redis Cloud complete successfully (including tutorials) |
| 🔲 | main | All CTAs pass UTM parameters correctly to Redis Cloud |
| 🔲 | main | Telemetry events for conversion funnel are successful |

### 12.6 App Settings
| Status | Group | Test Case |
|--------|-------|-----------|
| 🔲 | main | Open Settings and update general preferences (theme, notifications) |
| 🔲 | main | Confirm edits apply immediately across UI |

### 12.7 Deep Linking (URL Handling)
| Status | Group | Test Case |
|--------|-------|-----------|
| 🔲 | main | Add database via redisinsight://databases/connect?redisUrl=... |
| 🔲 | main | Auto-connect to database with redirect to workbench |
| 🔲 | main | Open specific tutorial via tutorial parameter |
| 🔲 | main | Cloud parameters (cloudBdbId, subscriptionType, planMemoryLimit, memoryLimitMeasurementUnit) |
| 🔲 | main | Onboarding parameter opens onboarding flow |
| 🔲 | main | Copilot parameter opens AI assistant |
| 🔲 | main | Invalid URL shows error message |
| 🔲 | main | URL with missing required parameters shows validation error |

### 12.8 Keyboard Shortcuts
| Status | Group | Test Case |
|--------|-------|-----------|
| 🔲 | main | Open keyboard shortcuts panel from Help Center |
| 🔲 | main | View Desktop application shortcuts section |
| 🔲 | main | View CLI shortcuts section |
| 🔲 | main | View Workbench shortcuts section |
| 🔲 | main | Close shortcuts panel |
| 🔲 | main | Display desktop shortcuts (Open new window, Reload page) |
| 🔲 | main | Display CLI shortcuts (Autocomplete, Clear screen, etc.) |
| 🔲 | main | Display Workbench shortcuts (Run Commands, etc.) |
| 🔲 | main | Up arrow navigates command history in CLI |
| 🔲 | main | Shift+Space opens Non-Redis Editor |

### 12.9 Live Recommendations
| Status | Group | Test Case |
|--------|-------|-----------|
| 🔲 | main | View live recommendations in Insights panel |
| 🔲 | main | Recommendations are database-specific (shown after analysis) |
| 🔲 | main | View recommendation voting options |
| 🔲 | main | Vote recommendation as not useful | Voting buttons disabled - requires telemetry enabled |
| 🔲 | main | Hide recommendation | Hide/snooze only in Database Analysis Tips tab |
| 🔲 | main | Snooze recommendation | Hide/snooze only in Database Analysis Tips tab |
| 🔲 | main | Expand/collapse recommendation details |
| 🔲 | main | View recommendation labels (code changes, configuration changes) |
| 🔲 | main | Open tutorial from recommendation |
| 🔲 | main | Recommendations sync with Database Analysis recommendations |

### 12.10 Custom Tutorials (Upload/Import)
| Status | Group | Test Case |
|--------|-------|-----------|
| 🔲 | main | View "My Tutorials" section in Enablement area |
| 🔲 | main | Upload custom tutorial from local ZIP file |
| 🔲 | main | Upload custom tutorial via URL |
| 🔲 | main | Upload tutorial with manifest.json (structured hierarchy) |
| 🔲 | main | Upload tutorial without manifest.json (flat hierarchy) |
| 🔲 | main | Delete custom tutorial |
| 🔲 | main | View images in custom tutorials (external path) |
| 🔲 | main | Bulk upload data from custom tutorial (relative path) |
| 🔲 | main | Bulk upload data from custom tutorial (absolute path) |
| 🔲 | main | Verify bulk upload summary (processed, success, errors) |
| 🔲 | main | Open tutorial from links in other tutorials |
| 🔲 | main | Cross-reference tutorials using redisinsight:// syntax |
| 🔲 | main | Download tutorial data file |
| 🔲 | main | Error message for invalid file path during bulk upload |

### 12.11 Redis Stack Detection
| Status | Group | Test Case |
|--------|-------|-----------|
| 🔲 | main | Display Redis Stack icon for databases with modules |
| 🔲 | main | Show module list tooltip on Redis Stack icon hover |
| 🔲 | main | Display Redis Stack logo in tooltip |
| 🔲 | main | Verify all Redis Stack modules listed (Query Engine, Graph, Probabilistic, JSON, Time Series) |

### 12.12 Feature Flags / Remote Config
> ⚠️ Internal testing feature - remote config management

| Status | Group | Test Case |
|--------|-------|-----------|
| 🔲 | main | Apply default config when remote config version is lower |
| 🔲 | main | Invalid remote config not applied even with higher version |
| 🔲 | main | Valid remote config applied with higher version |
| 🔲 | main | Feature flags respect analytics filter |
| 🔲 | main | Feature flags respect buildType filter |
| 🔲 | main | Feature flags respect controlNumber range |

### 12.13 Database List Sorting
| Status | Group | Test Case |
|--------|-------|-----------|
| 🔲 | main | Sort databases by name (ascending/descending) |
| 🔲 | main | Sort databases by host |
| 🔲 | main | Sort databases by port |
| 🔲 | main | Sort databases by last connection time |
| 🔲 | main | Maintain sort order after refresh |

### 12.14 Browser UI Enhancements
| Status | Group | Test Case |
|--------|-------|-----------|
| 🔲 | main | Resize columns in key list |
| 🔲 | main | Full screen mode for key details |
| 🔲 | main | Last refresh timestamp display |
| 🔲 | main | Handle DBSIZE permissions (show/hide key count) |
| 🔲 | main | Large key details values handling |
| 🔲 | main | Upload JSON key from file |
| 🔲 | main | Iterative filtering (filter within filtered results) |

### 12.15 Workbench Pipeline Mode
| Status | Group | Test Case |
|--------|-------|-----------|
| 🔲 | main | Configure pipeline batch size in settings |
| 🔲 | main | Verify pipeline text with external link in settings |
| 🔲 | main | Only positive numbers allowed in pipeline input |
| 🔲 | main | Pipeline limits concurrent command execution |
| 🔲 | main | Spinner displayed over Run button during pipeline execution |
| 🔲 | main | Editor remains interactive during pipeline execution |
| 🔲 | main | Command results ordered most recent on top |

### 12.16 Cypher / Graph Syntax (FalkorDB)
> ⚠️ Requires FalkorDB/Graph module

| Status | Group | Test Case |
|--------|-------|-----------|
| 🔲 | main | Open Cypher popover editor with "Use Cypher Syntax" |
| 🔲 | main | Open Cypher popover editor with Shift+Space shortcut |
| 🔲 | main | Popover populated with script detected between quotes |
| 🔲 | main | Blank popover when quotes are empty |

### 12.17 Survey Link
| Status | Group | Test Case |
|--------|-------|-----------|
| 🔲 | main | Display survey link in browser |
| 🔲 | main | Survey link opens correct external URL |

### 12.18 GitHub Integration
| Status | Group | Test Case |
|--------|-------|-----------|
| 🔲 | main | Display GitHub repository link |
| 🔲 | main | GitHub link opens correct repository URL |

