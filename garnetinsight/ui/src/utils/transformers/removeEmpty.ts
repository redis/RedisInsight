export default function removeEmpty(obj: any) {
  Object.keys(obj).forEach((key) => {
    // eslint-disable-next-line @typescript-eslint/no-unused-expressions
    ;(obj[key] && typeof obj[key] === 'object' && removeEmpty(obj[key])) ||
      ((obj[key] === '' || obj[key] === null) && delete obj[key])
  })
  return obj
}
