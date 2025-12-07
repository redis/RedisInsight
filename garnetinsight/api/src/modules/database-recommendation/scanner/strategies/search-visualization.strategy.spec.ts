import { SearchVisualizationStrategy } from 'src/modules/database-recommendation/scanner/strategies';

const isRecommendationReachedTests: any[] = [
  ['test', { isReached: false }],
  ['info', { isReached: false }],
  ['123', { isReached: false }],
  ['aoeutaoheu', { isReached: false }],
  ['ft.search', { isReached: true }],
  ['FT.Search', { isReached: true }],
  ['FT.INFO test 123', { isReached: true }],
  ['FT.PROFILE 123', { isReached: true }],
];

describe('SearchVisualizationStrategy', () => {
  let strategy: SearchVisualizationStrategy;

  beforeEach(async () => {
    strategy = new SearchVisualizationStrategy();
  });

  describe('isRecommendationReached', () => {
    it.each(isRecommendationReachedTests)(
      'for input: %s (command), should be output: %s',
      async (command, expected) => {
        const result = await strategy.isRecommendationReached(command);
        expect(result).toEqual(expected);
      },
    );
  });
});
