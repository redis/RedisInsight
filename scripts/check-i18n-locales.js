#!/usr/bin/env node
/* eslint-disable no-console */

/**
 * Fails if any i18n locale file contains a DUPLICATE KEY.
 *
 * JSON silently keeps only the last occurrence of a duplicate key, so a stray
 * dup would shadow a translation with no error at parse/build time. Locale files
 * are flat (keySeparator/nsSeparator are false) and machine-formatted one key
 * per line, so a line scan reliably finds duplicates. Duplicate *values* are
 * expected (many error codes share the same text) and are never checked.
 */

const fs = require('fs');
const path = require('path');

const LOCALES_DIR = path.join(
  __dirname,
  '..',
  'redisinsight',
  'ui',
  'src',
  'i18n',
  'locales',
);

// Matches a leading  "some.key":  at the start of a line (after indentation).
const KEY_RE = /^\s*"((?:\\.|[^"\\])*)"\s*:/;

let hasDuplicates = false;

const files = fs
  .readdirSync(LOCALES_DIR)
  .filter((file) => file.endsWith('.json'));

files.forEach((file) => {
  const filePath = path.join(LOCALES_DIR, file);
  const text = fs.readFileSync(filePath, 'utf8');

  // Sanity check: the file must still be valid JSON.
  JSON.parse(text);

  const firstSeenLine = new Map();
  const duplicates = new Map();

  text.split('\n').forEach((line, index) => {
    const match = line.match(KEY_RE);
    if (!match) {
      return;
    }
    const key = match[1];
    if (firstSeenLine.has(key)) {
      if (!duplicates.has(key)) {
        duplicates.set(key, [firstSeenLine.get(key)]);
      }
      duplicates.get(key).push(index + 1);
    } else {
      firstSeenLine.set(key, index + 1);
    }
  });

  const relPath = path.relative(path.join(__dirname, '..'), filePath);
  if (duplicates.size) {
    hasDuplicates = true;
    console.error(`\n✗ ${relPath}: ${duplicates.size} duplicate key(s):`);
    duplicates.forEach((lines, key) => {
      console.error(`    "${key}" — lines ${lines.join(', ')}`);
    });
  } else {
    console.log(`✓ ${relPath}: no duplicate keys (${firstSeenLine.size} keys)`);
  }
});

if (hasDuplicates) {
  console.error(
    '\nDuplicate i18n keys detected. JSON keeps only the last occurrence, ' +
      'so the earlier value is silently dropped — remove the duplicate.',
  );
  process.exit(1);
}

console.log('\nNo duplicate i18n keys found.');
