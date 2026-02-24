# Sentry Production Requirements

This document outlines what would be needed to move the Sentry PoC to a production-ready implementation.

## Current PoC Status

The PoC validates:
- ✅ Errors are captured across all 3 layers (API, UI, Electron)
- ✅ Sensitive data is scrubbed before sending
- ✅ User consent is respected (API + UI)
- ✅ Environment variables configured in CI/CD

## Production Requirements

### 1. Source Maps Upload

**Why**: Stack traces currently show minified JavaScript. Source maps let Sentry display original TypeScript code.

**Implementation**:
```yaml
# Add to build workflows after packaging
- name: Upload source maps to Sentry
  run: |
    npx @sentry/cli releases new ${{ github.sha }}
    npx @sentry/cli releases files ${{ github.sha }} upload-sourcemaps ./dist
    npx @sentry/cli releases finalize ${{ github.sha }}
  env:
    SENTRY_AUTH_TOKEN: ${{ secrets.SENTRY_AUTH_TOKEN }}
    SENTRY_ORG: your-org
    SENTRY_PROJECT: redisinsight
```

**Secrets needed**: `SENTRY_AUTH_TOKEN` (from Sentry → Settings → Auth Tokens)

---

### 2. Release Tracking

**Why**: Associate errors with specific releases to track regressions.

**Implementation**: Update Sentry init to include git SHA:
```typescript
Sentry.init({
  release: `redisinsight@${version}+${gitSha}`,
  // ...
})
```

---

### 3. User Context

**Why**: See how many unique users are affected by each error.

**Implementation**: Set anonymous ID after consent is granted:
```typescript
// In settings service after user grants consent
import { setUser } from 'uiSrc/services/sentry'
setUser(sessionMetadata.anonymousId)
```

---

### 4. Electron Main Process Consent

**Why**: Currently Electron main process only checks env var, not user consent.

**Implementation**: Add IPC handler to check consent:
```typescript
// preload.ts
contextBridge.exposeInMainWorld('sentry', {
  checkConsent: () => ipcRenderer.invoke('check-analytics-consent'),
})

// main process
ipcMain.handle('check-analytics-consent', async () => {
  // Query API or read from electron-store
  return analyticsEnabled
})
```

---

### 5. Shared Code Package

**Why**: `SENSITIVE_FIELDS` and `scrubSensitiveData` are duplicated in 3 files.

**Implementation**: Create shared package:
```
packages/
  sentry-common/
    src/
      scrubbing.ts    # SENSITIVE_FIELDS, scrubSensitiveData
      constants.ts    # Shared constants
    package.json
```

---

### 6. Error Boundary UX

**Why**: Current fallback is basic. Production needs designed UI.

**Implementation**:
- Design proper error screen matching app theme
- Add "Try Again" button that attempts recovery
- Add "Report Issue" button (optional)
- Show error ID for support reference

---

### 7. Unit Tests

**Why**: Ensure Sentry integration works correctly and scrubbing is complete.

**Tests needed**:
- `scrubSensitiveData` correctly redacts all sensitive fields
- Sentry respects consent settings
- `beforeSend` hook properly filters data
- Nested sensitive fields are scrubbed

---

### 8. Environment Separation

**Why**: Keep staging errors separate from production.

**Options**:
1. **Separate Sentry projects** - Different DSN per environment
2. **Same project, filter by environment** - Use `RI_SENTRY_ENVIRONMENT` tag

Recommended: Same project with environment filtering (simpler setup).

---

### 9. Alerts Configuration

**Why**: Get notified of critical errors immediately.

**Setup in Sentry dashboard**:
- Alert on new error types
- Alert on error spike (>10 errors in 5 minutes)
- Alert on specific error patterns (e.g., database connection failures)

---

### 10. Sensitive Fields Audit

**Why**: Current list may be incomplete.

**Action**: Audit all DTOs and entities for sensitive fields:
```bash
grep -r "password\|secret\|key\|token\|cert" redisinsight/api/src --include="*.dto.ts" --include="*.entity.ts"
```

---

## Priority Order

| Priority | Item | Effort |
|----------|------|--------|
| P0 | Source Maps Upload | Medium |
| P0 | Sensitive Fields Audit | Low |
| P1 | User Context | Low |
| P1 | Release Tracking | Low |
| P1 | Unit Tests | Medium |
| P2 | Electron Consent IPC | Medium |
| P2 | Error Boundary UX | Medium |
| P3 | Shared Code Package | High |
| P3 | Alerts Configuration | Low |
| P3 | Environment Separation | Low |

---

## Estimated Effort

- **PoC → Production MVP** (P0 + P1): ~2-3 days
- **Full Production**: ~5-7 days

