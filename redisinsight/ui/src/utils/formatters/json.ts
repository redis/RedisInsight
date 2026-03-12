import JSONBigInt from 'json-bigint'

const JSONParser = JSONBigInt({
  useNativeBigInt: true,
  protoAction: 'preserve',
  constructorAction: 'preserve',
})

export const reSerializeJSON = (val: string, space?: number) => {
  try {
    const json = JSONParser.parse(val)
    return JSONParser.stringify(json, null, space)
  } catch (e) {
    return val
  }
}
