import vectorSetCommands from 'src/modules/commands/data/vector-set.json';

describe('vector-set.json', () => {
  const entries = Object.entries(vectorSetCommands as Record<string, any>);

  it('contains the documented Vector Set commands', () => {
    const expected = [
      'VADD',
      'VSIM',
      'VEMB',
      'VDIM',
      'VCARD',
      'VREM',
      'VRANDMEMBER',
      'VLINKS',
      'VINFO',
      'VSETATTR',
      'VGETATTR',
      'VISMEMBER',
      'VRANGE',
    ];

    expect(Object.keys(vectorSetCommands as object).sort()).toEqual(
      expected.sort(),
    );
  });

  it.each(entries)(
    '%s has the required spec fields',
    (_name, command: any) => {
      expect(typeof command.summary).toBe('string');
      expect(command.summary.length).toBeGreaterThan(0);
      expect(typeof command.since).toBe('string');
      expect(command.since).toMatch(/^\d+\.\d+\.\d+$/);
      expect(command.group).toBe('vector_set');
      expect(Array.isArray(command.arguments)).toBe(true);
    },
  );
});
