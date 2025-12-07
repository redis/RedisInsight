export const bufferFormatRangeItems = (
  items: any[],
  startIndex: number,
  lastIndex: number,
  formatItem: (item: any) => any,
): any[] => {
  const newItems = []
  if (lastIndex >= startIndex) {
    for (let index = startIndex; index <= lastIndex; index++) {
      if (!items[index]) return newItems
      newItems.push(formatItem(items[index]))
    }
  }

  return newItems
}
