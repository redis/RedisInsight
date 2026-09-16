import { runInNewContext } from 'vm'
import { faker } from '@faker-js/faker'
import {
  prepareIframeHtml,
  importPluginScript,
  escapeHtmlAttribute,
  serializeConfigForJsonScript,
  PLUGIN_CONFIG_ELEMENT_ID,
} from 'uiSrc/plugins/pluginImport'

/**
 * Module names are supplied by the connected Redis server, so the config can
 * hold any of these. None may reach script source: `JSON.stringify` escapes
 * `"` and `\`, but not a backtick or `${`.
 */
const UNSAFE_MODULE_NAMES = [
  {
    description: 'template literal substitution',
    value: '${globalThis.__EVALUATED = 1}',
  },
  {
    description: 'backtick escaping the template literal',
    value: '`+ (globalThis.__EVALUATED = 1) + `',
  },
  {
    description: 'closing script tag',
    value: '</script><script>globalThis.__EVALUATED = 1</script>',
  },
  {
    description: 'uppercase closing script tag',
    value: '</SCRIPT><SCRIPT>globalThis.__EVALUATED = 1</SCRIPT>',
  },
  {
    description: 'closing script tag without a gt sign',
    value: '</script ',
  },
  {
    description: 'closing script tag with a tab terminator',
    value: '</script\t',
  },
  {
    description: 'script data double escape',
    value: '<!--<script>globalThis.__EVALUATED = 1',
  },
  {
    description: 'trailing backslash',
    value: 'name\\',
  },
  {
    description: 'double quote',
    value: 'name" onload="globalThis.__EVALUATED = 1',
  },
  {
    description: 'html comment opener',
    value: '<!--',
  },
  {
    description: 'line separator',
    value: `name${String.fromCharCode(0x2028)}globalThis.__EVALUATED = 1`,
  },
  {
    description: 'carriage return',
    value: `name${String.fromCharCode(13)}globalThis.__EVALUATED = 1`,
  },
  {
    description: 'null byte',
    value: `name${String.fromCharCode(0)}`,
  },
]

/** Narrowed once so the spec avoids implicit-any global access (TS7017). */
const pluginGlobals = globalThis as typeof globalThis & {
  ResizeObserver: unknown
  PluginSDK?: Record<string, unknown>
  state?: { modules?: unknown; config?: { iframeId?: string } }
  __EVALUATED?: unknown
}

const parseHtml = (html: string): Document =>
  new DOMParser().parseFromString(html, 'text/html')

const getConfigElement = (doc: Document): HTMLScriptElement | null =>
  doc.querySelector(`#${PLUGIN_CONFIG_ELEMENT_ID}`)

/** Every script element the browser would actually execute. */
const getExecutableScriptSources = (doc: Document): string[] =>
  Array.from(doc.querySelectorAll('script'))
    .filter((script) => script.getAttribute('type') !== 'application/json')
    .map((script) => script.textContent || '')

describe('pluginImport', () => {
  const buildConfig = (override: Record<string, unknown> = {}) => ({
    scriptSrc: faker.internet.url(),
    scriptPath: faker.system.filePath(),
    stylesSrc: [],
    bodyClass: 'theme_LIGHT',
    iframeId: faker.string.uuid(),
    appVersion: faker.system.semver(),
    baseUrl: faker.internet.url(),
    modules: [],
    ...override,
  })

  describe('prepareIframeHtml', () => {
    it('should render html with required tags', () => {
      const html = prepareIframeHtml({ stylesSrc: [] })
      const div = document.createElement('div')

      expect(html).toContain('<body')
      expect(html).toContain('<head')
      expect(html).toContain('globalThis.plugin = {}')

      div.innerHTML = html

      expect(div.querySelector('#app')).toBeTruthy()
    })

    it('should carry the config in a non-executable json script element', () => {
      const config = buildConfig()

      const configElement = getConfigElement(
        parseHtml(prepareIframeHtml(config)),
      )

      expect(configElement).toBeTruthy()
      expect(configElement?.getAttribute('type')).toEqual('application/json')
    })

    it('should not interpolate the config into script source', () => {
      const config = buildConfig()

      const source = getExecutableScriptSources(
        parseHtml(prepareIframeHtml(config)),
      ).join('')

      // Read at runtime, never received inline
      expect(source).toContain(PLUGIN_CONFIG_ELEMENT_ID)
      expect(source).not.toContain(config.iframeId)
      expect(source).not.toContain(config.scriptPath)
      expect(source).not.toContain(config.baseUrl)
      expect(source).not.toContain(config.appVersion)
    })

    it('should keep angle brackets out of the stringified bootstrap', () => {
      // Embedded verbatim in inline script source: a literal `<script` or
      // `<!--` anywhere in it would truncate the generated document.
      const bootstrap = importPluginScript().toString()

      expect(bootstrap).not.toMatch(/<\s*script/i)
      expect(bootstrap).not.toContain('<!--')
    })

    it('should escape the module script src attribute', () => {
      const payload = 'index.js" onerror="globalThis.__EVALUATED = 1'

      const doc = parseHtml(
        prepareIframeHtml(buildConfig({ scriptSrc: payload })),
      )
      const moduleScript = doc.querySelector('script[type="module"]')

      expect(moduleScript?.getAttribute('src')).toEqual(payload)
      expect(moduleScript?.getAttribute('onerror')).toBeNull()
    })

    it.each(UNSAFE_MODULE_NAMES)(
      'should keep a module name containing $description out of script source',
      ({ value }) => {
        const config = buildConfig({ modules: [{ name: value, version: 1 }] })

        const doc = parseHtml(prepareIframeHtml(config))

        getExecutableScriptSources(doc).forEach((source) => {
          expect(source).not.toContain(value)
          // Also the serialized form, since JSON.stringify alters `"`, `\`, `<`
          expect(source).not.toContain(JSON.stringify(value).slice(1, -1))
        })
      },
    )

    it.each(UNSAFE_MODULE_NAMES)(
      'should not execute a module name containing $description',
      ({ value }) => {
        const config = buildConfig({ modules: [{ name: value, version: 1 }] })
        const doc = parseHtml(prepareIframeHtml(config))

        // Parsing cannot prove the value never runs, so evaluate each block.
        // A fresh context per case avoids the non-configurable `state` clash.
        const sandbox: Record<string, unknown> = {
          __EVALUATED: undefined,
          ResizeObserver: function ResizeObserverStub() {
            return { observe: () => undefined }
          },
          parent: { dispatchEvent: () => undefined },
          document: {
            getElementById: () => getConfigElement(doc),
            createEvent: () => ({ initEvent: () => undefined }),
            addEventListener: () => undefined,
            createElementNS: () => undefined,
            body: { offsetHeight: 0 },
          },
        }
        sandbox.globalThis = sandbox

        getExecutableScriptSources(doc).forEach((source) => {
          try {
            runInNewContext(source, sandbox)
          } catch {
            // Unsupported in a bare context (e.g. `import()`); anything
            // interpolated would already have run by then.
          }
        })

        expect(sandbox.__EVALUATED).toBeUndefined()
        expect(pluginGlobals.__EVALUATED).toBeUndefined()
      },
    )

    it.each(UNSAFE_MODULE_NAMES)(
      'should round-trip a module name containing $description intact',
      ({ value }) => {
        const config = buildConfig({ modules: [{ name: value, version: 1 }] })

        const doc = parseHtml(prepareIframeHtml(config))
        const parsed = JSON.parse(getConfigElement(doc)?.textContent || '{}')

        // Lossless: the plugin still sees the real name
        expect(parsed.modules).toEqual([{ name: value, version: 1 }])
      },
    )

    it('should not let a module name introduce extra script elements', () => {
      const payload = '</script><script>globalThis.__EVALUATED = 1</script>'
      const baseline = parseHtml(
        prepareIframeHtml(buildConfig({ modules: [] })),
      ).querySelectorAll('script').length

      const doc = parseHtml(
        prepareIframeHtml(buildConfig({ modules: [{ name: payload }] })),
      )

      expect(doc.querySelectorAll('script')).toHaveLength(baseline)
    })

    it('should quote and escape the stylesheet href attribute', () => {
      const payload = 'styles.css" onerror="globalThis.__EVALUATED = 1'

      const doc = parseHtml(
        prepareIframeHtml(buildConfig({ stylesSrc: [payload] })),
      )
      const link = doc.querySelector('link[rel="stylesheet"]')

      expect(link?.getAttribute('href')).toEqual(payload)
      expect(link?.getAttribute('onerror')).toBeNull()
    })

    it('should escape the body class attribute', () => {
      const doc = parseHtml(
        prepareIframeHtml(
          buildConfig({ bodyClass: 'theme_LIGHT" data-injected="1' }),
        ),
      )

      expect(doc.body.getAttribute('data-injected')).toBeNull()
    })
  })

  describe('escapeHtmlAttribute', () => {
    it.each([
      { description: 'null', value: null },
      { description: 'undefined', value: undefined },
    ])('should return an empty string for $description', ({ value }) => {
      expect(escapeHtmlAttribute(value)).toEqual('')
    })

    it('should escape characters that could close the attribute', () => {
      expect(escapeHtmlAttribute('a"b<c>d&e\'f')).toEqual(
        'a&quot;b&lt;c&gt;d&amp;e&#39;f',
      )
    })
  })

  describe('serializeConfigForJsonScript', () => {
    it('should escape every angle bracket opener', () => {
      expect(serializeConfigForJsonScript({ a: '</script>' })).not.toContain(
        '<',
      )
    })

    it('should stay lossless through JSON.parse', () => {
      const config = { modules: UNSAFE_MODULE_NAMES.map(({ value }) => value) }

      expect(JSON.parse(serializeConfigForJsonScript(config))).toEqual(config)
    })

    it.each([
      { description: 'null', value: null },
      { description: 'undefined', value: undefined },
    ])('should serialize $description to an empty object', ({ value }) => {
      expect(serializeConfigForJsonScript(value)).toEqual('{}')
    })
  })
})

describe('importPluginScript', () => {
  // `state` is non-configurable, so the bootstrap runs once per realm (in
  // production each iframe is its own). Keep this to a single invocation.
  it('should read the config from the dom and set up the Plugin SDK', () => {
    pluginGlobals.ResizeObserver = jest.fn(() => ({
      observe: jest.fn(),
    })) as unknown as typeof globalThis.ResizeObserver
    const modules = [{ name: '${globalThis.__EVALUATED = 1}', version: 1 }]
    const iframeId = faker.string.uuid()
    const element = document.createElement('script')
    element.type = 'application/json'
    element.id = PLUGIN_CONFIG_ELEMENT_ID
    element.textContent = JSON.stringify({ iframeId, modules })
    document.body.appendChild(element)

    importPluginScript()()

    expect(pluginGlobals.PluginSDK).toEqual({
      setPluginLoadFailed: expect.any(Function),
      setPluginLoadSucceed: expect.any(Function),
    })
    // Reaches the plugin as inert data; the generator tests above cover
    // evaluation, which was only ever possible via its interpolation.
    expect(pluginGlobals.state?.modules).toEqual(modules)
    expect(pluginGlobals.state?.config?.iframeId).toEqual(iframeId)
  })
})
