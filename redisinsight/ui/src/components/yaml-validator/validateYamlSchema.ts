import yaml, { YAMLException } from 'js-yaml'
import Ajv from 'ajv'

type ValidationConfig = {
  errorMessagePrefix?: string
  includePathIntoErrorMessage?: boolean
}

export const validateSchema = (
  parsed: any,
  schema: any,
  config: ValidationConfig = {},
): { valid: boolean; errors: string[] } => {
  const errorMessagePrefix = config.errorMessagePrefix ?? 'Error:'
  const includePathIntoErrorMessage = config.includePathIntoErrorMessage ?? true

  try {
    const ajv = new Ajv({
      strict: false,
      unicodeRegExp: false,
      allErrors: true,
    })

    const validate = ajv.compile(schema)
    const valid = validate(parsed)

    if (!valid) {
      const errors = validate.errors?.map(
        (err) => {
          const pathMessage = includePathIntoErrorMessage ? ` (at ${err.instancePath || 'root'})` : ''
          return `${[errorMessagePrefix]} ${err.message}${pathMessage}`
        }
      )
      return { valid: false, errors: errors || [] }
    }

    return { valid: true, errors: [] }
  } catch (e) {
    return { valid: false, errors: [`${errorMessagePrefix} unknown error`] }
  }
}

export const validateYamlSchema = (
  content: string,
  schema: any,
): { valid: boolean; errors: string[] } => {
  try {
    const parsed = yaml.load(content) as object

    return validateSchema(parsed, schema)
  } catch (e) {
    if (e instanceof YAMLException) {
      return { valid: false, errors: [`Error: ${e.reason}`] }
    }
    return { valid: false, errors: ['Error: unknown error'] }
  }
}
