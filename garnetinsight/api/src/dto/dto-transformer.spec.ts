import { pickDefinedAgreements } from 'src/dto/dto-transformer';

describe('pickDefinedAgreements', () => {
  it('should pick only agreements that defined in specification', () => {
    const value = new Map([
      ['eula', true],
      ['undefined', true],
    ]);

    const output = pickDefinedAgreements({ value });

    expect(output).toEqual(new Map([['eula', true]]));
  });
});
