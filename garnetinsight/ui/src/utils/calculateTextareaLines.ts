const APPROXIMATE_WIDTH_OF_SIGN = 7.05

export const calculateTextareaLines = (
  text: string,
  width: number = 1,
  signWidth = APPROXIMATE_WIDTH_OF_SIGN,
) =>
  text
    ?.split('\n')
    .reduce(
      (prev, current) => Math.ceil((current.length * signWidth) / width) + prev,
      0,
    ) || 1
