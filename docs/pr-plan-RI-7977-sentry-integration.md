# Implementation Plan: Integrating RedisInsight with Sentry

**JIRA Ticket:** [RI-7977](https://redislabs.atlassian.net/browse/RI-7977)
**Epic:** [RI-7576](https://redislabs.atlassian.net/browse/RI-7576) - Tech Debt
**Plan Date:** 2026-02-23
**Planner:** Augment Agent

---

## Executive Summary

**Objective:** Integrate Sentry for crash detection and error monitoring across all RedisInsight layers (API, UI, Electron).

**Components Affected:**

- `redisinsight/api/` - NestJS backend (error tracking, performance monitoring)
- `redisinsight/ui/` - React frontend (error boundaries, browser errors)
- `redisinsight/desktop/` - Electron main process (native crashes, unhandled rejections)
- Configuration files (`default.ts`, environment variables)

**Key Risks:**

1. **Privacy/Consent** - Must respect existing analytics consent (`agreements.analytics`) - Mitigation: Reuse existing consent mechanism
2. **PII Leakage** - Database credentials, keys could leak in error reports - Mitigation: Configure `beforeSend` hooks to scrub sensitive data
3. **Performance Impact** - Sentry SDK overhead - Mitigation: Use sampling, disable in development

---

## 1. Requirements Summary

**Story (Why):**
> Sentry is used in Redis for crash detection. RI already has a project. We need a clear strategy/PoC of integrating RI with Sentry.

**Acceptance Criteria (What):**

1. Sentry integration captures unhandled exceptions in API (NestJS)
2. Sentry integration captures React errors via Error Boundaries
3. Sentry integration captures Electron main process crashes
4. Integration respects user analytics consent
5. Sensitive data (credentials, keys) is scrubbed before sending
6. Configuration is environment-based (DSN, environment, release)

**Functional Requirements:**

- Initialize Sentry SDKs in all three layers
- Capture unhandled exceptions automatically
- Add context (user anonymous ID, app version, build type)
- Respect `agreements.analytics` setting

**Non-Functional Requirements:**

- No performance degradation (use sampling)
- No PII or sensitive data in error reports
- Works in both web and Electron builds

**Resources Provided:**

- Existing Sentry project (mentioned in ticket)
- Slack thread with additional context

## 2. Current State Analysis

### Frontend (React/UI)

**Components to Modify:**

- `redisinsight/ui/src/App.tsx` - Add Sentry Error Boundary wrapper
- `redisinsight/ui/src/index.tsx` - Initialize Sentry for web
- `redisinsight/ui/src/indexElectron.tsx` - Initialize Sentry for Electron renderer

**Components to Create:**

- `redisinsight/ui/src/services/sentry.ts` - Sentry initialization and configuration
- `redisinsight/ui/src/components/SentryErrorBoundary/` - Error boundary wrapper

**Components to Reuse:**

- `redisinsight/ui/src/telemetry/checkAnalytics.ts` - `checkIsAnalyticsGranted()` for consent check

### Backend (NestJS/API)

**Services to Modify:**

- `redisinsight/api/src/main.ts` - Initialize Sentry early in bootstrap
- `redisinsight/api/src/exceptions/global-exception.filter.ts` - Capture exceptions to Sentry

**Services to Create:**

- `redisinsight/api/src/modules/sentry/sentry.module.ts` - Sentry NestJS module
- `redisinsight/api/src/modules/sentry/sentry.service.ts` - Sentry service wrapper
- `redisinsight/api/src/modules/sentry/sentry.interceptor.ts` - Request context interceptor

**Configuration:**

- `redisinsight/api/config/default.ts` - Add Sentry configuration block

### Desktop (Electron)

**Services to Modify:**

- `redisinsight/desktop/app.ts` - Initialize Sentry in main process
- `redisinsight/desktop/preload.ts` - Expose Sentry IPC if needed

**Services to Create:**

- `redisinsight/desktop/src/lib/sentry/sentry.ts` - Electron-specific Sentry setup

---

## 3. Implementation Plan

### Phase 1: API Layer Integration (Backend)

**Goal:** Capture all unhandled exceptions in NestJS API

**Tasks:**

1. [ ] Add Sentry configuration to `redisinsight/api/config/default.ts`
   - Files: `redisinsight/api/config/default.ts`
   - Acceptance: Config includes `sentry.dsn`, `sentry.environment`, `sentry.enabled`

2. [ ] Create Sentry module with initialization logic
   - Files: `redisinsight/api/src/modules/sentry/sentry.module.ts`, `sentry.service.ts`
   - Acceptance: Sentry initializes on app bootstrap with correct DSN

3. [ ] Integrate with GlobalExceptionFilter
   - Files: `redisinsight/api/src/exceptions/global-exception.filter.ts`
   - Acceptance: Unhandled exceptions are captured and sent to Sentry

4. [ ] Add data scrubbing for sensitive fields
   - Files: `redisinsight/api/src/modules/sentry/sentry.service.ts`
   - Acceptance: Password, certificate, key fields are redacted in `beforeSend`

5. [ ] Respect analytics consent
   - Files: `redisinsight/api/src/modules/sentry/sentry.service.ts`
   - Acceptance: Sentry only sends when `agreements.analytics` is true

**Deliverables:**

- Sentry module integrated into NestJS
- All API exceptions captured with context

**Testing:**

- Throw test exception, verify it appears in Sentry
- Verify sensitive data is scrubbed
- Verify consent is respected

### Phase 2: Frontend Integration (React UI)

**Goal:** Capture React errors and browser exceptions

**Tasks:**

1. [ ] Create Sentry service with initialization
   - Files: `redisinsight/ui/src/services/sentry.ts`
   - Acceptance: `initSentry()` function configurable via environment

2. [ ] Initialize Sentry in web entry point
   - Files: `redisinsight/ui/src/index.tsx`
   - Acceptance: Sentry initialized before React renders

3. [ ] Initialize Sentry in Electron renderer
   - Files: `redisinsight/ui/src/indexElectron.tsx`
   - Acceptance: Sentry initialized in Electron context

4. [ ] Create Error Boundary wrapper component
   - Files: `redisinsight/ui/src/components/SentryErrorBoundary/`
   - Acceptance: React errors captured with component stack

5. [ ] Wrap App component with Error Boundary
   - Files: `redisinsight/ui/src/App.tsx`
   - Acceptance: All React errors flow through Sentry boundary

6. [ ] Add user context (anonymousId, buildType)
   - Files: `redisinsight/ui/src/services/sentry.ts`
   - Acceptance: Errors include user context without PII

7. [ ] Respect analytics consent
   - Files: `redisinsight/ui/src/services/sentry.ts`
   - Acceptance: Sentry disabled when consent not granted

**Deliverables:**

- Sentry capturing all React errors
- Error boundaries with fallback UI
- Browser errors captured

**Testing:**

- Trigger React error, verify in Sentry
- Verify consent check works
- Verify user context is attached

### Phase 3: Electron Main Process Integration

**Goal:** Capture native crashes and main process errors

**Tasks:**

1. [ ] Create Electron-specific Sentry setup
   - Files: `redisinsight/desktop/src/lib/sentry/sentry.ts`
   - Acceptance: Sentry Electron SDK initialized

2. [ ] Initialize Sentry early in Electron bootstrap
   - Files: `redisinsight/desktop/app.ts`
   - Acceptance: Sentry captures crashes during startup

3. [ ] Add process error handlers
   - Files: `redisinsight/desktop/src/lib/sentry/sentry.ts`
   - Acceptance: `uncaughtException` and `unhandledRejection` captured

4. [ ] Configure native crash reporting
   - Files: `redisinsight/desktop/src/lib/sentry/sentry.ts`
   - Acceptance: Native crashes (segfaults) reported

5. [ ] Add release and environment info
   - Files: `redisinsight/desktop/src/lib/sentry/sentry.ts`
   - Acceptance: Errors tagged with version from `package.json`

**Deliverables:**

- Main process errors captured
- Native crash reports
- IPC errors captured

**Testing:**

- Trigger main process error, verify in Sentry
- Test native crash capture (if possible)

### Phase 4: Configuration & Environment

**Goal:** Environment-based configuration for all builds

**Tasks:**

1. [ ] Add environment variables documentation
   - Files: `.env.example`, `README.md` or docs
   - Acceptance: `RI_SENTRY_DSN`, `RI_SENTRY_ENVIRONMENT` documented

2. [ ] Configure source maps upload (build time)
   - Files: `vite.config.ts`, `webpack.config.js` (if applicable)
   - Acceptance: Source maps uploaded to Sentry on release

3. [ ] Add release tracking
   - Files: CI/CD configuration
   - Acceptance: Releases created in Sentry with commit info

**Deliverables:**

- Complete configuration documentation
- Source maps for readable stack traces
- Release tracking

---

## 4. Architecture Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                         RedisInsight                            │
├─────────────────────────────────────────────────────────────────┤
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐ │
│  │   Electron      │  │   React UI      │  │   NestJS API    │ │
│  │   Main Process  │  │   (Renderer)    │  │   (Backend)     │ │
│  │                 │  │                 │  │                 │ │
│  │ @sentry/electron│  │ @sentry/react   │  │ @sentry/node    │ │
│  │                 │  │ ErrorBoundary   │  │ GlobalFilter    │ │
│  └────────┬────────┘  └────────┬────────┘  └────────┬────────┘ │
│           │                    │                    │          │
│           └────────────────────┼────────────────────┘          │
│                                │                               │
│                    ┌───────────▼───────────┐                   │
│                    │   Consent Check       │                   │
│                    │ (agreements.analytics)│                   │
│                    └───────────┬───────────┘                   │
│                                │                               │
│                    ┌───────────▼───────────┐                   │
│                    │   Data Scrubbing      │                   │
│                    │   (beforeSend hook)   │                   │
│                    └───────────┬───────────┘                   │
└────────────────────────────────┼────────────────────────────────┘
                                 │
                    ┌────────────▼────────────┐
                    │        Sentry           │
                    │   (Redis RI Project)    │
                    └─────────────────────────┘
```

---

## 5. Testing Strategy

### Test Scenarios (from Acceptance Criteria)

**AC1: API captures unhandled exceptions**

- Scenario: Given API running, when unhandled exception thrown, then error appears in Sentry
- Test Type: Integration
- Test Location: Manual verification in Sentry dashboard

**AC2: React errors captured via Error Boundaries**

- Scenario: Given UI running, when React component throws, then error captured with component stack
- Test Type: Integration
- Test Location: `redisinsight/ui/src/components/SentryErrorBoundary/SentryErrorBoundary.spec.tsx`

**AC3: Electron main process crashes captured**

- Scenario: Given Electron app running, when main process has unhandled rejection, then error captured
- Test Type: Integration
- Test Location: Manual verification

**AC4: Analytics consent respected**

- Scenario: Given consent NOT granted, when error occurs, then NO data sent to Sentry
- Test Type: Unit
- Test Location: `redisinsight/api/src/modules/sentry/sentry.service.spec.ts`

**AC5: Sensitive data scrubbed**

- Scenario: Given error with password in context, when sent to Sentry, then password is `[REDACTED]`
- Test Type: Unit
- Test Location: `redisinsight/api/src/modules/sentry/sentry.service.spec.ts`

### Edge Cases and Error Scenarios

1. **Sentry unavailable**
   - Scenario: Sentry server unreachable
   - Expected Behavior: App continues without crash, errors logged locally
   - Test: Mock Sentry SDK, verify graceful degradation

2. **Consent changed mid-session**
   - Scenario: User disables analytics while app running
   - Expected Behavior: Sentry stops sending immediately
   - Test: Toggle consent, verify no new events sent

3. **High error volume**
   - Scenario: Many errors in short time
   - Expected Behavior: Rate limiting prevents flooding
   - Test: Configure sample rate, verify throttling

### Test Data Needs

- Test Sentry DSN (development project)
- Mock error scenarios
- Sample sensitive data patterns to verify scrubbing

---

## 6. Risk Assessment and Mitigation

### Technical Risks

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| PII leakage in error reports | Medium | High | Implement `beforeSend` hook with comprehensive scrubbing |
| Performance overhead | Low | Medium | Use sampling (10-20%), disable in dev |
| Bundle size increase | Low | Low | Tree-shake unused SDK features |

### Integration Risks

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| Conflict with existing analytics | Low | Medium | Keep Sentry separate from Segment integration |
| Electron SDK compatibility | Medium | Medium | Test on all platforms (macOS, Windows, Linux) |

### Timeline Risks

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| Source maps setup complexity | Medium | Low | Can be done post-PoC as enhancement |
| Multi-platform testing | Medium | Medium | Prioritize primary platform, test others in CI |

### Knowledge Gaps

- **Existing Sentry project credentials** - Need DSN from team/Slack thread
- **Sentry Electron SDK maturity** - Verify native crash support quality
- **Release/deploy integration** - How to trigger source map upload in CI

---

## 7. Package Dependencies

**API (NestJS):**
```bash
yarn add @sentry/node @sentry/profiling-node
```

**UI (React):**
```bash
yarn add @sentry/react
```

**Desktop (Electron):**
```bash
yarn add @sentry/electron
```

---

## 8. Configuration Schema

```typescript
// redisinsight/api/config/default.ts
sentry: {
  dsn: process.env.RI_SENTRY_DSN || '',
  environment: process.env.RI_SENTRY_ENVIRONMENT || 'development',
  enabled: process.env.RI_SENTRY_ENABLED === 'true',
  sampleRate: parseFloat(process.env.RI_SENTRY_SAMPLE_RATE || '0.1'),
  tracesSampleRate: parseFloat(process.env.RI_SENTRY_TRACES_SAMPLE_RATE || '0.1'),
}
```

---

## 9. PR Stack Recommendation

| PR # | Title | Scope | Dependencies |
|------|-------|-------|--------------|
| 1 | feat(api): Add Sentry integration to NestJS backend | API only | None |
| 2 | feat(ui): Add Sentry integration to React frontend | UI only | PR #1 (shared config) |
| 3 | feat(desktop): Add Sentry integration to Electron | Desktop | PR #2 |
| 4 | chore: Add Sentry source maps upload to CI | CI/CD | PR #1-3 |

---

## 10. Open Questions

1. **What is the Sentry DSN for the RI project?** (Check Slack thread)
2. **Should we use Sentry for performance monitoring too?** (tracing)
3. **What sampling rate is acceptable?** (balance coverage vs cost)
4. **Should Sentry replace or complement existing error handling?** (complement recommended)

