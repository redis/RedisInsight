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

### Granting Admin Consent (Azure CLI)

Run these commands in [Azure Cloud Shell](https://portal.azure.com/#cloudshell/) or your local terminal with Azure CLI installed:

```bash
# Step 1: Create the service principals in your tenant
# 61f3d82d-... = RedisInsight application
# acca5fbb-... = Azure Cache for Redis API (AzureRedisCacheAadApp)
az ad sp create --id 61f3d82d-2bf3-432a-ba1b-c056e4cf0fd0
az ad sp create --id acca5fbb-b7e4-4009-81f1-37e38fd66d78

# Step 2: Grant permissions
# Grant RedisInsight access to Azure Cache for Redis API
az ad app permission grant \
  --id 61f3d82d-2bf3-432a-ba1b-c056e4cf0fd0 \
  --api acca5fbb-b7e4-4009-81f1-37e38fd66d78 \
  --scope user_impersonation

# Grant RedisInsight access to Azure Resource Manager API
# 797f4846-... = Azure Resource Manager (for autodiscovery)
az ad app permission grant \
  --id 61f3d82d-2bf3-432a-ba1b-c056e4cf0fd0 \
  --api 797f4846-ba00-4fd7-ba43-dac1f8f63013 \
  --scope user_impersonation

# Step 3: Verify permissions were granted
az ad app permission list-grants \
  --id 61f3d82d-2bf3-432a-ba1b-c056e4cf0fd0 \
  --show-resource-name
```

You should see `AzureRedisCacheAadApp` and `Windows Azure Service Management API` (or `Azure Resource Manager`) in the output.

## Troubleshooting

### Error: AADSTS650057 - Invalid resource

If you see this error:

> Invalid resource. The client has requested access to a resource which is not listed in the requested permissions in the client's application registration.

This means admin consent has not been granted for the RedisInsight application in your Azure tenant. Follow the "Using Azure CLI" steps above.

### Error: AADSTS650052 - Lacks a service principal

If you see this error:

> The app is trying to access a service that your organization lacks a service principal for.

Run these commands to create the required service principals:

```bash
az ad sp create --id 61f3d82d-2bf3-432a-ba1b-c056e4cf0fd0
az ad sp create --id acca5fbb-b7e4-4009-81f1-37e38fd66d78
```

Then grant the permissions using the CLI commands above.
