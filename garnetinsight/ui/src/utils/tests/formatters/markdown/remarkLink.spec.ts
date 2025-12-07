import { visit } from 'unist-util-visit'
import { remarkLink } from 'uiSrc/utils/formatters/markdown'

jest.mock('unist-util-visit')

describe('remarkLink', () => {
  it('should not modify codeNode if title is not Redis Cloud', () => {
    const codeNode = {
      type: 'link',
      url: 'https://mysite.com',
      children: [
        {
          type: 'text',
          value: 'Redis Stack Server',
        },
      ],
    }
    // mock implementation
    ;(visit as jest.Mock).mockImplementation(
      (_tree: any, _name: string, callback: (codeNode: any) => void) => {
        callback(codeNode)
      },
    )

    const remark = remarkLink()
    remark({} as Node)
    expect(codeNode).toEqual({
      ...codeNode,
    })
  })

  it('should properly modify codeNode with title Redis Cloud', () => {
    const codeNode = {
      title: 'Redis Cloud',
      type: 'link',
      url: 'https://mysite.com',
      children: [
        {
          type: 'text',
          value: 'Setup Redis Cloud',
        },
      ],
    }
    // mock implementation
    ;(visit as jest.Mock).mockImplementation(
      (_tree: any, _name: string, callback: (codeNode: any) => void) => {
        callback(codeNode)
      },
    )

    const remark = remarkLink()
    remark({} as Node)
    expect(codeNode).toEqual({
      ...codeNode,
      type: 'html',
      value: '<CloudLink url="https://mysite.com" text="Setup Redis Cloud" />',
    })
  })

  it('should properly modify codeNode with internal app link', () => {
    const codeNode = {
      type: 'link',
      url: 'garnetinsight:workbench',
      children: [
        {
          type: 'text',
          value: 'Workbench',
        },
      ],
    }
    // mock implementation
    ;(visit as jest.Mock).mockImplementation(
      (_tree: any, _name: string, callback: (codeNode: any) => void) => {
        callback(codeNode)
      },
    )

    const remark = remarkLink()
    remark({} as Node)
    expect(codeNode).toEqual({
      ...codeNode,
      type: 'html',
      value: '<GarnetInsightLink url="workbench" text="Workbench" size="S" />',
    })
  })
})
