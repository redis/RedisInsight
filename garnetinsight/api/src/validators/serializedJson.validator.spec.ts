import { SerializedJsonValidator } from 'src/validators/serializedJson.validator';

const validator = new SerializedJsonValidator();

const toValidate = [
  {
    name: 'Boolean',
    value: true,
  },
  {
    name: 'Null',
    value: null,
  },
  {
    name: 'Number',
    value: 12,
  },
  {
    name: 'String',
    value: 'some string',
  },
  {
    name: 'Empty String',
    value: '',
  },
  {
    name: 'Object',
    value: { some: 'object', width: ['diff', 'types', 0, 1, null] },
  },
  {
    name: 'Array',
    value: ['diff', 'types', 0, 1, null, { some: 'obj' }],
  },
];

describe('SerializedJsonValidator', () => {
  toValidate.forEach((testCase) => {
    it(`return true when serialized (${testCase.name})`, () => {
      expect(validator.validate(JSON.stringify(testCase.value))).toEqual(true);
    });
  });

  toValidate.forEach((testCase) => {
    switch (testCase.name) {
      case 'Boolean':
      case 'Number':
      case 'Null':
        it(`return true when not serializes (${testCase.name})`, () => {
          expect(validator.validate(testCase.value)).toEqual(true);
        });
        break;
      default:
        it(`return false when not serializes (${testCase.name})`, () => {
          expect(validator.validate(testCase.value)).toEqual(false);
        });
    }
  });

  it('should return particular message by default', () => {
    expect(validator.defaultMessage({ property: 'path' })).toEqual(
      'path should be a correct serialized json string',
    );
  });
});
