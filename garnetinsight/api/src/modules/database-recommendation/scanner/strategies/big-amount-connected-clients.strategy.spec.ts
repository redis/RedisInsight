import { BigAmountConnectedClientsStrategy } from 'src/modules/database-recommendation/scanner/strategies';

describe('BigAmountConnectedClientsStrategy', () => {
  let strategy: BigAmountConnectedClientsStrategy;

  beforeEach(() => {
    strategy = new BigAmountConnectedClientsStrategy();
  });

  describe('isRecommendationReached', () => {
    it('should return false when connectedClients less then 100', async () => {
      expect(
        await strategy.isRecommendationReached({
          version: '1',
          connectedClients: 1,
        }),
      ).toEqual({ isReached: false });
    });

    it('should return true when connectedClients more then 100', async () => {
      expect(
        await strategy.isRecommendationReached({
          version: '1',
          connectedClients: 101,
        }),
      ).toEqual({ isReached: true });
    });

    describe('cluster', () => {
      it('should return true when connectedClients more then 100 in one of the nodes', async () => {
        expect(
          await strategy.isRecommendationReached({
            version: '1',
            nodes: [
              { version: '1', connectedClients: 1 },
              { version: '2', connectedClients: 101 },
            ],
          }),
        ).toEqual({ isReached: true });
      });
    });
  });
});
