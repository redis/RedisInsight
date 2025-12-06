# RedisInsight E2E Test Plan

This document outlines the comprehensive E2E testing strategy for RedisInsight features.

## Overview

The test plan is organized by feature area, with tests categorized by priority:
- 🔴 **Critical** (`@critical`) - Must pass for release, core functionality
- 🟠 **Smoke** (`@smoke`) - Quick sanity checks, run on every PR
- 🟢 **Regression** (`@regression`) - Full coverage, run before release

## Test Status Legend

- ✅ Implemented
- 🔲 Not implemented
- ⏳ In progress

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
| 🔲 | 🔴 | Connect to database |
| 🔲 | 🟢 | Database connection status indicator |

### 1.3 Import/Export
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

## 2. Browser Page (⏳ Partially Implemented)

### 2.1 Key List View
| Status | Priority | Test Case |
|--------|----------|-----------|
| 🔲 | 🔴🟠 | View key list |
| 🔲 | 🔴 | Search/filter keys |
| 🔲 | 🟢 | Filter by key type |
| 🔲 | 🟢 | Scan with pattern |
| 🔲 | 🔴 | Refresh key list |
| 🔲 | 🟢 | View key count |
| 🔲 | 🔴 | Delete key |
| 🔲 | 🟢 | Delete multiple keys (bulk) |

### 2.2 Key Tree View
| Status | Priority | Test Case |
|--------|----------|-----------|
| 🔲 | 🟠 | Switch to tree view |
| 🔲 | 🟢 | Expand/collapse tree nodes |
| 🔲 | 🟢 | Configure delimiter |
| 🔲 | 🟢 | Sort tree nodes |

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
| 🔲 | 🔴🟠 | View string value |
| 🔲 | 🔴 | Edit string value |
| 🔲 | 🟢 | View/edit TTL |
| 🔲 | 🟢 | Copy value |
| 🔲 | 🟢 | Change value format (text/binary/hex) |

### 2.5 Key Details - Hash
| Status | Priority | Test Case |
|--------|----------|-----------|
| 🔲 | 🔴🟠 | View hash fields |
| 🔲 | 🔴 | Add hash field |
| 🔲 | 🔴 | Edit hash field |
| 🔲 | 🔴 | Delete hash field |
| 🔲 | 🟢 | Search hash fields |
| 🔲 | 🟢 | Pagination |

### 2.6 Key Details - List
| Status | Priority | Test Case |
|--------|----------|-----------|
| 🔲 | 🔴🟠 | View list elements |
| 🔲 | 🔴 | Add element (LPUSH/RPUSH) |
| 🔲 | 🔴 | Edit list element |
| 🔲 | 🔴 | Remove element |
| 🔲 | 🟢 | Search by index |

### 2.7 Key Details - Set
| Status | Priority | Test Case |
|--------|----------|-----------|
| 🔲 | 🔴🟠 | View set members |
| 🔲 | 🔴 | Add member |
| 🔲 | 🔴 | Remove member |
| 🔲 | 🟢 | Search members |

### 2.8 Key Details - Sorted Set
| Status | Priority | Test Case |
|--------|----------|-----------|
| 🔲 | 🔴🟠 | View sorted set members |
| 🔲 | 🔴 | Add member with score |
| 🔲 | 🔴 | Edit member score |
| 🔲 | 🔴 | Remove member |
| 🔲 | 🟢 | Search members |
| 🔲 | 🟢 | Sort by score/member |

### 2.9 Key Details - Stream
| Status | Priority | Test Case |
|--------|----------|-----------|
| 🔲 | 🔴🟠 | View stream entries |
| 🔲 | 🔴 | Add stream entry |
| 🔲 | 🟢 | View consumer groups |
| 🔲 | 🟢 | Add consumer group |
| 🔲 | 🟢 | View consumers |

### 2.10 Key Details - JSON
| Status | Priority | Test Case |
|--------|----------|-----------|
| 🔲 | 🔴🟠 | View JSON value |
| 🔲 | 🔴 | Edit JSON value |
| 🔲 | 🟢 | Add JSON path |
| 🔲 | 🟢 | Delete JSON path |
| 🔲 | 🟢 | Expand/collapse JSON tree |

### 2.11 Bulk Actions
| Status | Priority | Test Case |
|--------|----------|-----------|
| 🔲 | 🔴 | Bulk delete keys |
| 🔲 | 🟢 | Bulk delete with pattern |
| 🔲 | 🔴 | Bulk upload data |
| 🔲 | 🟢 | View bulk action progress |

---

## 3. Workbench (🔲 Not Implemented)

### 3.1 Command Execution
| Status | Priority | Test Case |
|--------|----------|-----------|
| 🔲 | 🔴🟠 | Execute single Redis command |
| 🔲 | 🔴 | Execute multiple commands |
| 🔲 | 🔴 | View command result |
| 🔲 | 🟢 | Command autocomplete |
| 🔲 | 🟢 | Command syntax highlighting |
| 🔲 | 🔴 | Handle command error |
| 🔲 | 🟢 | Clear editor |
| 🔲 | 🟢 | History navigation |

### 3.2 Results View
| Status | Priority | Test Case |
|--------|----------|-----------|
| 🔲 | 🔴🟠 | View text result |
| 🔲 | 🟢 | View table result |
| 🔲 | 🟢 | View JSON result |
| 🔲 | 🟢 | Copy result |
| 🔲 | 🟢 | Expand/collapse results |
| 🔲 | 🟢 | Clear results |

### 3.3 Profiler/Monitor Mode
| Status | Priority | Test Case |
|--------|----------|-----------|
| 🔲 | 🔴 | Start profiler |
| 🔲 | 🔴 | Stop profiler |
| 🔲 | 🟢 | Filter profiler output |
| 🔲 | 🟢 | Clear profiler output |

---

## 4. CLI (🔲 Not Implemented)

### 4.1 CLI Panel
| Status | Priority | Test Case |
|--------|----------|-----------|
| 🔲 | 🔴🟠 | Open CLI panel |
| 🔲 | 🔴 | Execute command |
| 🔲 | 🔴 | View command output |
| 🔲 | 🟢 | Command history (up/down arrows) |
| 🔲 | 🟢 | Tab completion |
| 🔲 | 🟢 | Clear CLI |
| 🔲 | 🟢 | Close CLI panel |
| 🔲 | 🟢 | Multiple CLI sessions |

---

## 5. Pub/Sub (🔲 Not Implemented)

### 5.1 Subscribe
| Status | Priority | Test Case |
|--------|----------|-----------|
| 🔲 | 🔴🟠 | Subscribe to channel |
| 🔲 | 🔴 | Subscribe with pattern |
| 🔲 | 🔴 | Receive messages |
| 🔲 | 🔴 | Unsubscribe |
| 🔲 | 🟢 | Multiple subscriptions |
| 🔲 | 🟢 | Clear messages |

### 5.2 Publish
| Status | Priority | Test Case |
|--------|----------|-----------|
| 🔲 | 🔴🟠 | Publish message to channel |
| 🔲 | 🟢 | Publish with different formats |

---

## 6. Analytics (🔲 Not Implemented)

### 6.1 Slow Log
| Status | Priority | Test Case |
|--------|----------|-----------|
| 🔲 | 🔴🟠 | View slow log entries |
| 🔲 | 🔴 | Refresh slow log |
| 🔲 | 🟢 | Clear slow log |
| 🔲 | 🟢 | Configure slow log threshold |
| 🔲 | 🟢 | Sort entries |
| 🔲 | 🟢 | Filter entries |

### 6.2 Database Analysis
| Status | Priority | Test Case |
|--------|----------|-----------|
| 🔲 | 🔴🟠 | Run database analysis |
| 🔲 | 🔴 | View analysis results |
| 🔲 | 🟢 | View top keys by memory |
| 🔲 | 🟢 | View top namespaces |
| 🔲 | 🟢 | View TTL distribution |
| 🔲 | 🟢 | View recommendations |
| 🔲 | 🟢 | History of analyses |

### 6.3 Cluster Details
| Status | Priority | Test Case |
|--------|----------|-----------|
| 🔲 | 🔴🟠 | View cluster nodes |
| 🔲 | 🟢 | View node details |
| 🔲 | 🟢 | View slot distribution |
| 🔲 | 🟢 | Refresh cluster info |

---

## 7. Settings (🔲 Not Implemented)

### 7.1 General Settings
| Status | Priority | Test Case |
|--------|----------|-----------|
| 🔲 | 🟠 | View settings page |
| 🔲 | 🔴 | Change theme (light/dark/system) |
| 🔲 | 🟢 | Change date/time format |
| 🔲 | 🟢 | Enable/disable analytics |

### 7.2 Workbench Settings
| Status | Priority | Test Case |
|--------|----------|-----------|
| 🔲 | 🟢 | Change editor font size |
| 🔲 | 🟢 | Enable/disable auto-complete |
| 🔲 | 🟢 | Configure command timeout |

### 7.3 Advanced Settings
| Status | Priority | Test Case |
|--------|----------|-----------|
| 🔲 | 🟢 | Configure key scan count |
| 🔲 | 🟢 | Configure pipeline batch size |

---

## 8. Vector Search (🔲 Not Implemented)

### 8.1 Index Management
| Status | Priority | Test Case |
|--------|----------|-----------|
| 🔲 | 🔴🟠 | View indexes |
| 🔲 | 🔴 | Create index |
| 🔲 | 🔴 | Delete index |
| 🔲 | 🟢 | View index info |

### 8.2 Query
| Status | Priority | Test Case |
|--------|----------|-----------|
| 🔲 | 🔴🟠 | Execute vector search query |
| 🔲 | 🔴 | View search results |
| 🔲 | 🟢 | Save query |
| 🔲 | 🟢 | Load saved query |

---

## 9. Redis Cloud Integration (🔲 Not Implemented)

### 9.1 Auto-Discovery
| Status | Priority | Test Case |
|--------|----------|-----------|
| 🔲 | 🔴 | Connect to Redis Cloud account |
| 🔲 | 🔴 | View subscriptions |
| 🔲 | 🔴 | View databases |
| 🔲 | 🔴 | Add cloud database to list |

---

## 10. Sentinel (🔲 Not Implemented)

### 10.1 Sentinel Discovery
| Status | Priority | Test Case |
|--------|----------|-----------|
| 🔲 | 🔴 | Connect to Sentinel |
| 🔲 | 🔴 | Discover databases |
| 🔲 | 🔴 | Add discovered database |

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

