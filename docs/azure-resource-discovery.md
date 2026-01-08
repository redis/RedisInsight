# Azure Resource Discovery

We query the Azure Resource Manager API to find all Redis databases the user has access to.

## What We Query

1. **All subscriptions** the user can access
   - `GET /subscriptions`

2. **Azure Cache for Redis** (`Microsoft.Cache/redis`) - Standard/Premium tiers
   - `GET /subscriptions/{subscriptionId}/providers/Microsoft.Cache/redis`

3. **Azure Managed Redis** (`Microsoft.Cache/redisEnterprise`) - Enterprise clusters and their databases
   - `GET /subscriptions/{subscriptionId}/providers/Microsoft.Cache/redisEnterprise`
   - `GET .../redisEnterprise/{clusterName}/databases`

## Filters

No filters are applied. Azure RBAC determines what the user can see.

## Example

A user with access to 2 subscriptions:

1. Query subscriptions → returns `sub-1`, `sub-2`
2. Query `Microsoft.Cache/redis` in `sub-1` → returns `my-redis-cache`
3. Query `Microsoft.Cache/redis` in `sub-2` → returns nothing
4. Query `Microsoft.Cache/redisEnterprise` in `sub-1` → returns nothing
5. Query `Microsoft.Cache/redisEnterprise` in `sub-2` → returns `my-enterprise-cluster`
6. Query databases in `my-enterprise-cluster` → returns `default`

**Result:** User sees 2 databases: `my-redis-cache` and `my-enterprise-cluster/default`

# Naming

## Example responses

```
// Azure Cluster Raw ri-team
{
  "location": "West Europe",
   "name": "ri-team",
   "id": "/subscriptions/04a9ce47-b2fd-4461-a841-787c6192ceb8/resourceGroups/redis-insight/providers/Microsoft.Cache/redisEnterprise/ri-team",
   "type": "Microsoft.Cache/redisEnterprise",
   "kind": "v2",
   "tags": {},
   "sku": {
     "name": "Balanced_B0"
   },
   "properties": {
     "minimumTlsVersion": "1.2",
     "hostName": "ri-team.westeurope.redis.azure.net",
     "provisioningState": "Succeeded",
     "resourceState": "Running",
     "privateEndpointConnections": [],
     "highAvailability": "Enabled",
     "redundancyMode": "ZR"
   },
   "identity": {
     "type": "None"
   }
}

// [Azure Databases in ri-team]
{
  "value": [
    {
      "name": "default",
      "id": "/subscriptions/04a9ce47-b2fd-4461-a841-787c6192ceb8/resourceGroups/redis-insight/providers/Microsoft.Cache/redisEnterprise/ri-team/databases/default",
      "type": "Microsoft.Cache/redisEnterprise/databases",
      "properties": {
        "clientProtocol": "Encrypted",
        "port": 10000,
        "provisioningState": "Succeeded",
        "resourceState": "Running",
        "clusteringPolicy": "OSSCluster",
        "evictionPolicy": "NoEviction",
        "persistence": {
          "aofEnabled": false,
          "rdbEnabled": false,
          "aofFrequency": null,
          "rdbFrequency": null
        },
        "keySpaceNotification": "",
        "deferUpgrade": "NotDeferred",
        "redisVersion": "7.4",
        "accessKeysAuthentication": "Disabled"
      }
    }
  ]
}
```

nate-4 -> Azure Managed Redis (Redis Cluster)
default -> database name
so, we drop default as there is always 1 db (for now)