import { isEqual } from 'lodash'
import { load } from 'js-yaml'

const isEqualPipelineFile = (cur: string, prev: string = '') => {
  try {
    return isEqual(load(cur), load(prev))
  } catch (e) {
    return false
  }
}

export default isEqualPipelineFile
