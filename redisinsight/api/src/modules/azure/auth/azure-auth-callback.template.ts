import { AzureAuthStatus } from '../constants';

/**
 * Result data stored in localStorage for the opener window to read.
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
 * Sanitize a string for safe embedding in HTML/JavaScript.
 * Prevents XSS by escaping characters that could break out of script context.
 */
const sanitizeForHtml = (str: string): string =>
  str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;');

/**
 * Generate HTML page for Azure OAuth web callback.
 * This page redirects to the UI origin with the result, allowing
 * the popup to communicate with the main window via localStorage.
 */
export const generateCallbackHtml = (
  options: GenerateCallbackOptions,
): string => {
  const { result, isDevMode = false } = options;

  // Sanitize the error message to prevent XSS
  const sanitizedResult = {
    ...result,
    error: result.error ? sanitizeForHtml(result.error) : undefined,
  };
  const resultJson = JSON.stringify(sanitizedResult);

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
      color: #333;
    }
    .message {
      color: #666;
      margin-bottom: 20px;
    }
    .spinner {
      width: 40px;
      height: 40px;
      border: 3px solid #f3f3f3;
      border-top: 3px solid #3498db;
      border-radius: 50%;
      animation: spin 1s linear infinite;
      margin: 0 auto 20px;
    }
    @keyframes spin {
      0% { transform: rotate(0deg); }
      100% { transform: rotate(360deg); }
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="spinner"></div>
    <div class="title">Completing authentication...</div>
    <div class="message">This window will close automatically.</div>
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
