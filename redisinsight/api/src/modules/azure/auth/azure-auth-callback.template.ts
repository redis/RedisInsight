import { AzureAuthStatus } from '../constants';

/**
 * Result data sent via postMessage to the opener window.
 */
export interface AzureOAuthCallbackResult {
  status: AzureAuthStatus;
  account?: {
    id: string;
    username: string;
    name?: string;
  };
  error?: string;
}

export interface GenerateCallbackOptions {
  result: AzureOAuthCallbackResult;
  /**
   * When true, indicates running in development mode where API (5540) and UI (8080)
   * are on different ports. In this case, we always redirect to the UI port.
   * When false (Docker/production), both are on the same port and we use localStorage directly.
   */
  isDevMode?: boolean;
}

/**
 * Generate HTML page for Azure OAuth web callback.
 * This page redirects to the UI origin with the result, allowing
 * the popup to communicate with the main window via localStorage.
 */
export const generateCallbackHtml = (
  options: GenerateCallbackOptions,
): string => {
  const { result, isDevMode = false } = options;
  const resultJson = JSON.stringify(result);

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <title>Azure Authentication</title>
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      display: flex;
      justify-content: center;
      align-items: center;
      min-height: 100vh;
      margin: 0;
      background-color: #f5f5f5;
    }
    .container {
      text-align: center;
      padding: 40px;
      background: white;
      border-radius: 8px;
      box-shadow: 0 2px 10px rgba(0,0,0,0.1);
      max-width: 400px;
    }
    .title {
      font-size: 24px;
      margin-bottom: 16px;
      color: ${result.status === AzureAuthStatus.Succeed ? '#28a745' : '#dc3545'};
    }
    .message {
      color: #666;
      margin-bottom: 20px;
    }
    .close-message {
      font-size: 14px;
      color: #999;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="title">
      ${result.status === AzureAuthStatus.Succeed ? '✓ Authentication Successful' : '✕ Authentication Failed'}
    </div>
    <div class="message">
      ${result.status === AzureAuthStatus.Succeed ? `Signed in as ${result.account?.username || 'user'}` : result.error || 'An error occurred'}
    </div>
    <div class="close-message">
      Completing authentication...
    </div>
  </div>
  <script>
    (function() {
      var result = ${resultJson};
      var isDevMode = ${isDevMode};
      var STORAGE_KEY = 'ri_azure_oauth_result';
      var DEV_UI_PORT = '8080';

      // Function to store result and close
      function storeAndClose() {
        try {
          localStorage.setItem(STORAGE_KEY, JSON.stringify({
            timestamp: Date.now(),
            result: result
          }));
        } catch (e) {
          // Storage failed
        }

        // Try postMessage as well (works if opener is same-origin)
        if (window.opener) {
          try {
            window.opener.postMessage({ type: 'azure-oauth-callback', payload: result }, '*');
          } catch (e) {}
        }

        setTimeout(function() { window.close(); }, 1000);
      }

      // Dev mode: API (5540) and UI (8080) are on different ports/origins
      // We must redirect to UI origin so localStorage is accessible to the main window
      // Note: window.opener is null after OAuth redirect through Microsoft, so we can't check it
      if (isDevMode) {
        var uiOrigin = window.location.protocol + '//' + window.location.hostname + ':' + DEV_UI_PORT;
        var encodedResult = encodeURIComponent(btoa(JSON.stringify(result)));
        var redirectUrl = uiOrigin + '/azure-auth-callback?result=' + encodedResult;
        window.location.href = redirectUrl;
        return;
      }

      // Production/Docker: API and UI on same origin, localStorage is shared
      storeAndClose();
    })();
  </script>
</body>
</html>`;
};
