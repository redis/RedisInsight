import { Theme } from 'uiSrc/constants'

export interface StateContentCreateRedis {
  data: Record<string, ContentCreateRedis | Record<string, any>>
  loading: boolean
  error: string
}

export interface ContentFeatureCreateRedis {
  title: string
  description?: string
  links: Record<
    string,
    {
      altText: string
      url: string
      event?: string
    }
  >
  styles?: {
    [Theme.Dark]: Record<string, any>
    [Theme.Light]: Record<string, any>
  }
}

export interface ContentCreateRedis extends ContentFeatureCreateRedis {
  features?: {
    [key: string]: ContentFeatureCreateRedis
  }
}

export interface StateContentGuideLinks {
  data: ContentGuideLinks[]
  loading: boolean
  error: string
}

export interface ContentGuideLinks {
  title: string
  tutorialId: string
  icon: string
  description?: string
}
