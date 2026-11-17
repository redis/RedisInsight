// Matches e.g. "[▸vector·1536dims#k3f9a1-3]". Ids are "<session>-<n>" so a
// literal placeholder-shaped token in the query can't collide with ours. The
// text is space-free so the FT.SEARCH arg tokenizer treats a collapsed value as
// a single PARAMS argument, keeping later params' name mapping intact. The
// visible chip label (with spaces) is drawn separately as an injected decoration.
export const PLACEHOLDER_REGEX = /\[▸vector·(\d+)dims#([a-z0-9]+-\d+)\]/g
