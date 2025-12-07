import { RTSStrategy } from 'src/modules/database-recommendation/scanner/strategies';

const mockTimestampName = Buffer.from('1234567891');
const mockDefaultName = Buffer.from('name');

const mockTimestampScore = 1234567891;
const mockDefaultScore = 1;

const mockDefaultMembers = {
  name: mockDefaultName,
  score: mockDefaultScore,
};

const mockTimeStampInMemberName = {
  name: mockTimestampName,
  score: mockDefaultScore,
};

const mockTimeStampInScore = {
  name: mockDefaultName,
  score: mockTimestampScore,
};

const mockKeyName = 'name';

describe('RTSStrategy', () => {
  let strategy: RTSStrategy;

  beforeEach(async () => {
    strategy = new RTSStrategy();
  });

  describe('isRecommendationReached', () => {
    it('should return false when no timestamp in member', async () => {
      const mockData = { members: [mockDefaultMembers], keyName: mockKeyName };
      expect(await strategy.isRecommendationReached(mockData)).toEqual({
        isReached: false,
      });
    });

    it('should return true when members has timestamp in memberName', async () => {
      const mockData = {
        members: [mockDefaultMembers, mockTimeStampInMemberName],
        keyName: mockKeyName,
      };
      expect(await strategy.isRecommendationReached(mockData)).toEqual({
        isReached: true,
        params: { keys: [mockKeyName] },
      });
    });

    it('should return true when members has timestamp in score', async () => {
      const mockData = {
        members: [mockDefaultMembers, mockTimeStampInScore],
        keyName: mockKeyName,
      };
      expect(await strategy.isRecommendationReached(mockData)).toEqual({
        isReached: true,
        params: { keys: [mockKeyName] },
      });
    });
  });
});
