/**
 * Generates invalid data based on Joi schema
 *
 * @param schema
 * @param path
 * @param cases
 */
export const generateInvalidDataArray = (schema, path = [], cases = []) => {
  if (schema._flags?.presence === 'required') {
    cases.push({ path, value: undefined });
  }

  const allowedValues = [];
  if (schema._valids?._values?.size) {
    schema._valids._values.forEach((value) => allowedValues.push(value));
  }

  switch (schema.type) {
    case 'object':
      // if nested object
      if (path?.length) {
        if (!allowedValues.some((allowed) => allowed === null)) {
          cases.push({ path, value: null });
        }
        cases.push({ path, value: 'somestring' });
        cases.push({ path, value: 100 });
        cases.push({ path, value: 100.12 });
        cases.push({ path, value: true });
      }

      const keys = schema._ids._byKey;
      if (keys.size) {
        keys.forEach((key) => {
          generateInvalidDataArray(key.schema, [...path, key.id], cases);
        });
      }
      break;
    case 'array':
      // if nested array
      if (path?.length) {
        if (!allowedValues.some((allowed) => allowed === null)) {
          cases.push({ path, value: null });
        }
        cases.push({ path, value: 'somestring' });
        cases.push({ path, value: 100 });
        cases.push({ path, value: 100.12 });
        cases.push({ path, value: true });
        // cases.push({ path, value: { some: 'object' } });
      }

      const items = schema.$_terms.items;
      if (items.length) {
        items.forEach((item) => {
          generateInvalidDataArray(item, [...path, 0], cases);
        });
      }
      break;
    case 'string':
      [null, 100, 100.12, true, { some: 'object' }, ['some', 'array']].map(
        (value) => {
          if (!allowedValues.some((allowed) => allowed === value)) {
            cases.push({ path, value });
          }
        },
      );

      // check for additional rules
      if (schema._singleRules?.size) {
        schema._singleRules.forEach((rule) => {
          switch (rule.name) {
            case 'min':
              cases.push({ path, value: 'a'.repeat(rule.args.limit - 1) });
              break;
            case 'max':
              cases.push({ path, value: 'a'.repeat(rule.args.limit + 1) });
              break;
            default:
              throw new Error(
                `Unsupported rule ${rule.name}. Need to implement...`,
              );
          }
        });
      }
      break;
    case 'number':
      [null, 'stringvalue', true, { some: 'object' }, ['some', 'array']].map(
        (value) => {
          if (!allowedValues.some((allowed) => allowed === value)) {
            cases.push({ path, value });
          }
        },
      );

      // check for additional rules
      if (schema._singleRules?.size) {
        schema._singleRules.forEach((rule) => {
          switch (rule.name) {
            case 'integer':
              cases.push({ path, value: 11.11 });
              break;
            case 'min':
              cases.push({ path, value: rule.args.limit - 1 });
              break;
            case 'max':
              cases.push({ path, value: rule.args.limit + 1 });
              break;
            default:
              throw new Error(
                `Unsupported rule ${rule.name}. Need to implement...`,
              );
          }
        });
      }
      break;
    case 'boolean':
      [
        null,
        'stringvalue',
        100,
        100.12,
        { some: 'object' },
        ['some', 'array'],
      ].map((value) => {
        if (!allowedValues.some((allowed) => allowed === value)) {
          cases.push({ path, value });
        }
      });
      break;
    case 'any':
      // ignore "any" type
      break;
    default:
      throw new Error(
        `Data generation doesn't support ${schema.type}. Need to implement...`,
      );
  }

  return cases;
};
