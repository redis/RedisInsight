export const isStatusInformation = (status: number) =>
  status >= 100 && status < 200

export const isStatusSuccessful = (status: number) =>
  status >= 200 && status < 300

export const isStatusRedirection = (status: number) =>
  status >= 300 && status < 400

export const isStatusClientError = (status: number) =>
  status >= 400 && status < 500

export const isStatusServerError = (status: number) =>
  status >= 500 && status < 600

export const isStatusNotFoundError = (status: number) => status === 404
