export const isBigInt = (data: any) =>
  typeof data === 'bigint' || data instanceof BigInt
export const isArray = (data: any) => Array.isArray(data)
export const isObject = (data: any) =>
  typeof data === 'object' && data !== null && !Array.isArray(data)
