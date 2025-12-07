import { mockUserId } from 'src/__mocks__/user';

export const mockSessionId = '1';

export const mockInitSession = {
  id: mockSessionId,
  userId: mockUserId,
  data: {},
};

export const mockSessionCustomData = {
  custom: {
    field: 1,
    nested: {
      name: 'object0',
      value: true,
    },
    arrayField: [
      {
        name: 'object1',
      },
      {
        name: 'object2',
        array: ['some', 'array'],
      },
    ],
  },
};

export const mockSessionStorage = jest.fn(() => ({
  createSession: jest.fn().mockResolvedValue(mockInitSession),
  getSession: jest.fn().mockResolvedValue(mockInitSession),
  updateSessionData: jest.fn().mockResolvedValue(mockInitSession),
  deleteSession: jest.fn(),
}));
export const mockSessionProvider = mockSessionStorage;
export const mockSessionService = mockSessionStorage;
