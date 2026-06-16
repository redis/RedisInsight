import { validate } from 'class-validator';
import { IsArrayIndex } from 'src/common/decorators';

class SingleIndexDto {
  @IsArrayIndex()
  index: string;
}

class MultiIndexDto {
  @IsArrayIndex({ each: true })
  indexes: string[];
}

const validateSingle = async (index: any) => {
  const dto = new SingleIndexDto();
  dto.index = index;
  return validate(dto);
};

describe('IsArrayIndex', () => {
  it.each(['0', '42', '18446744073709551614'])(
    'should pass for valid index %p',
    async (input) => {
      expect(await validateSingle(input)).toHaveLength(0);
    },
  );

  it.each([
    '-1',
    '1.5',
    'abc',
    '',
    '18446744073709551615',
    '18446744073709551616',
    42,
    undefined,
    '007',
    ' 42 ',
  ])('should fail for %p', async (input) => {
    const errors = await validateSingle(input);
    expect(errors).toHaveLength(1);
  });

  it('should fail with the documented (stable) message', async () => {
    const errors = await validateSingle('-1');
    // Consumers may match on this exact format — changing it is breaking.
    expect(errors[0].constraints).toEqual({
      ArrayIndexValidator:
        'index must be an integer string between 0 and 18446744073709551614',
    });
  });

  it('should fail with { each: true } when any element is invalid', async () => {
    const dto = new MultiIndexDto();
    dto.indexes = ['1', '-1', '3'];

    expect(await validate(dto)).toHaveLength(1);
  });

  it('should pass with { each: true } when all elements are valid', async () => {
    const dto = new MultiIndexDto();
    dto.indexes = ['1', '2', '18446744073709551614'];

    expect(await validate(dto)).toHaveLength(0);
  });
});
