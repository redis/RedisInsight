const RedisDatabases = {
  text: 'Redis Databases',
  href: '/',
}

export interface BrowserPageOptions {
  connectedInstanceName: string
  postfix?: string
  connection: string
  version: string
  user: string
}

export const BreadcrumbsLinks = {
  BrowserPage: ({
    connectedInstanceName,
    connection,
    version,
    user,
    postfix = '',
  }: BrowserPageOptions) => [
    { ...RedisDatabases },
    {
      postfix,
      text: connectedInstanceName,
      tooltipOptions: [
        {
          label: 'Database Name',
          value: connectedInstanceName + (postfix ? ` ${postfix}` : ''),
        },
        {
          label: 'Connection',
          value: connection,
        },
        {
          label: 'Version',
          value: version,
        },
        {
          label: 'Username',
          value: user,
        },
      ],
    },
  ],
}
