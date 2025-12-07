import { describe, it, before, after, beforeEach } from 'mocha';
import * as util from 'util';
import * as _ from 'lodash';
import * as path from 'path';
import * as fs from 'fs';
import * as fsExtra from 'fs-extra';
import * as chai from 'chai';
import chaiDeepEqualIgnoreUndefined from 'chai-deep-equal-ignore-undefined';
import * as nock from 'nock';
import * as Joi from 'joi';
import * as AdmZip from 'adm-zip';
import * as diff from 'object-diff';
import axios from 'axios';
import { cloneDeep, isMatch, isObject, set, isArray } from 'lodash';
import { generateInvalidDataArray } from './test/dataGenerator';
import serverConfig from 'src/utils/config';

chai.use(chaiDeepEqualIgnoreUndefined);

export { _, path, fs, fsExtra, AdmZip, serverConfig, axios, nock };
export const expect = chai.expect;
export const testEnv: Record<any, any> = {};
export { Joi, describe, it, before, after, beforeEach };

export * from './test/conditionalIgnore';
export * from './test/dataGenerator';

interface ITestCaseInput {
  endpoint: Function; // function that returns prepared supertest with url
  data?: any;
  attach?: any[];
  headers?: Record<string, string>;
  fields?: [string, string][];
  query?: any;
  statusCode?: number;
  responseSchema?: Joi.AnySchema;
  responseBody?: any;
  responseHeaders?: object;
  checkFn?: Function;
  preconditionFn?: Function;
  postCheckFn?: Function;
}

/**
 * Common validation function
 * @param ITestCaseInput
 */
export const validateApiCall = async function ({
  endpoint,
  data,
  headers,
  attach,
  fields,
  query,
  statusCode = 200,
  responseSchema,
  responseBody,
  responseHeaders,
  checkFn,
}: ITestCaseInput): Promise<any> {
  const request = endpoint();

  // data to send with POST, PUT etc
  if (data) {
    request.send(typeof data === 'function' ? data() : data);
  }

  if (headers) {
    request.set(headers);
  }

  if (attach) {
    request.attach(...attach);
  }

  if (fields?.length) {
    fields.forEach((field) => {
      request.field(...field);
    });
  }

  // data to send with url query string
  if (query) {
    request.query(query);
  }

  const response = await request;

  // custom function to check conditions
  if (checkFn) {
    await checkFn(response);
  }

  // check response body (not deep strict)
  if (responseBody) {
    checkResponseBody(response.body, responseBody);
  }

  expect(response.res.statusCode).to.eq(statusCode);

  // validate response headers if passed
  if (responseHeaders) {
    expect(response.res.headers).to.include(responseHeaders);
  }

  // validate response schema if passed
  if (responseSchema) {
    Joi.assert(response.body, responseSchema);
  }

  return response;
};

/**
 * Checks if values from "expected" persist in body
 * Can receive more fields from API ("body") but will check values from "expected" only
 *
 * @param body
 * @param expected
 */
export const checkResponseBody = (body, expected) => {
  try {
    if (isArray(expected)) {
      return expect(body).to.deep.eq(expected);
    }

    if (isObject(expected)) {
      return expect(isMatch(body, expected)).to.eql(true);
    }
    // todo: improve to support array, arrays of objects etc.
    expect(expected).to.eql(body);
  } catch (e) {
    const errorMessage =
      'Response does not includes expected value(s)' +
      '\nExpect:\n' +
      util.inspect(body, { depth: null }) +
      '\nTo include:\n' +
      util.inspect(expected, { depth: null }) +
      '\nDiff:\n' +
      util.inspect(diff(body, expected), { depth: null });

    throw new Error(errorMessage);
  }
};

const defaultValidationErrorMessages = {
  'any.required': '{#label} should not be null or undefined',
  'any.only': '{#label} must be a valid enum value',
  'array.base': '{#label} must be an array',
  'string.base': `{#label} must be a string`,
  'string.empty': `{#label} should not be null or undefined`,
  'number.base': `{#label} must be an integer number`,
  'number.integer': `{#label} must be an integer number`,
  'number.min': `{#label} must not be less than {#min}`,
  'number.max': `{#label} must not be greater than {#max}`,
  'string.min': `{#label} must be longer than or equal to {#limit} characters`,
  'string.max': `{#label} must be shorter than or equal to {#limit} characters`,
  'object.base': `must be either object or array`,
};

/**
 * Common test case for input data validation
 *
 * @param endpoint
 * @param schema
 * @param target
 */
export const validateInvalidDataTestCase = (
  endpoint,
  schema,
  target = 'data',
) => {
  return (testCase) => {
    it(testCase.name, async () => {
      await validateApiCall({
        endpoint,
        statusCode: 400,
        checkFn: badRequestCheckFn(schema, testCase[target]),
        ...testCase,
      });
    });
  };
};

/**
 * Custom check for API response for validation error
 * @param schema
 * @param data
 */
const badRequestCheckFn = (schema, data) => {
  return ({ body }) => {
    expect(body.statusCode).to.eql(400);
    expect(body.error).to.eql('Bad Request');

    // check expected error messages using validation schema
    const { error } = schema.validate(data, {
      abortEarly: true,
      errors: { wrap: { label: false } },
      messages: defaultValidationErrorMessages,
    });
    error.details.map(({ message }) => {
      expect(body.message.join()).to.have.string(message);
    });
  };
};

/**
 * Generates input data for validation test case based on Joi schema
 *
 * @param schema
 * @param validData
 * @param target
 * @param extra
 */
export const generateInvalidDataTestCases = (
  schema,
  validData,
  target = 'data',
  extra: any = {},
) => {
  return generateInvalidDataArray(schema).map(({ path, value }) => {
    return {
      name: `Validation error when ${target}: ${path.join('.')} = "${value}"`,
      [target]: path?.length ? set(cloneDeep(validData), path, value) : value,
      ...extra,
    };
  });
};

export const getMainCheckFn = (endpoint) => async (testCase) => {
  it(testCase.name, async () => {
    // additional checks before test run
    if (testCase.before) {
      await testCase.before();
    }

    await validateApiCall({
      endpoint,
      ...testCase,
    });

    // additional checks after test pass
    if (testCase.after) {
      await testCase.after();
    }
  });
};

export const sleep = (ms: number) =>
  new Promise((resolve) => setTimeout(resolve, ms));

export const JoiRedisString = Joi.alternatives().try(
  Joi.string(),
  Joi.object().keys({
    type: Joi.string().valid('Buffer').required(),
    data: Joi.array().items(Joi.number()).required(),
  }),
);
