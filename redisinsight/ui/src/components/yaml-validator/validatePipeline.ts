import { get } from 'lodash'
import { Nullable } from 'uiSrc/utils'
import { validateSchema, validateYamlSchema } from './validateYamlSchema'

interface PipelineValidationProps {
  config: string
  schema: any
  monacoJobsSchema: Nullable<object>
  jobNameSchema: Nullable<object>
  jobs: { name: string; value: string }[]
}

export const validatePipeline = ({
  config,
  schema,
  monacoJobsSchema,
  jobNameSchema,
  jobs,
}: PipelineValidationProps) => {
  const { valid: isConfigValid, errors: configErrors } = validateYamlSchema(
    config,
    get(schema, 'config', null),
  )

  const { areJobsValid, jobsErrors } = jobs.reduce<{
    areJobsValid: boolean
    jobsErrors: Record<string, Set<string>>
  }>(
    (acc, j) => {
      const validation = validateYamlSchema(j.value, monacoJobsSchema)
      const jobNameValidation = validateSchema(j.name, jobNameSchema, {
        errorMessagePrefix: 'Job name',
        includePathIntoErrorMessage: false,
      })

      if (!acc.jobsErrors[j.name]) {
        acc.jobsErrors[j.name] = new Set()
      }

      if (!validation.valid) {
        validation.errors.forEach((error) => acc.jobsErrors[j.name].add(error))
      }

      if (jobNameSchema && !jobNameValidation.valid) {
        jobNameValidation.errors.forEach((error) =>
          acc.jobsErrors[j.name].add(error),
        )
      }

      acc.areJobsValid =
        acc.areJobsValid && validation.valid && jobNameValidation.valid
      return acc
    },
    { areJobsValid: true, jobsErrors: {} },
  )

  const result = isConfigValid && areJobsValid

  return {
    result,
    configValidationErrors: [...new Set(configErrors)],
    jobsValidationErrors: Object.fromEntries(
      Object.entries(jobsErrors).map(([jobName, errors]) => [
        jobName,
        [...errors],
      ]),
    ),
  }
}
