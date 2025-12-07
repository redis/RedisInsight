import { createGlobalStyle } from 'styled-components'
import { Theme } from 'uiSrc/components/base/theme/types'

/**
 * Global styles for the application
 * These styles are applied to the entire application using styled-components
 */
export const GlobalStyles = createGlobalStyle<{ theme: Theme }>`
  :root {
    // todo: replace with theme colors at some point
    /* Type colors for Redis data types */
    --typeHashColor: #364cff;
    --typeListColor: #008556;
    --typeSetColor: #9c5c2b;
    --typeZSetColor: #a00a6b;
    --typeStringColor: #6a1dc3;
    --typeReJSONColor: #3f4b5f;
    --typeStreamColor: #6a741b;
    --typeGraphColor: #14708d;
    --typeTimeSeriesColor: #6e6e6e;

    /* Group colors for Redis command groups */
    --groupSortedSetColor: #a00a6b;
    --groupBitmapColor: #3f4b5f;
    --groupClusterColor: #6e6e6e;
    --groupConnectionColor: #bf1046;
    --groupGeoColor: #344e36;
    --groupGenericColor: #4a2923;
    --groupPubSubColor: #14365d;
    --groupScriptingColor: #5d141c;
    --groupTransactionsColor: #14708d;
    --groupServerColor: #000000;
    --groupHyperLolLogColor: #3f4b5f;

    /* Default type color */
    --defaultTypeColor: #aa4e4e;
  }

  .text-uppercase {
    text-transform: uppercase;
  }
`
