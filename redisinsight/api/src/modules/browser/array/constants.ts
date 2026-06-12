// Server-enforced hard cap on ARGETRANGE: 1,000,000 elements per call.
// Source: https://redis.io/docs/latest/develop/data-types/arrays/#limits —
// "ARGETRANGE enforces a hard limit of 1,000,000 elements per call to guard
// against accidentally large range reads." We pre-flight the same check so
// callers get a clear 400 instead of a generic server error.
// Note: this limit applies only to ARGETRANGE. ARSCAN has no analogous cap
// because it skips empty slots — a wide range over a sparse array is cheap.
export const ARRAY_RANGE_MAX_ELEMENTS = 1_000_000;
