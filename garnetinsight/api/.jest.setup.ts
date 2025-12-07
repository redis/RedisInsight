import 'reflect-metadata';
// Workaround for @Type test coverage
jest.mock('class-transformer', () => {
  return {
    ...(jest.requireActual('class-transformer') as Object),
    Type: (f: Function) =>
      f() && jest.requireActual('class-transformer').Type(f),
  };
});
