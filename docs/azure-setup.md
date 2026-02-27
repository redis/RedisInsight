# Azure Cache for Redis Setup

Redis Insight supports seamless integration with Azure Cache for Redis using Microsoft Entra ID authentication.

## Setup Instructions

To use the Azure integration, your Azure tenant administrator may need to grant admin consent for the RedisInsight application.

### App Registration Details

- **Application (Client) ID:** `61f3d82d-2bf3-432a-ba1b-c056e4cf0fd0`

### Required Permissions

The RedisInsight app requires the following API permissions:

| API                            | Permission | Type      | Purpose                                            |
| ------------------------------ | ---------- | --------- | -------------------------------------------------- |
| `https://redis.azure.com`      | `.default` | Delegated | Connect to Azure Cache for Redis using Entra ID    |
| `https://management.azure.com` | `.default` | Delegated | Auto-discover Redis databases across subscriptions |

### Granting Admin Consent

If your organization requires admin consent for third-party applications:

1. Go to **Azure Portal** → **Microsoft Entra ID** → **Enterprise applications**
2. Search for application ID: `61f3d82d-2bf3-432a-ba1b-c056e4cf0fd0`
3. Navigate to **Permissions** → **Grant admin consent**

Alternatively, use this admin consent URL (replace `{tenant-id}` with your Azure tenant ID):

```
https://login.microsoftonline.com/{tenant-id}/adminconsent?client_id=61f3d82d-2bf3-432a-ba1b-c056e4cf0fd0
```

## Troubleshooting

### Error: AADSTS650057 - Invalid resource

If you see this error:

> Invalid resource. The client has requested access to a resource which is not listed in the requested permissions in the client's application registration.

This means admin consent has not been granted for the RedisInsight application in your Azure tenant. Follow the "Granting Admin Consent" steps above.
