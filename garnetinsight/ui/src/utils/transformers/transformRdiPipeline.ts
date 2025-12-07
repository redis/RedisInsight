import yaml, { YAMLException } from 'js-yaml'
import { isEmpty } from 'lodash'
import {
  IConnectionResult,
  IPipeline,
  IPipelineJSON,
  IYamlFormatError,
  TestConnectionStatus,
  TransformResult,
} from 'uiSrc/slices/interfaces'

export const yamlToJson = (value: string, onError: (e: string) => void) => {
  try {
    return yaml.load(value) || {}
  } catch (e) {
    if (e instanceof YAMLException) {
      onError(e.reason)
    }
    return undefined
  }
}

export const pipelineToYaml = (pipeline: IPipelineJSON) => ({
  config: isEmpty(pipeline?.config) ? '' : yaml.dump(pipeline.config),
  jobs: pipeline?.jobs
    ? Object.entries(pipeline.jobs)?.map(([key, value]) => ({
        name: key,
        value: yaml.dump(value),
      }))
    : [],
})

export const pipelineToJson = (
  { config, jobs }: IPipeline,
  onError: (errors: IYamlFormatError[]) => void,
) => {
  const result: IPipelineJSON = {
    config: {},
    jobs: [],
  }
  const errors: IYamlFormatError[] = []

  result.config =
    yamlToJson(config, (msg) => errors.push({ filename: 'config', msg })) || {}

  result.jobs = jobs.reduce<{ [key: string]: unknown }>((acc, job) => {
    acc[job.name] =
      yamlToJson(job.value, (msg) =>
        errors.push({ filename: job.name, msg }),
      ) || {}
    return acc
  }, {})

  if (errors.length) {
    onError(errors)
    return undefined
  }

  return result
}

export const transformConnectionResults = (
  results: IConnectionResult,
): TransformResult => {
  const result: TransformResult = {
    target: { success: [], fail: [] },
    source: { success: [], fail: [] },
  }

  if (!results?.targets) {
    return result
  }

  try {
    Object.entries(results.targets).forEach(([target, details]) => {
      if (details.status === TestConnectionStatus.Success) {
        result.target.success.push({ target })
      } else if (details.status === TestConnectionStatus.Fail) {
        const errorMessage = details.error?.message || 'Error'
        result.target.fail.push({ target, error: errorMessage })
      }
    })
  } catch (error) {
    // ignore
  }

  if (!results?.sources) {
    return result
  }

  Object.entries(results.sources).forEach(([source, details]) => {
    if (details.connected) {
      result.source.success.push({ target: source })
    } else {
      const errorMessage = details.error || 'Error'
      result.source.fail.push({ target: source, error: errorMessage })
    }
  })

  return result
}
