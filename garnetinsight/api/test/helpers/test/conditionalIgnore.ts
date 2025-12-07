import { before } from 'mocha';
import { get, has } from 'lodash';
import * as semverCompare from 'node-version-compare';
import { testEnv } from '../test';

/**
 * Function to run tests by condition
 * Used inside "describe" function only
 * note: add support "it" if needed
 * @param conditions
 */
export const requirements = function (...conditions) {
  before(function () {
    for (let cond of conditions) {
      switch (typeof cond) {
        case 'function':
          if (!cond()) {
            this.skip();
          }
          break;
        case 'string':
          if (!processConditionString(cond)) {
            this.skip();
          }
          break;
        default:
          throw new Error(`Unsupported condition type ${cond}`);
      }
    }
  });
};

const cmdReg = /^([?!\w\.]+)(\s?[=<>]+)?(\s?[\w\.]+)?$/;
const processConditionString = (condition: string): boolean => {
  if (!cmdReg.test(condition)) {
    throw new Error('Unsupported condition structure');
  }

  const args = condition.match(cmdReg).filter((val) => val !== undefined);

  switch (args.length) {
    case 2:
      return checkBooleanCondition(
        args[1].replace(/^!+|!+$/, ''),
        args[1][0] === '!',
      );
    case 4:
      return checkStringCondition(
        args[1].replace(/^!+|!+$/, ''),
        args[2].trim(),
        args[3].trim(),
        args[1][0] === '!',
      );
    default:
      throw new Error('Unsupported condition structure');
  }
};

const checkBooleanCondition = (path: string, inverse = false): boolean => {
  const check = !!get(testEnv, path);
  return inverse ? !check : check;
};

const checkStringCondition = (
  path: string,
  expression: string,
  targetValue: string,
  inverse = false,
): boolean => {
  if (!has(testEnv, path)) {
    throw new Error(`Test environment does not has such path: ${path}`);
  }

  const inputValue = get(testEnv, path);
  const isSemver = path.indexOf('version') > -1;
  let check: boolean;
  switch (expression) {
    case '=':
    case '==':
    case '===':
      check = compareValues(inputValue, targetValue, isSemver) === 0;
      break;
    case '>':
      check = compareValues(inputValue, targetValue, isSemver) === 1;
      break;
    case '>=':
      check = compareValues(inputValue, targetValue, isSemver) >= 0;
      break;
    case '<':
      check = compareValues(inputValue, targetValue, isSemver) === -1;
      break;
    case '<=':
      check = compareValues(inputValue, targetValue, isSemver) <= 0;
      break;
  }
  return inverse ? !check : check;
};

const compareValues = (
  inputValue: string,
  targetValue: string,
  semver: boolean = false,
): number => {
  if (semver) return semverCompare(inputValue, targetValue);
  if (inputValue == targetValue) return 0;
  if (inputValue > targetValue) return 1;
  if (inputValue < targetValue) return -1;
};
