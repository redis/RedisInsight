export const mockCliAnalyticsService = () => ({
  sendClientCreatedEvent: jest.fn(),
  sendClientCreationFailedEvent: jest.fn(),
  sendClientDeletedEvent: jest.fn(),
  sendClientRecreatedEvent: jest.fn(),
  sendCommandExecutedEvent: jest.fn(),
  sendCommandErrorEvent: jest.fn(),
  sendClusterCommandExecutedEvent: jest.fn(),
  sendConnectionErrorEvent: jest.fn(),
  sendIndexInfoEvent: jest.fn(),
});

export const mockWorkbenchAnalyticsService = () => ({
  sendCommandExecutedEvents: jest.fn(),
  sendCommandExecutedEvent: jest.fn(),
  sendCommandDeletedEvent: jest.fn(),
  sendIndexInfoEvent: jest.fn(),
});

export const mockSettingsAnalyticsService = () => ({
  sendAnalyticsAgreementChange: jest.fn(),
  sendSettingsUpdatedEvent: jest.fn(),
});

export const mockPubSubAnalyticsService = () => ({
  sendMessagePublishedEvent: jest.fn(),
  sendChannelSubscribeEvent: jest.fn(),
  sendChannelUnsubscribeEvent: jest.fn(),
});
