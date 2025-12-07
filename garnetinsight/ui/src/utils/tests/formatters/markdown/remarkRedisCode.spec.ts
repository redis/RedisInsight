import { visit } from 'unist-util-visit'
import { remarkCode } from 'uiSrc/utils/formatters/markdown'

jest.mock('unist-util-visit')

const getValue = (
  meta: string,
  lang: string,
  params?: string,
  value?: string,
) =>
  `<Code label="${meta}" params="${params}" path={path} lang="${lang}">{${JSON.stringify(value)}}</Code>`

describe('remarkRedisCode', () => {
  it('should not modify codeNode if lang not redis', () => {
    const codeNode = {
      lang: 'html',
      value: '1',
      meta: '2',
    }
    // mock implementation
    ;(visit as jest.Mock).mockImplementation(
      (_tree: any, _name: string, callback: (codeNode: any) => void) => {
        callback(codeNode)
      },
    )

    const remark = remarkCode()
    remark({} as Node)
    expect(codeNode).toEqual({
      ...codeNode,
    })
  })

  it('should properly modify codeNode with lang redis', () => {
    const codeNode = {
      lang: 'redis',
      value: '1',
      meta: '2',
    }
    // mock implementation
    ;(visit as jest.Mock).mockImplementation(
      (_tree: any, _name: string, callback: (codeNode: any) => void) => {
        callback(codeNode)
      },
    )

    const remark = remarkCode()
    remark({} as Node)
    expect(codeNode).toEqual({
      ...codeNode,
      type: 'html',
      value: getValue(codeNode.meta, 'redis', undefined, '1'),
    })
  })

  it('should properly modify codeNode with any lang', () => {
    const codeNode = {
      lang: 'java',
      value: '1',
      meta: '2',
    }
    // mock implementation
    ;(visit as jest.Mock).mockImplementation(
      (_tree: any, _name: string, callback: (codeNode: any) => void) => {
        callback(codeNode)
      },
    )

    const remark = remarkCode({ allLangs: true })
    remark({} as Node)
    expect(codeNode).toEqual({
      ...codeNode,
      type: 'html',
      value: `<Code label="2" lang="java">{${JSON.stringify('1')}}</Code>`,
    })
  })

  describe('should properly modify codeNode with lang redis', () => {
    it('with auto execute param redis:[auto=true;results=group]', () => {
      const params = '[results=group]'
      const codeNode = {
        lang: `redis:${params}`,
        value: '1',
        meta: '2',
      }
      // mock implementation
      ;(visit as jest.Mock).mockImplementation(
        (_tree: any, _name: string, callback: (codeNode: any) => void) => {
          callback(codeNode)
        },
      )

      const remark = remarkCode()
      remark({} as Node)
      expect(codeNode).toEqual({
        ...codeNode,
        type: 'html',
        value: getValue(codeNode.meta, 'redis', params, '1'),
      })
    })
    it('without auto execute param redis:[results=group;pipeline=2]', () => {
      const params = '[results=group;pipeline=2]'
      const codeNode = {
        lang: `redis:${params}`,
        value: '1',
        meta: '2',
      }
      // mock implementation
      ;(visit as jest.Mock).mockImplementation(
        (_tree: any, _name: string, callback: (codeNode: any) => void) => {
          callback(codeNode)
        },
      )

      const remark = remarkCode()
      remark({} as Node)
      expect(codeNode).toEqual({
        ...codeNode,
        type: 'html',
        value: getValue(codeNode.meta, 'redis', params, '1'),
      })
    })
  })
})
