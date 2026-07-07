/**
 * Search param that opens the index details side panel on the query page.
 * HashRouter (Electron) does not support location.state, so callers
 * encode the flag in the search string instead.
 */
export const OPEN_INDEX_PANEL_PARAM = 'openIndexPanel'
