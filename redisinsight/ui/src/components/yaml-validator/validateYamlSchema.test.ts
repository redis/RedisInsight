import yaml from 'js-yaml'
import { validateYamlSchema, validateSchema } from './validateYamlSchema'

const schema = {
  type: 'object',
  properties: {
    name: { type: 'string' },
    version: { type: 'string', pattern: '^[0-9]+\\.[0-9]+\\.[0-9]+$' },
  },
  required: ['name', 'version'],
}

describe('validateYamlSchema', () => {
  it('should return valid for correctly formatted YAML', () => {
    const yamlContent = `
      name: my-app
      version: 1.0.0
    `
    expect(validateYamlSchema(yamlContent, schema)).toEqual({
      valid: true,
      errors: [],
    })
  })

  it('should return error for missing required fields', () => {
    const yamlContent = `
      name: my-app
    `
    expect(validateYamlSchema(yamlContent, schema)).toEqual({
      valid: false,
      errors: expect.arrayContaining([
        expect.stringContaining("must have required property 'version'"),
      ]),
    })
  })

  it('should return error for invalid version format', () => {
    const yamlContent = `
      name: my-app
      version: abc
    `
    expect(validateYamlSchema(yamlContent, schema)).toEqual({
      valid: false,
      errors: expect.arrayContaining([
        expect.stringContaining('must match pattern'),
      ]),
    })
  })

  it('should return empty errors when schema is empty (accept all YAML)', () => {
    const yamlContent = `
      anyKey: anyValue
    `
    const emptySchema = {}
    expect(validateYamlSchema(yamlContent, emptySchema)).toEqual({
      valid: true,
      errors: [],
    })
  })

  it('should return YAML syntax error for invalid YAML format', () => {
    const yamlContent = `
      name: my-app
      version
    ` // Missing colon (:) for "version"
    const result = validateYamlSchema(yamlContent, schema)

    expect(result.valid).toBe(false)
    expect(result.errors.length).toBeGreaterThan(0)
    expect(result.errors[0]).toContain('Error:')
  })

  it('should handle YAML parsing errors gracefully', () => {
    jest.spyOn(yaml, 'load').mockImplementation(() => {
      throw new yaml.YAMLException('Simulated parsing error')
    })

    const result = validateYamlSchema('invalid yaml content', schema)

    expect(result.valid).toBe(false)
    expect(result.errors.length).toBeGreaterThan(0)
    expect(result.errors[0]).toContain('Error:')

    jest.restoreAllMocks()
  })

  it('should handle unknown errors gracefully', () => {
    jest.spyOn(yaml, 'load').mockImplementation(() => {
      throw new Error('Unexpected failure')
    })

    expect(validateYamlSchema('name: test', schema)).toEqual({
      valid: false,
      errors: ['Error: unknown error'],
    })

    jest.restoreAllMocks()
  })
})

describe('validateSchema with ValidationConfig', () => {
  const testSchema = {
    type: 'object',
    properties: {
      name: { type: 'string' },
      nested: {
        type: 'object',
        properties: {
          value: { type: 'number' }
        },
        required: ['value']
      }
    },
    required: ['name']
  }

  const invalidData = {
    nested: {
      value: 'not-a-number'
    }
    // missing required 'name' field
  }

  describe('default ValidationConfig', () => {
    it('should use default error message prefix "Error:"', () => {
      const result = validateSchema(invalidData, testSchema)
      
      expect(result.valid).toBe(false)
      expect(result.errors).toEqual(
        expect.arrayContaining([
          expect.stringContaining('Error:')
        ])
      )
    })

    it('should include path information by default', () => {
      const result = validateSchema(invalidData, testSchema)
      
      expect(result.valid).toBe(false)
      expect(result.errors).toEqual(
        expect.arrayContaining([
          expect.stringContaining('(at root)'),
          expect.stringContaining('(at /nested/value)')
        ])
      )
    })
  })

  describe('custom ValidationConfig', () => {
    it('should use custom error message prefix', () => {
      const config = { errorMessagePrefix: 'Custom Prefix:' }
      const result = validateSchema(invalidData, testSchema, config)
      
      expect(result.valid).toBe(false)
      expect(result.errors).toEqual(
        expect.arrayContaining([
          expect.stringContaining('Custom Prefix:')
        ])
      )
      expect(result.errors).not.toEqual(
        expect.arrayContaining([
          expect.stringContaining('Error:')
        ])
      )
    })

    it('should exclude path information when includePathIntoErrorMessage is false', () => {
      const config = { includePathIntoErrorMessage: false }
      const result = validateSchema(invalidData, testSchema, config)
      
      expect(result.valid).toBe(false)
      expect(result.errors).not.toEqual(
        expect.arrayContaining([
          expect.stringContaining('(at ')
        ])
      )
    })

    it('should use both custom prefix and exclude path information', () => {
      const config = { 
        errorMessagePrefix: 'Custom Error:', 
        includePathIntoErrorMessage: false 
      }
      const result = validateSchema(invalidData, testSchema, config)
      
      expect(result.valid).toBe(false)
      expect(result.errors).toEqual(
        expect.arrayContaining([
          expect.stringContaining('Custom Error:')
        ])
      )
      expect(result.errors).not.toEqual(
        expect.arrayContaining([
          expect.stringContaining('(at ')
        ])
      )
    })

    it('should handle empty string as error message prefix', () => {
      const config = { errorMessagePrefix: '' }
      const result = validateSchema(invalidData, testSchema, config)
      
      expect(result.valid).toBe(false)
      expect(result.errors.length).toBeGreaterThan(0)
      // Should not start with "Error:" but with the actual error message
      expect(result.errors[0]).not.toMatch(/^Error:/)
    })
  })

  describe('ValidationConfig with exceptions', () => {
    it('should use custom error prefix for unknown errors', () => {
      const mockSchema = null // This will cause an error in AJV
      const config = { errorMessagePrefix: 'Schema Error:' }
      
      const result = validateSchema({}, mockSchema, config)
      
      expect(result.valid).toBe(false)
      expect(result.errors).toEqual(['Schema Error: unknown error'])
    })

    it('should use default error prefix for unknown errors when no config provided', () => {
      const mockSchema = null // This will cause an error in AJV
      
      const result = validateSchema({}, mockSchema)
      
      expect(result.valid).toBe(false)
      expect(result.errors).toEqual(['Error: unknown error'])
    })
  })

  describe('edge cases', () => {
    it('should handle valid data with custom config', () => {
      const validData = { name: 'test', nested: { value: 42 } }
      const config = { 
        errorMessagePrefix: 'Custom Error:', 
        includePathIntoErrorMessage: false 
      }
      
      const result = validateSchema(validData, testSchema, config)
      
      expect(result).toEqual({
        valid: true,
        errors: []
      })
    })

    it('should handle undefined config properties gracefully', () => {
      const config = { 
        errorMessagePrefix: undefined, 
        includePathIntoErrorMessage: undefined 
      }
      const result = validateSchema(invalidData, testSchema, config)
      
      expect(result.valid).toBe(false)
      // Should use defaults when undefined
      expect(result.errors).toEqual(
        expect.arrayContaining([
          expect.stringContaining('Error:'),
          expect.stringContaining('(at ')
        ])
      )
    })
  })
})
