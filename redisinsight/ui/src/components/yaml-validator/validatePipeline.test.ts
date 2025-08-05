import { get } from 'lodash'
import { validatePipeline } from './validatePipeline'
import { validateYamlSchema, validateSchema } from './validateYamlSchema'

jest.mock('./validateYamlSchema')

describe('validatePipeline', () => {
  const mockSchema = {
    config: {
      type: 'object',
      properties: {
        name: { type: 'string' },
      },
      required: ['name'],
    },
    jobs: {
      type: 'object',
      properties: {
        task: { type: 'string' },
      },
      required: ['task'],
    },
  }

  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('should return valid result when config and jobs are valid', () => {
    ;(validateYamlSchema as jest.Mock).mockImplementation(() => ({
      valid: true,
      errors: [],
    }))
    ;(validateSchema as jest.Mock).mockImplementation(() => ({
      valid: true,
      errors: [],
    }))

    const result = validatePipeline({
      config: 'name: valid-config',
      schema: mockSchema,
      monacoJobsSchema: null,
      jobNameSchema: null,
      jobs: [
        { name: 'Job1', value: 'task: job1' },
        { name: 'Job2', value: 'task: job2' },
      ],
    })

    expect(result).toEqual({
      result: true,
      configValidationErrors: [],
      jobsValidationErrors: {
        Job1: [],
        Job2: [],
      },
    })
  })

  it('should return invalid result when config is invalid', () => {
    ;(validateYamlSchema as jest.Mock).mockImplementation((_, schema) =>
      schema === get(mockSchema, 'config', null)
        ? { valid: false, errors: ["Missing required property 'name'"] }
        : { valid: true, errors: [] },
    )
    ;(validateSchema as jest.Mock).mockImplementation(() => ({
      valid: true,
      errors: [],
    }))

    const result = validatePipeline({
      config: 'invalid-config-content',
      schema: mockSchema,
      monacoJobsSchema: null,
      jobNameSchema: null,
      jobs: [{ name: 'Job1', value: 'task: job1' }],
    })

    expect(result).toEqual({
      result: false,
      configValidationErrors: ["Missing required property 'name'"],
      jobsValidationErrors: {
        Job1: [],
      },
    })
  })

  it('should return invalid result when jobs are invalid', () => {
    ;(validateYamlSchema as jest.Mock).mockImplementation((_, schema) =>
      schema === null
        ? { valid: false, errors: ["Missing required property 'task'"] }
        : { valid: true, errors: [] },
    )
    ;(validateSchema as jest.Mock).mockImplementation(() => ({
      valid: true,
      errors: [],
    }))

    const result = validatePipeline({
      config: 'name: valid-config',
      schema: mockSchema,
      monacoJobsSchema: null,
      jobNameSchema: null,
      jobs: [{ name: 'Job1', value: 'invalid-job-content' }],
    })

    expect(result).toEqual({
      result: false,
      configValidationErrors: [],
      jobsValidationErrors: {
        Job1: ["Missing required property 'task'"],
      },
    })
  })

  it('should return invalid result when both config and jobs are invalid', () => {
    ;(validateYamlSchema as jest.Mock).mockImplementation((_, schema) => {
      if (schema === get(mockSchema, 'config', null)) {
        return { valid: false, errors: ["Missing required property 'name'"] }
      }
      if (schema === null) {
        return { valid: false, errors: ["Missing required property 'task'"] }
      }
      return { valid: true, errors: [] }
    })
    ;(validateSchema as jest.Mock).mockImplementation(() => ({
      valid: true,
      errors: [],
    }))

    const result = validatePipeline({
      config: 'invalid-config-content',
      schema: mockSchema,
      monacoJobsSchema: null,
      jobNameSchema: null,
      jobs: [{ name: 'Job1', value: 'invalid-job-content' }],
    })

    expect(result).toEqual({
      result: false,
      configValidationErrors: ["Missing required property 'name'"],
      jobsValidationErrors: {
        Job1: ["Missing required property 'task'"],
      },
    })
  })

  it('should filter duplicate errors per job', () => {
    ;(validateYamlSchema as jest.Mock).mockImplementation(() => ({
      valid: false,
      errors: ['Duplicate error', 'Duplicate error'], // all the jobs get these errors
    }))
    ;(validateSchema as jest.Mock).mockImplementation(() => ({
      valid: true,
      errors: [],
    }))

    const result = validatePipeline({
      config: 'invalid-config-content',
      schema: mockSchema,
      monacoJobsSchema: null,
      jobNameSchema: null,
      jobs: [
        { name: 'Job1', value: 'invalid-job-content' },
        { name: 'Job2', value: 'invalid-job-content' },
      ],
    })

    expect(result).toEqual({
      result: false,
      configValidationErrors: ['Duplicate error'],
      jobsValidationErrors: {
        Job1: ['Duplicate error'],
        Job2: ['Duplicate error'],
      },
    })
  })

  it('should return invalid result when job name validation fails', () => {
    ;(validateYamlSchema as jest.Mock).mockImplementation(() => ({
      valid: true,
      errors: [],
    }))
    ;(validateSchema as jest.Mock).mockImplementation(() => ({
      valid: false,
      errors: ['Job name: Invalid job name'],
    }))

    const result = validatePipeline({
      config: 'name: valid-config',
      schema: mockSchema,
      monacoJobsSchema: null,
      jobNameSchema: { type: 'string', pattern: '^[a-zA-Z]+$' },
      jobs: [{ name: 'Job-1', value: 'task: job1' }],
    })

    expect(result).toEqual({
      result: false,
      configValidationErrors: [],
      jobsValidationErrors: {
        'Job-1': ['Job name: Invalid job name'],
      },
    })
  })
})
