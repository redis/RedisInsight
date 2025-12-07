import { getContentByFeature } from 'uiSrc/utils/content'

const getContentByFeatureTests: any[] = [
  [
    {
      title: 'Title1',
      description: 'desc1',
    },
    {
      feature: {
        flag: true,
      },
    },
    {
      title: 'Title1',
      description: 'desc1',
    },
  ],
  [
    {
      title: 'Title1',
      description: 'desc1',
      features: {
        cloud: {
          title: 'Title2',
          description: 'desc2',
          another: 'another',
        },
      },
    },
    {
      cloud: {
        flag: false,
      },
    },
    {
      title: 'Title1',
      description: 'desc1',
      features: {
        cloud: {
          title: 'Title2',
          description: 'desc2',
          another: 'another',
        },
      },
    },
  ],
  [
    {
      title: 'Title1',
      description: 'desc1',
      features: {
        cloud: {
          title: 'Title2',
          description: 'desc2',
          another: 'another',
        },
      },
    },
    {
      cloud: {
        flag: true,
      },
    },
    {
      title: 'Title2',
      description: 'desc2',
      another: 'another',
      features: {
        cloud: {
          title: 'Title2',
          description: 'desc2',
          another: 'another',
        },
      },
    },
  ],
]

describe('getContentByFeature', () => {
  it.each(getContentByFeatureTests)(
    'for input: %s (content), %s (flags), should be output: %s',
    (content, flags, expected) => {
      expect(getContentByFeature(content, flags)).toEqual(expected)
    },
  )
})
