import { Nullable } from 'uiSrc/utils'

const toRedisCodeBlock = (query: Nullable<string>) => {
  if (!query) return null

  return `\`\`\`redis\n${query}\n\`\`\``
}

export default toRedisCodeBlock
