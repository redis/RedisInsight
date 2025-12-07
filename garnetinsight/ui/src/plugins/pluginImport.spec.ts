import {
  prepareIframeHtml,
  importPluginScript,
} from 'uiSrc/plugins/pluginImport'

describe('pluginImport', () => {
  it('should render html with required tags', () => {
    const html = prepareIframeHtml({ stylesSrc: [] })
    const div = document.createElement('div')

    expect(html).toContain('<body')
    expect(html).toContain('<head')
    expect(html).toContain('globalThis.plugin = {}')

    div.innerHTML = html

    expect(div.querySelector('#app')).toBeTruthy()
  })
})

describe('importPluginScript', () => {
  it('should set proper methods to Plugin SDK', () => {
    globalThis.ResizeObserver = jest.fn(() => ({
      observe: jest.fn(),
    }))

    importPluginScript()(JSON.stringify({}))
    expect(globalThis.PluginSDK).toEqual({
      setPluginLoadFailed: expect.any(Function),
      setPluginLoadSucceed: expect.any(Function),
    })
  })
})
