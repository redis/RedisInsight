// Hard cap on the |end - start| + 1 span for ARGETRANGE and ARSCAN, mirrored
// from the server-side ARGETRANGE limit so callers get a clear 400.
// https://redis.io/docs/latest/develop/data-types/arrays/#limits
export const ARRAY_RANGE_MAX_ELEMENTS = 1_000_000;
