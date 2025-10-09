import { cloneDeep } from 'lodash'
import React from 'react'
import { instance, mock } from 'ts-mockito'
import { cleanup, mockedStore, render, screen } from 'uiSrc/utils/test-utils'
import { getModule, truncateText } from 'uiSrc/utils'
import { DATABASE_LIST_MODULES_TEXT } from 'uiSrc/slices/interfaces'
import ShortInstanceInfo, { Props } from './ShortInstanceInfo'

const mockedProps = mock<Props>()

let store: typeof mockedStore
beforeEach(() => {
  cleanup()
  store = cloneDeep(mockedStore)
  store.clearActions()
})

jest.mock('uiSrc/services', () => ({
  ...jest.requireActual('uiSrc/services'),
  sessionStorageService: {
    set: jest.fn(),
    get: jest.fn(),
  },
}))

describe('ShortInstanceInfo', () => {
  it('should render', () => {
    expect(
      render(
        <ShortInstanceInfo
          info={{ ...instance(mockedProps) }}
          modules={[]}
          databases={2}
        />,
      ),
    ).toBeTruthy()
  })

  it('should render database modules', () => {
    const modules = [
      { name: 'redisgears' },
      { name: 'redisearch', version: '123.23' },
    ]
    render(
      <ShortInstanceInfo
        info={{ ...instance(mockedProps) }}
        modules={modules}
        databases={2}
      />,
    )

    modules.forEach(({ name, version }) => {
      expect(screen.getByTestId(`module_${name}`)).toBeInTheDocument()
      expect(screen.getByTestId(`module_${name}`)).toHaveTextContent(
        `${truncateText(getModule(name)?.name || DATABASE_LIST_MODULES_TEXT[name] || name, 50)}${version ? ` v.${version}` : ''}`,
      )
    })
  })
})
