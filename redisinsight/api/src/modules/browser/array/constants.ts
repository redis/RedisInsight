// Hard cap on result-set size shared by ARGETRANGE (applied as |end - start|
// + 1 span, since the reply is dense), ARMGET (applied as @ArrayMaxSize on
// the indexes list), and ARSCAN (applied as @Max on the optional LIMIT).
// Mirrored from the server-side ARGETRANGE limit so callers get a clear 400.
// https://redis.io/docs/latest/develop/data-types/arrays/#limits
export const ARRAY_RANGE_MAX_ELEMENTS = 1_000_000;
