// Guards the scheme allowlist that stops renderer-controlled URLs from launching
// local executables via shell.openExternal, and the loopback-only trust for TLS
// certificate errors.
//
// Run: node --import tsx --test tests/security/*.test.mts
import test from 'node:test'
import assert from 'node:assert/strict'
import { isSafeExternalUrl } from '../../redisinsight/desktop/src/lib/window/isSafeExternalUrl.ts'
import { isTrustedCertHost } from '../../redisinsight/desktop/src/lib/app/trustedCertHost.ts'

test('isSafeExternalUrl allows only http/https/mailto', () => {
  for (const url of [
    'https://redis.io',
    'http://localhost:5540/tutorial',
    'mailto:support@redis.io',
  ]) {
    assert.equal(isSafeExternalUrl(url), true, `should allow ${url}`)
  }
})

test('isSafeExternalUrl blocks executable and script schemes', () => {
  for (const url of [
    'file:///C:/Windows/System32/calc.exe',
    'file:///usr/bin/xcalc',
    'calculator:',
    'ms-settings:',
    'javascript:alert(1)',
    'data:text/html,<script>alert(1)</script>',
    '',
    'not a url',
    null,
    undefined,
    42,
  ]) {
    assert.equal(isSafeExternalUrl(url as unknown), false, `should block ${String(url)}`)
  }
})

test('isTrustedCertHost trusts only loopback hosts', () => {
  for (const url of [
    'https://localhost:5540',
    'https://127.0.0.1:8080',
    'https://[::1]:9000',
  ]) {
    assert.equal(isTrustedCertHost(url), true, `should trust ${url}`)
  }
})

test('isTrustedCertHost rejects remote and look-alike hosts', () => {
  for (const url of [
    'https://app.redislabs.com',
    'https://evil.example.com',
    'https://localhost.evil.com',
    'https://127.0.0.1.evil.com',
    '',
    'garbage',
    null,
    undefined,
  ]) {
    assert.equal(isTrustedCertHost(url as unknown), false, `should reject ${String(url)}`)
  }
})
