export const mockModal = (actual: any) => ({
  ...actual,
  RiModal: {
    ...actual.RiModal,
    Content: {
      ...actual.RiModal.Content,
      Header: {
        ...actual.RiModal.Content.Header,
        Title: jest.fn().mockReturnValue(null),
      },
    },
  },
})
