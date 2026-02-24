
Here's what the current API does for error tracking:

## Current Error Tracking in API

### 1. **Local File Logging (Winston)** ✅

The API uses **Winston** with daily rotating log files:

````typescript path=redisinsight/api/config/logger.ts mode=EXCERPT
// Separate error log file
new transports.DailyRotateFile({
  dirname: join(PATH_CONFIG.logs),
  filename: 'redisinsight-errors-%DATE%.log',
  level: 'error',
  maxFiles: '7d',
  ...
})
````

**Location:** `~/.redisinsight/logs/` (or configured path)
- `redisinsight-errors-YYYY-MM-DD.log` - Errors only
- `redisinsight-YYYY-MM-DD.log` - All logs

### 2. **GlobalExceptionFilter** ✅

Catches unhandled exceptions but only logs them locally:

````typescript path=redisinsight/api/src/exceptions/global-exception.filter.ts mode=EXCERPT
export class GlobalExceptionFilter extends BaseExceptionFilter {
  catch(exception: Error, host: ArgumentsHost) {
    // Only logs to local Winston logger
    this.staticServerLogger.error(message, { ...exception });
    ...
  }
}
````

### 3. **Telemetry Events (Segment/Amplitude)** ⚠️ Partial

The existing analytics tracks **business events** (not errors):
- `DATABASE_CONNECTION_FAILED` - when connection fails
- `CLI_COMMAND_ERROR_RECEIVED` - when CLI command errors
- Various `*_FAILED` events

But these are **intentional event tracking**, not automatic error capture.

---

## Summary: What's Missing

| Capability | Current State | With Sentry |
|------------|---------------|-------------|
| **Local error logs** | ✅ Winston files | ✅ Keep |
| **Centralized error aggregation** | ❌ None | ✅ Sentry dashboard |
| **Stack traces with source maps** | ❌ Minified in production | ✅ Readable traces |
| **Error grouping & deduplication** | ❌ Manual log review | ✅ Automatic |
| **Affected users count** | ❌ Unknown | ✅ Per-error stats |
| **Release correlation** | ❌ Manual | ✅ Automatic |
| **Native crash reporting** | ❌ Lost | ✅ Electron crashes |

**Bottom line:** Currently errors are logged locally to files, but there's **no centralized error reporting** to see what's actually breaking in production across users. Sentry would fill this gap.
