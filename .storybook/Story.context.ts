import { createContext, useContext } from 'react'
import { StoryContext } from '@storybook/react-vite'

const Context = createContext<StoryContext | null>(null)

export const StoryContextProvider = Context.Provider

export const useStoryContext = () => {
  const context = useContext(Context)
  if (!context)
    throw new Error('useStoryContext must be used within StoryContextProvider')
  return context
}

export const useStoryParameter = <T>(parameterKey: string): T | undefined =>
  useStoryContext().parameters[parameterKey]
