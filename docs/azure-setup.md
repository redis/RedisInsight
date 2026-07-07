# Azure Managed Redis Setup (formerly Azure Cache for Redis)

## Setup Instructions

To use the Azure integration, your Azure tenant administrator may need to grant admin consent for the RedisInsight application. This is a one-time setup per Azure tenant — once done, all users in your organization can use RedisInsight with Entra ID seamlessly.

> **Which tenant?** The commands below must be run **in the home tenant of every user who signs in through RedisInsight** — this is not necessarily the tenant that owns the Azure Managed Redis resources. If your users belong to a different tenant than the one hosting the resources, see [Multi-tenant scenarios](#multi-tenant-scenarios).

> **Why is this needed?** See [Why This Setup is Required](#why-this-setup-is-required) for details on the authentication flow.

> **Running in Docker?** See [Azure Docker Setup](azure-docker-setup.md) for configuration when using custom ports or reverse proxies.

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

## Multi-tenant scenarios

By default, RedisInsight signs you in through the multi-tenant `/common` endpoint, which issues the access token against **your home tenant**. That works when your account and the Azure Managed Redis resources live in the same tenant. Two situations need extra attention:

- **Your resources are in a different tenant than your account.** The setup commands above (`az ad sp create` / `az ad app permission grant`) must exist in **your home tenant** — the tenant your user account belongs to — because that is where the token is issued. Running them only in the resource tenant is not enough and results in `AADSTS650052`.
- **You are a guest / external user of the resource tenant.** Sign in against that tenant explicitly (see [Picking a tenant](#picking-a-tenant)) so the token is issued there and its subscriptions become visible.

### Picking a tenant

When you click **Azure Managed Redis**, the sign-in dialog has an **Advanced options** section with an optional **Tenant ID** field. Enter a tenant GUID or domain (for example `contoso.onmicrosoft.com`) to authenticate against that specific tenant instead of your home tenant.

Use it when:

- Your home tenant differs from the tenant that owns the Azure Managed Redis resources, or
- You are a guest in the resource tenant and its subscriptions don't appear by default.

Leave the field blank to sign in against your home tenant (the default). The tenant you signed in with is shown on the subscriptions screen; to switch tenants, sign in again with a different tenant.

## Troubleshooting

### Error: AADSTS650057 - Invalid resource

If you see this error:

> Invalid resource. The client has requested access to a resource which is not listed in the requested permissions in the client's application registration.

This means admin consent has not been granted for the RedisInsight application in your Azure tenant. Follow the "Granting Admin Consent (Azure CLI)" steps above.

### Error: AADSTS65006 - No entitlements matching required permissions

If you see this error:

> Resource 'acca5fbb-...' had no entitlements matching required permissions configured on the required resource access for client '61f3d82d-...'.

This means the Azure Cache for Redis API permissions haven't been granted. Run these commands:

```bash
# Create the service principal for Azure Cache for Redis API
az ad sp create --id acca5fbb-b7e4-4009-81f1-37e38fd66d78

# Grant permission
az ad app permission grant \
  --id 61f3d82d-2bf3-432a-ba1b-c056e4cf0fd0 \
  --api acca5fbb-b7e4-4009-81f1-37e38fd66d78 \
  --scope user_impersonation
```

### Error: AADSTS650052 - Lacks a service principal

If you see this error:

> The app is trying to access a service that your organization lacks a service principal for.

Run these commands to create the required service principals:

```bash
az ad sp create --id 61f3d82d-2bf3-432a-ba1b-c056e4cf0fd0
az ad sp create --id acca5fbb-b7e4-4009-81f1-37e38fd66d78
```

Then grant the permissions using the CLI commands above.

> **Multi-tenant note:** This error most often means the service principals exist in the *resource* tenant but not in the tenant the token was issued for. The token is issued for your **home tenant** by default — so the commands must be run there. If your resources are in a different tenant, either run the setup in your home tenant, or sign in against the resource tenant using the **Tenant ID** field (see [Picking a tenant](#picking-a-tenant)).

## Why This Setup is Required

### How RedisInsight Authenticates

RedisInsight uses **PKCE (Proof Key for Code Exchange)** OAuth 2.0 flow to authenticate with Azure Cache for Redis. This is a secure, public client flow recommended by Microsoft for desktop and web applications because:

- **No client secrets** — We don't store any secrets in the distributed application
- **User-delegated access** — Tokens are scoped to what you can access, not a service account
- **Short-lived tokens** — Access tokens expire and are refreshed automatically

### Why Admin Consent is Needed

Azure uses a multi-tenant security model. When you sign in through RedisInsight:

1. RedisInsight redirects you to Microsoft's login page
2. You authenticate with your Azure credentials
3. Azure checks if RedisInsight is allowed to request tokens on behalf of users in your tenant

Because RedisInsight is a third-party application, an Azure AD administrator must grant consent before users in your organization can authenticate through it. This gives organizations control over which applications can access their resources.

### What Permissions Does RedisInsight Get?

RedisInsight uses **delegated permissions** with `user_impersonation` scope. This means:

- RedisInsight can only access resources **you** already have access to
- We cannot access anything beyond your own permissions
- All access is auditable in your Azure AD logs

| Permission                                        | Purpose                                              |
| ------------------------------------------------- | ---------------------------------------------------- |
| `https://redis.azure.com/user_impersonation`      | Authenticate to Azure Cache for Redis on your behalf |
| `https://management.azure.com/user_impersonation` | Auto-discover your Azure Redis instances             |
| `offline_access`                                  | Refresh tokens without re-prompting for login        |
| `openid`, `profile`                               | Standard user info (name, email)                     |
