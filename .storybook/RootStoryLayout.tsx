import React, { FC, PropsWithChildren } from 'react'
import { StoryContext } from '@storybook/react-vite'

export interface Parameters {
  storyLayout?: FC<PropsWithChildren<{ storyContext: StoryContext }>>
}

/**
 * Note: for use in Storybook preview config
 *
 * Define parameters.storyLayout as React component, and it will be used as root layout of the story
 */
export const RootStoryLayout = ({
  children,
  storyContext,
}: Required<PropsWithChildren<{ storyContext: StoryContext }>>) => {
  const { storyLayout } = storyContext.parameters
  if (!storyLayout) {
    return <>{children}</>
  }
  if (React.isValidElement(storyLayout)) {
    // @ts-ignore
    return React.cloneElement(storyLayout, { storyContext }, children)
  }

  const StoryLayout = storyLayout
  return <StoryLayout storyContext={storyContext}>{children}</StoryLayout>
}
