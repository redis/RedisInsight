const getLetterByIndex = (index: number): string => {
  const mod = index % 26
  const pow = (index / 26) | 0
  const out = String.fromCharCode(65 + mod)
  return pow ? getLetterByIndex(pow - 1) + out : out
}

export default getLetterByIndex
