import { IRecommendationsStatic } from 'uiSrc/slices/interfaces/recommendations'

export const MOCK_RECOMMENDATIONS: IRecommendationsStatic = {
  luaScript: {
    id: 'luaScript',
    title: 'Avoid dynamic Lua script',
    content: [
      {
        type: 'span',
        value:
          'Refrain from generating dynamic scripts, which can cause your Lua cache to grow and get out of control. Memory is consumed as scripts are loaded. If you have to use dynamic Lua scripts, then remember to track your Lua memory consumption and flush the cache periodically with a ',
      },
      {
        type: 'code-link',
        value: {
          href: 'https://redis.io/commands/script-flush/',
          name: 'SCRIPT FLUSH',
        },
      },
      {
        type: 'span',
        value:
          '. Also do not hardcode and/or programmatically generate key names in your Lua scripts because they do not work in a clustered Redis setup.',
      },
      {
        type: 'spacer',
        value: 'l',
      },
      {
        type: 'span',
        value: 'See the ',
      },
      {
        type: 'link',
        value: {
          href: 'https://redis.io/docs/interact/programmability/',
          name: 'documentation',
        },
      },
      {
        type: 'span',
        value: ' to learn more about programmability in Redis.',
      },
    ],
    badges: ['code_changes'],
  },
  useSmallerKeys: {
    id: 'useSmallerKeys',
    title: 'Use smaller keys',
    content: [
      {
        type: 'paragraph',
        value:
          'Shorten key names to optimize memory usage. Though, in general, descriptive key names are always preferred, these large key names can eat a lot of the memory.',
      },
      {
        type: 'spacer',
        value: 'l',
      },
      {
        type: 'span',
        value: 'See the ',
      },
      {
        type: 'link',
        value: {
          href: 'https://redis.io/docs/management/optimization/memory-optimization/',
          name: 'documentation',
        },
      },
      {
        type: 'span',
        value: ' for more memory optimization strategies.',
      },
    ],
    badges: ['code_changes'],
  },
  bigHashes: {
    id: 'bigHashes',
    telemetryEvent: 'shardHashes',
    title: 'Shard big hashes to small hashes',
    redisStack: true,
    tutorialId: 'ds-hashes',
    content: [
      {
        type: 'paragraph',
        value:
          'If you have a hash with a large number of field-value pairs (> 5,000), and each pair is small enough - break it into smaller hashes to optimize memory usage. Additionally, try using smaller or shortened field names.',
      },
      {
        type: 'spacer',
        value: 'l',
      },
      {
        type: 'paragraph',
        value:
          'Try the interactive tutorial to learn how to work with index and query documents modeled with hashes.',
      },
    ],
    badges: ['code_changes', 'configuration_changes'],
  },
  avoidLogicalDatabases: {
    id: 'avoidLogicalDatabases',
    title: 'Avoid using logical databases',
    content: [
      {
        type: 'paragraph',
        value:
          'Using logical databases is an anti-pattern that Salvatore Sanfilippo, the creator of Redis, once called the worst design mistake he ever made in Redis.',
      },
      {
        type: 'spacer',
        value: 'l',
      },
      {
        type: 'paragraph',
        value:
          'Although supported in Redis, logical databases are neither independent nor isolated in any other way and can freeze each other. Also, they are not supported by any clustering system (open source or Redis Enterprise clustering).',
      },
      {
        type: 'spacer',
        value: 'l',
      },
      {
        type: 'span',
        value: 'If you need a multi-tenant environment, try ',
      },
      {
        type: 'link',
        value: {
          href: 'https://redis.io/try-free/',
          name: 'Redis Cloud',
        },
      },
      {
        type: 'span',
        value:
          ', where each tenant has its own Redis database endpoint which is completely isolated from the other Redis databases.',
      },
    ],
    badges: ['code_changes'],
  },
  combineSmallStringsToHashes: {
    id: 'combineSmallStringsToHashes',
    title: 'Combine small strings to hashes',
    tutorialId: 'ds-hashes',
    content: [
      {
        type: 'span',
        value:
          'The strings data type has an overhead of about 90 bytes on a 64-bit machine, so if there is no need for different expiration values for these keys, combine small strings into a larger hash to optimize the memory usage. Also, ensure that the hash has less than ',
      },
      {
        type: 'code',
        value: 'hash-max-ziplist-entries',
      },
      {
        type: 'span',
        value: ' elements and that the size of each element is within ',
      },
      {
        type: 'code',
        value: 'hash-max-ziplist-values',
      },
      {
        type: 'span',
        value: ' bytes.',
      },
      {
        type: 'spacer',
        value: 'l',
      },
      {
        type: 'paragraph',
        value:
          'Though this approach should not be used if you need different expiration values for string keys.',
      },
      {
        type: 'spacer',
        value: 'l',
      },
      {
        type: 'span',
        value: 'See the ',
      },
      {
        type: 'link',
        value: {
          href: 'https://redis.io/docs/management/optimization/memory-optimization/',
          name: 'documentation',
        },
      },
      {
        type: 'span',
        value: ' for more memory optimization strategies.',
      },
    ],
    badges: ['code_changes'],
  },
  increaseSetMaxIntsetEntries: {
    id: 'increaseSetMaxIntsetEntries',
    title: 'Increase the set-max-intset-entries',
    content: [
      {
        type: 'paragraph',
        value:
          'Several set values with IntSet encoding exceed the set-max-intset-entries. Change the configuration in redis.conf to efficiently use the IntSet encoding. Though increasing this value will lead to an increase in the latency of set operations and CPU utilization.',
      },
      {
        type: 'spacer',
        value: 'l',
      },
      {
        type: 'span',
        value: 'Run ',
      },
      {
        type: 'code',
        value: 'INFO COMMANDSTATS',
      },
      {
        type: 'span',
        value:
          ' before and after making this change to verify the latency numbers.',
      },
      {
        type: 'spacer',
        value: 'l',
      },
      {
        type: 'span',
        value: 'See the ',
      },
      {
        type: 'link',
        value: {
          href: 'https://redis.io/docs/management/optimization/memory-optimization/',
          name: 'documentation',
        },
      },
      {
        type: 'span',
        value: ' for more memory optimization strategies.',
      },
    ],
    badges: ['configuration_changes'],
  },
  hashHashtableToZiplist: {
    id: 'hashHashtableToZiplist',
    title: 'Convert hashtable to ziplist for hashes',
    content: [
      {
        type: 'span',
        value: 'Increase ',
      },
      {
        type: 'code',
        value: 'hash-max-ziplist-entries',
      },
      {
        type: 'span',
        value: ' and/or ',
      },
      {
        type: 'code',
        value: 'hash-max-ziplist-values',
      },
      {
        type: 'spacer',
        value: 'l',
      },
      {
        type: 'span',
        value: 'If any value for a key exceeds ',
      },
      {
        type: 'code',
        value: 'hash-max-ziplist-entries',
      },
      {
        type: 'span',
        value: ' or ',
      },
      {
        type: 'code',
        value: 'hash-max-ziplist-values',
      },
      {
        type: 'span',
        value:
          ', it is stored automatically as a Hashtable instead of a Ziplist, which consumes almost double the memory. So to save the memory, increase the configurations and convert your hashtables to ziplist. The trade-off can be an increase in latency and possibly an increase in CPU utilization.',
      },
      {
        type: 'spacer',
        value: 'l',
      },
      {
        type: 'span',
        value: 'See the ',
      },
      {
        type: 'link',
        value: {
          href: 'https://redis.io/docs/management/optimization/memory-optimization/',
          name: 'documentation',
        },
      },
      {
        type: 'span',
        value: ' for more memory optimization strategies.',
      },
    ],
    badges: ['configuration_changes'],
  },
  compressHashFieldNames: {
    id: 'compressHashFieldNames',
    deprecated: true,
    title: 'Compress Hash field names',
    content: [
      {
        type: 'span',
        value:
          'Hash field name also consumes memory, so use smaller or shortened field names to reduce memory usage. ',
      },
      {
        type: 'link',
        value: {
          href: 'https://docs.redis.com/latest/ri/memory-optimizations/',
          name: 'Read more',
        },
      },
    ],
    badges: ['configuration_changes'],
  },
  compressionForList: {
    id: 'compressionForList',
    title: 'Enable compression for the list',
    content: [
      {
        type: 'paragraph',
        value:
          'If you use long lists, and mostly access elements from the head and tail only, then you can enable compression.',
      },
      {
        type: 'spacer',
        value: 'l',
      },
      {
        type: 'span',
        value: 'Set ',
      },
      {
        type: 'code',
        value: 'list-compression-depth=1',
      },
      {
        type: 'span',
        value:
          ' in redis.conf to compress every list node except the head and tail of the list. Though list operations that involve elements in the center of the list will get slower, the compression can increase CPU utilization.',
      },
      {
        type: 'spacer',
        value: 'l',
      },
      {
        type: 'span',
        value: 'Run ',
      },
      {
        type: 'code',
        value: 'INFO COMMANDSTATS',
      },
      {
        type: 'span',
        value:
          ' before and after making this change to verify the latency numbers.',
      },
      {
        type: 'spacer',
        value: 'l',
      },
      {
        type: 'span',
        value: 'See the ',
      },
      {
        type: 'link',
        value: {
          href: 'https://redis.io/docs/management/optimization/memory-optimization/',
          name: 'documentation',
        },
      },
      {
        type: 'span',
        value: ' for more memory optimization strategies.',
      },
    ],
    badges: ['configuration_changes'],
  },
  bigStrings: {
    id: 'bigStrings',
    title: 'Avoid large strings',
    tutorialId: 'ds-json-intro',
    content: [
      {
        type: 'span',
        value:
          'If you are working with long strings you may need to retrieve parts or split them to handle in your application. Consider modeling your data using hashes or JSON. Both data structures provide fast and efficient data retrieval via the ',
      },
      {
        type: 'link',
        value: {
          href: 'https://redis.io/docs/latest/develop/ai/search-and-query/',
          name: 'query and search capabilities',
        },
      },
      {
        type: 'span',
        value: ', natively developed in Redis, and available as part of ',
      },
      {
        type: 'link',
        value: {
          href: 'https://redis.io/docs/about/about-stack/',
          name: 'Redis Stack',
        },
      },
      {
        type: 'span',
        value: ', ',
      },
      {
        type: 'link',
        value: {
          href: 'https://redis.io/redis-enterprise-cloud/overview/',
          name: 'Redis Cloud',
        },
      },
      {
        type: 'span',
        value: ' and ',
      },
      {
        type: 'link',
        value: {
          href: 'https://redis.io/redis-enterprise-software/overview/',
          name: 'Redis Enterprise Software',
        },
      },
      {
        type: 'span',
        value: '.',
      },
      {
        type: 'spacer',
        value: 'l',
      },
      {
        type: 'paragraph',
        value:
          'Try the interactive tutorial to learn how to work with, index, and query documents modeled with JSON or hashes.',
      },
    ],
    badges: ['configuration_changes'],
  },
  zSetHashtableToZiplist: {
    id: 'zSetHashtableToZiplist',
    title: 'Convert hashtable to ziplist for sorted sets',
    content: [
      {
        type: 'span',
        value: 'Increase ',
      },
      {
        type: 'code',
        value: 'zset-max-ziplist-entries',
      },
      {
        type: 'span',
        value: ' and/or ',
      },
      {
        type: 'code',
        value: 'zset-max-ziplist-values',
      },
      {
        type: 'span',
        value: '.',
      },
      {
        type: 'spacer',
        value: 'l',
      },
      {
        type: 'span',
        value: 'If any value for a key exceeds ',
      },
      {
        type: 'code',
        value: 'zset-max-ziplist-entries',
      },
      {
        type: 'span',
        value: ' or ',
      },
      {
        type: 'code',
        value: 'zset-max-ziplist-values',
      },
      {
        type: 'span',
        value:
          ', it is stored automatically as a Hashtable instead of a Ziplist, which consumes almost double the memory. So to save the memory, increase the configurations and convert your hashtables to ziplist. The trade-off can be an increase in latency and possibly an increase in CPU utilization.',
      },
      {
        type: 'spacer',
        value: 'l',
      },
      {
        type: 'span',
        value: 'See the ',
      },
      {
        type: 'link',
        value: {
          href: 'https://redis.io/docs/management/optimization/memory-optimization/',
          name: 'documentation',
        },
      },
      {
        type: 'span',
        value: ' for more memory optimization strategies.',
      },
    ],
    badges: ['configuration_changes'],
  },
  bigSets: {
    id: 'bigSets',
    telemetryEvent: 'optimizeExistenceChecks',
    title:
      'Consider using probabilistic data structures such as Bloom Filter or HyperLogLog',
    tutorialId: 'ds-prob-intro',
    redisStack: true,
    content: [
      {
        type: 'span',
        value:
          'If you are using sets for existence checks or duplicate elimination and can trade perfect accuracy for speed and memory efficiency, consider using the ',
      },
      {
        type: 'link',
        value: {
          href: 'https://redis.io/docs/latest/develop/data-types/probabilistic/bloom-filter/',
          name: 'probabilistic data structures',
        },
      },
      {
        type: 'span',
        value: ', especially useful for big data and streaming use cases.',
      },
      {
        type: 'spacer',
        value: 'l',
      },
      {
        type: 'span',
        value: 'These capabilities are part of ',
      },
      {
        type: 'link',
        value: {
          href: 'https://redis.io/docs/about/about-stack/',
          name: 'Redis Stack',
        },
      },
      {
        type: 'span',
        value: ', ',
      },
      {
        type: 'link',
        value: {
          href: 'https://redis.io/redis-enterprise-cloud/overview/',
          name: 'Redis Cloud',
        },
      },
      {
        type: 'span',
        value: ' and ',
      },
      {
        type: 'link',
        value: {
          href: 'https://redis.io/redis-enterprise-software/overview/',
          name: 'Redis Enterprise Software',
        },
      },
      {
        type: 'span',
        value: '.',
      },
      {
        type: 'spacer',
        value: 'l',
      },
      {
        type: 'paragraph',
        value:
          'Try the interactive tutorial to learn more about the probabilistic data structures.',
      },
    ],
    badges: ['configuration_changes'],
  },
  bigAmountOfConnectedClients: {
    id: 'bigAmountOfConnectedClients',
    title: "Don't open a new connection for every request / every command",
    content: [
      {
        type: 'span',
        value: 'When the value of your ',
      },
      {
        type: 'code',
        value: 'total_connections_received',
      },
      {
        type: 'span',
        value:
          ' in the stats section is high, it usually means that your application is opening and closing a connection for every request it makes. Opening a connection is an expensive operation that adds to both client and server latency. To rectify this, consult your ',
      },
      {
        type: 'link',
        value: {
          href: 'https://redis.io/resources/clients/',
          name: 'Redis client’s',
        },
      },
      {
        type: 'span',
        value: ' documentation and configure it to use persistent connections.',
      },
    ],
    badges: ['code_changes'],
  },
  setPassword: {
    id: 'setPassword',
    title: 'Set a password',
    content: [
      {
        type: 'span',
        value: 'Protect your database by setting a password and using the ',
      },
      {
        type: 'code-link',
        value: {
          href: 'https://redis.io/commands/auth/',
          name: 'AUTH',
        },
      },
      {
        type: 'span',
        value: ' command to authenticate the connection.',
      },
      {
        type: 'spacer',
        value: 'l',
      },
      {
        type: 'span',
        value: 'See the ',
      },
      {
        type: 'link',
        value: {
          href: 'https://redis.io/docs/management/security/',
          name: 'documentation',
        },
      },
      {
        type: 'span',
        value: ' to learn more about Redis security.',
      },
    ],
    badges: ['configuration_changes'],
  },
  RTS: {
    id: 'RTS',
    telemetryEvent: 'optimizeTimeSeries',
    title:
      'Try using the Redis native time series data structure and querying capabilities',
    redisStack: true,
    tutorialId: 'ds-ts-intro',
    content: [
      {
        type: 'span',
        value:
          'If you are using sorted sets to store time series data, consider using the ',
      },
      {
        type: 'link',
        value: {
          href: 'https://redis.io/docs/latest/develop/data-types/timeseries/',
          name: 'time series capabilities',
        },
      },
      {
        type: 'span',
        value: '.',
      },
      {
        type: 'spacer',
        value: 'l',
      },
      {
        type: 'paragraph',
        value:
          'Take advantage of advanced toolings such as downsampling and aggregation to ensure a small memory footprint without impacting performance.',
      },
      {
        type: 'spacer',
        value: 'l',
      },
      {
        type: 'paragraph',
        value:
          'It also supports a flexible query language for visualization and monitoring, allows querying of different time series keys across the entire keyspace, and provides built-in connectors to popular tools.',
      },
      {
        type: 'spacer',
        value: 'l',
      },
      {
        type: 'span',
        value: 'The capabilities are part of ',
      },
      {
        type: 'link',
        value: {
          href: 'https://redis.io/docs/about/about-stack/',
          name: 'Redis Stack',
        },
      },
      {
        type: 'span',
        value: ', ',
      },
      {
        type: 'link',
        value: {
          href: 'https://redis.io/redis-enterprise-cloud/overview/',
          name: 'Redis Cloud',
        },
      },
      {
        type: 'span',
        value: ' and ',
      },
      {
        type: 'link',
        value: {
          href: 'https://redis.io/redis-enterprise-software/overview/',
          name: 'Redis Enterprise Software',
        },
      },
      {
        type: 'span',
        value: '.',
      },
      {
        type: 'spacer',
        value: 'l',
      },
      {
        type: 'span',
        value:
          'Try the interactive tutorial to learn about the time series data structure and capabilities.',
      },
    ],
    badges: ['configuration_changes'],
  },
  redisVersion: {
    id: 'redisVersion',
    telemetryEvent: 'updateDatabase',
    title: 'Upgrade your Redis database to version 6 or above',
    redisStack: true,
    content: [
      {
        type: 'paragraph',
        value:
          'Upgrade your database to version 6 or above to take advantage of the following:',
      },
      {
        type: 'list',
        value: [
          [
            {
              type: 'link',
              value: {
                href: 'https://redis.io/docs/management/security/acl/',
                name: 'access control lists (ACLs)',
              },
            },
            {
              type: 'span',
              value:
                ' that let you create users with permissions for specific actions',
            },
          ],
          [
            {
              type: 'link',
              value: {
                href: 'https://redis.io/docs/manual/client-side-caching/',
                name: 'client-side caching',
              },
            },
            {
              type: 'span',
              value: ' for high-performance services',
            },
          ],
          [
            {
              type: 'span',
              value: 'SSL support',
            },
          ],
          [
            {
              type: 'span',
              value:
                'optimized memory utilization through faster eviction of expired keys',
            },
          ],
        ],
      },
      {
        type: 'span',
        value:
          'For a quick trial of the features, spin up a free trial developer database with ',
      },
      {
        type: 'link',
        value: {
          href: 'https://redis.io/try-free/',
          name: 'Redis Cloud',
        },
      },
      {
        type: 'span',
        value: ' that also provides support for Redis Stack ',
      },
      {
        type: 'link',
        value: {
          href: 'https://redis.io/docs/latest/develop/ai/search-and-query/',
          name: 'query and search',
        },
      },
      {
        type: 'span',
        value: ', ',
      },
      {
        type: 'link',
        value: {
          href: 'https://redis.io/docs/latest/develop/data-types/json/',
          name: 'JSON',
        },
      },
      {
        type: 'span',
        value: ', ',
      },
      {
        type: 'link',
        value: {
          href: 'https://redis.io/docs/latest/develop/data-types/probabilistic/bloom-filter/',
          name: 'probabilistic data structures',
        },
      },
      {
        type: 'span',
        value: ', and ',
      },
      {
        type: 'link',
        value: {
          href: 'https://redis.io/docs/latest/develop/data-types/timeseries/',
          name: 'Time Series',
        },
      },
      {
        type: 'span',
        value: ' capabilities.',
      },
    ],
    badges: ['upgrade'],
  },
  redisSearch: {
    id: 'redisSearch',
    title: 'Optimize your query and search experience',
    deprecated: true,
    redisStack: true,
    tutorialId: 'ds-json-intro',
    content: [
      {
        type: 'link',
        value: {
          href: 'https://redis.io/docs/latest/develop/ai/search-and-query/',
          name: 'Redis Query Engine',
        },
      },
      {
        type: 'span',
        value:
          ' was designed to help address your query needs and support a better development experience when dealing with complex data scenarios. Take a look at the ',
      },
      {
        type: 'link',
        value: {
          href: 'https://redis.io/commands/?name=Ft',
          name: 'powerful API options',
        },
      },
      {
        type: 'span',
        value:
          ' and try them. Supports full-text search, wildcards, fuzzy logic, and more.',
      },
      {
        type: 'spacer',
        value: 'l',
      },
      {
        type: 'span',
        value: 'Create a ',
      },
      {
        type: 'link',
        value: {
          href: 'https://redis.io/try-free/',
          name: 'free trial Redis Stack database',
        },
      },
      {
        type: 'span',
        value:
          ' which extends the core capabilities of Redis OSS and uses modern data models and processing engines.',
      },
    ],
    badges: ['upgrade'],
  },
  searchIndexes: {
    id: 'searchIndexes',
    title:
      'Try using the indexing, querying, and full-text search, natively developed in Redis',
    redisStack: true,
    tutorialId: 'sq-intro',
    content: [
      {
        type: 'paragraph',
        value:
          'If you are using sorted sets for indexing, this may have its downsides:',
      },
      {
        type: 'list',
        value: [
          [
            {
              type: 'span',
              value:
                'limited query flexibility such as filtering, sorting, or aggregations;',
            },
          ],
          [
            {
              type: 'span',
              value:
                'the risk of outdated or incorrect entries when other applications do not properly update or maintain the index;',
            },
          ],
          [
            {
              type: 'span',
              value: 'difficulty in handling updates and deletions;',
            },
          ],
          [
            {
              type: 'span',
              value: 'lack of horizontal scaling;',
            },
          ],
          [
            {
              type: 'span',
              value:
                'increased storage requirements to store both scores and members.',
            },
          ],
        ],
      },
      {
        type: 'span',
        value: 'Consider using the ',
      },
      {
        type: 'link',
        value: {
          href: 'https://redis.io/docs/latest/develop/ai/search-and-query/',
          name: 'query and search capabilities',
        },
      },
      {
        type: 'span',
        value:
          ', natively developed in Redis, for performing text searches and complex structured queries. It offers real-time searching through synchronous indexing, ensuring read-your-writes consistency, without compromising the database performance.',
      },
      {
        type: 'spacer',
        value: 'l',
      },
      {
        type: 'span',
        value: 'The capability is part of ',
      },
      {
        type: 'link',
        value: {
          href: 'https://redis.io/docs/about/about-stack/',
          name: 'Redis Stack',
        },
      },
      {
        type: 'span',
        value: ', ',
      },
      {
        type: 'link',
        value: {
          href: 'https://redis.io/redis-enterprise-cloud/overview/',
          name: 'Redis Cloud',
        },
      },
      {
        type: 'span',
        value: ' and ',
      },
      {
        type: 'link',
        value: {
          href: 'https://redis.io/redis-enterprise-software/overview/',
          name: 'Redis Enterprise Software',
        },
      },
      {
        type: 'span',
        value: '. Also supported in an ',
      },
      {
        type: 'link',
        value: {
          href: 'https://docs.redis.com/latest/stack/search/search-active-active/',
          name: 'Active-Active setup',
        },
      },
      {
        type: 'span',
        value: '.',
      },
      {
        type: 'spacer',
        value: 'l',
      },
      {
        type: 'paragraph',
        value:
          'Try the interactive tutorial to learn how to index and query documents modeled with JSON or hashes.',
      },
    ],
    badges: ['upgrade'],
  },
  searchJSON: {
    id: 'searchJSON',
    title: 'Try indexing your JSON documents for efficient data retrieval',
    redisStack: true,
    tutorialId: 'sq-intro',
    content: [
      {
        type: 'span',
        value:
          'If you are working with JSON and need fast and efficient data retrieval, consider leveraging the ',
      },
      {
        type: 'link',
        value: {
          href: 'https://redis.io/docs/latest/develop/ai/search-and-query/',
          name: 'query and search capabilities',
        },
      },
      {
        type: 'span',
        value: ', natively developed in Redis.',
      },
      {
        type: 'spacer',
        value: 'l',
      },
      {
        type: 'paragraph',
        value:
          'With it, you can perform complex structured queries, full-text searches, aggregations, geo-filtering, and much more. It offers real-time searching through synchronous indexing, ensuring read-your-writes consistency, without compromising the database performance.',
      },
      {
        type: 'spacer',
        value: 'l',
      },
      {
        type: 'span',
        value: 'The capabilities are part of ',
      },
      {
        type: 'link',
        value: {
          href: 'https://redis.io/docs/about/about-stack/',
          name: 'Redis Stack',
        },
      },
      {
        type: 'span',
        value: ', ',
      },
      {
        type: 'link',
        value: {
          href: 'https://redis.io/redis-enterprise-cloud/overview/',
          name: 'Redis Cloud',
        },
      },
      {
        type: 'span',
        value: ' and ',
      },
      {
        type: 'link',
        value: {
          href: 'https://redis.io/redis-enterprise-software/overview/',
          name: 'Redis Enterprise Software',
        },
      },
      {
        type: 'span',
        value: '. Also supported in an ',
      },
      {
        type: 'link',
        value: {
          href: 'https://docs.redis.com/latest/stack/search/search-active-active/',
          name: 'Active-Active',
        },
      },
      {
        type: 'span',
        value: ' setup.',
      },
      {
        type: 'spacer',
        value: 'l',
      },
      {
        type: 'paragraph',
        value:
          'Try the interactive tutorial to learn how to index and query documents modeled with JSON.',
      },
    ],
  },
  stringToJson: {
    id: 'stringToJson',
    title: 'Try using our JSON native document store',
    redisStack: true,
    tutorialId: 'ds-json-intro',
    content: [
      {
        type: 'paragraph',
        value:
          'If you are using strings to store JSON documents, consider using the JSON capabilities.',
      },
      {
        type: 'spacer',
        value: 'l',
      },
      {
        type: 'paragraph',
        value: 'Primary features include:',
      },
      {
        type: 'list',
        value: [
          [
            {
              type: 'span',
              value: 'full support for the JSON standard',
            },
          ],
          [
            {
              type: 'span',
              value: 'a ',
            },
            {
              type: 'link',
              value: {
                href: 'https://redis.io/docs/latest/develop/data-types/json/path/',
                name: 'JSONPath',
              },
            },
            {
              type: 'span',
              value: ' syntax for selecting/updating elements inside documents',
            },
          ],
          [
            {
              type: 'span',
              value:
                'documents are stored as binary data in a tree structure, allowing fast access to sub-elements',
            },
          ],
          [
            {
              type: 'span',
              value: 'typed atomic operations for all JSON value types',
            },
          ],
          [
            {
              type: 'span',
              value: 'secondary indexing via the ',
            },
            {
              type: 'link',
              value: {
                href: 'https://redis.io/docs/latest/develop/ai/search-and-query/',
                name: 'query and search capabilities',
              },
            },
          ],
        ],
      },
      {
        type: 'span',
        value: 'All these capabilities are natively part of ',
      },
      {
        type: 'link',
        value: {
          href: 'https://redis.io/docs/about/about-stack/',
          name: 'Redis Stack',
        },
      },
      {
        type: 'span',
        value: ', ',
      },
      {
        type: 'link',
        value: {
          href: 'https://redis.io/redis-enterprise-cloud/overview/',
          name: 'Redis Cloud',
        },
      },
      {
        type: 'span',
        value: ' and ',
      },
      {
        type: 'link',
        value: {
          href: 'https://redis.io/redis-enterprise-software/overview/',
          name: 'Redis Enterprise Software',
        },
      },
      {
        type: 'span',
        value: '.',
      },
      {
        type: 'spacer',
        value: 'l',
      },
      {
        type: 'paragraph',
        value:
          'Try the interactive tutorial to learn how to work with index and query documents modeled with JSON.',
      },
    ],
  },
  searchVisualization: {
    id: 'searchVisualization',
    title: 'Try Workbench, the advanced command-line interface',
    tutorialId: '',
    content: [
      {
        type: 'paragraph',
        value:
          'Try Redis Insight Workbench, our advanced command-line interface with syntax highlighting, intelligent auto-complete, and the ability to work with commands in an editor mode.',
      },
      {
        type: 'spacer',
        value: 'l',
      },
      {
        type: 'span',
        value:
          'It also provides user-friendly data visualizations and support for ',
      },
      {
        type: 'link',
        value: {
          href: 'https://redis.io/docs/about/about-stack/',
          name: 'Redis Stack',
        },
      },
      {
        type: 'span',
        value: ' capabilities such as ',
      },
      {
        type: 'link',
        value: {
          href: 'https://redis.io/docs/latest/develop/data-types/json/',
          name: 'JSON',
        },
      },
      {
        type: 'span',
        value: ', ',
      },
      {
        type: 'link',
        value: {
          href: 'https://redis.io/docs/latest/develop/ai/search-and-query/',
          name: 'query and search',
        },
      },
      {
        type: 'span',
        value: ', and ',
      },
      {
        type: 'link',
        value: {
          href: 'https://redis.io/docs/latest/develop/data-types/timeseries/',
          name: 'Time Series',
        },
      },
      {
        type: 'span',
        value: '.',
      },
    ],
  },
  searchHash: {
    id: 'searchHash',
    title: 'Try indexing your hash documents to query and retrieve data',
    tutorialId: 'sq-intro',
    redisStack: true,
    content: [
      {
        type: 'span',
        value: 'If you are using hashes and would like to:',
      },
      {
        type: 'list',
        value: [
          [
            {
              type: 'span',
              value:
                'query and retrieve data based on attributes other than the primary key;',
            },
          ],
          [
            {
              type: 'span',
              value: 'sort and rank your data based on specific attributes;',
            },
          ],
          [
            {
              type: 'span',
              value:
                'perform complex structured aggregations transforming your data by grouping, sorting, and applying different functions (',
            },
            {
              type: 'link',
              value: {
                href: 'https://redis.io/docs/latest/develop/ai/search-and-query/',
                name: 'Apply Functions',
              },
            },
            {
              type: 'span',
              value: ');',
            },
          ],
        ],
      },
      {
        type: 'span',
        value: 'consider using the ',
      },
      {
        type: 'link',
        value: {
          href: 'https://redis.io/docs/latest/develop/ai/search-and-query/',
          name: 'query and search',
        },
      },
      {
        type: 'span',
        value:
          ' capabilities, natively developed in Redis. With it you can perform complex structured queries, full-text searches, aggregations, geo-filtering and much more.',
      },
      {
        type: 'spacer',
        value: 'l',
      },
      {
        type: 'paragraph',
        value:
          'It offers real-time searching through synchronous indexing, ensuring read-your-writes consistency, without compromising the database performance.',
      },
      {
        type: 'spacer',
        value: 'l',
      },
      {
        type: 'span',
        value: 'The capability is part of ',
      },
      {
        type: 'link',
        value: {
          href: 'https://redis.io/docs/about/about-stack/',
          name: 'Redis Stack',
        },
      },
      {
        type: 'span',
        value: ', ',
      },
      {
        type: 'link',
        value: {
          href: 'https://redis.io/redis-enterprise-cloud/overview/',
          name: 'Redis Cloud',
        },
      },
      {
        type: 'span',
        value: ' and ',
      },
      {
        type: 'link',
        value: {
          href: 'https://redis.io/redis-enterprise-software/overview/',
          name: 'Redis Enterprise Software',
        },
      },
      {
        type: 'span',
        value: '. Also supported in an ',
      },
      {
        type: 'link',
        value: {
          href: 'https://docs.redis.com/latest/stack/search/search-active-active/',
          name: 'Active-Active setup',
        },
      },
      {
        type: 'span',
        value: '.',
      },
      {
        type: 'spacer',
        value: 'l',
      },
      {
        type: 'span',
        value:
          'Try the interactive tutorial to learn how to work with index and query documents modeled with JSON.',
      },
    ],
    badges: ['code_changes', 'configuration_changes'],
  },
}
