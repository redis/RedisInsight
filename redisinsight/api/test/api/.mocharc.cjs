// Mocha config. Dynamic so the spec list can react to TEST_TAGS.
//
// When TEST_TAGS is set on an RTE (e.g. oss-st-8 sets TEST_TAGS=array
// because redis:8.8-alpine lacks modules and other suites fail against
// Redis 8.8 semantics — per-field hash TTL, RediSearch flag changes,
// etc.), mocha only loads the file globs that map to the requested tag(s).
// When TEST_TAGS is unset (every other RTE) the wildcard runs everything,
// preserving prior behaviour exactly.
const TAG_SPECS = {
  array: ['test/api/array/**/*.test.ts'],
};

const tags = (process.env.TEST_TAGS || '')
  .split(',')
  .map((s) => s.trim())
  .filter(Boolean);

const spec = tags.length
  ? [...new Set(tags.flatMap((t) => TAG_SPECS[t] || []))]
  : ['test/**/*.test.ts'];

module.exports = {
  spec,
  require: 'test/api/api.deps.init.ts',
  project: './test/api/api.tsconfig.json',
  retries: 2,
  timeout: 60000,
  exit: true,
};
