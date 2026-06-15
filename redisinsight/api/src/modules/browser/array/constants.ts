// Server-enforced hard cap on index-range reads: 1,000,000 elements per call.
// Source: https://redis.io/docs/latest/develop/data-types/arrays/#limits —
// "ARGETRANGE enforces a hard limit of 1,000,000 elements per call to guard
// against accidentally large range reads." We pre-flight the same check so
// callers get a clear 400 instead of a generic server error.
// The same cap is applied to ARSCAN: although ARSCAN's response only
// contains populated slots, the server still walks the index range
// (O(|end-start|+1) per the Redis docs), so an unbounded range without a
// LIMIT can still tie up Redis. LIMIT remains a complementary result-set
// cap, not a substitute for the range cap.
export const ARRAY_RANGE_MAX_ELEMENTS = 1_000_000;
