import { v4 as uuidv4 } from 'uuid'

enum TokenType {
  INIT = 'INIT',

  EOF = 'EOF',
  ILLEGAL = 'ILLEGAL',

  UNION = 'UNION',
  INTERSECT = 'INTERSECT',
  NOT = 'NOT',
  OPTIONAL = 'OPTIONAL',
  EXACT = 'EXACT',
  TAG = 'TAG',
  VECTOR = 'VECTOR',
  FUZZY = 'FUZZY',
  WILDCARD = 'WILDCARD',
  WILDCARD_EMPTY = 'WILDCARD_EMPTY', // <WILDCARD>}\n
  PREFIX = 'PREFIX',
  GEO_EXPR = 'GEO_EXPR',
  IDS_EXPR = 'IDS_EXPR',
  LEXRANGE_EXPR = 'LEXRANGE_EXPR',
  NUMERIC = 'NUMERIC',
  LBRACE = 'LBRACE',
  RBRACE = 'RBRACE',
  LPAREN = 'LAPAREN',
  RPAREN = 'RAPAREN',
  NUMBER = 'NUMBER',
  NEW_LINE = 'NEW_LINE',

  PLUS = 'PLUS',
  MINUS = 'MINUS',
  COMMA = 'COMMA',
  DOT = 'DOT',

  LESS = 'LESS',
  GREATER = 'GREATER',

  EQUAL = 'EQUAL',
  LESS_EQUAL = 'LESS_EQUAL',
  GREATER_EQUAL = 'GREATER_EQUAL',

  IDENTIFIER = 'IDENTIFIER',
}

class Token {
  T: TokenType

  Data: string

  constructor(t: TokenType, data: string) {
    this.T = t
    this.Data = data
  }
}

const KEYWORDS = {
  [TokenType.EOF.toString()]: TokenType.EOF,
  [TokenType.ILLEGAL.toString()]: TokenType.ILLEGAL,

  [TokenType.UNION.toString()]: TokenType.UNION,
  [TokenType.INTERSECT.toString()]: TokenType.INTERSECT,
  [TokenType.NOT.toString()]: TokenType.NOT,
  [TokenType.OPTIONAL.toString()]: TokenType.OPTIONAL,
  [TokenType.EXACT.toString()]: TokenType.EXACT,
  [TokenType.VECTOR.toString()]: TokenType.VECTOR,
  [TokenType.TAG.toString()]: TokenType.TAG,
  [TokenType.NUMERIC.toString()]: TokenType.NUMERIC,

  inf: TokenType.NUMBER,
}

class Lexer {
  Input: string

  Position: number

  ReadPosition: number

  C?: string

  constructor(input: string) {
    this.Input = input
    this.Position = 0
    this.ReadPosition = 0
    this.C = undefined

    this.ReadChar()
  }

  ReadChar() {
    if (this.ReadPosition >= this.Input.length) {
      this.C = undefined
    } else {
      this.C = this.Input[this.ReadPosition]
    }
    this.Position = this.ReadPosition++
  }

  PeekChar() {
    if (this.ReadPosition >= this.Input.length) {
      return null
    }
    return this.Input[this.ReadPosition]
  }

  SkipWhitespace() {
    while (this.C == ' ' || this.C == '\t' || this.C == '\r') {
      this.ReadChar()
    }
  }

  ReadIdentifier(): string {
    let str = ''

    // variable identifiers start with @
    // For the below expression, we can parse the identifier "@t1" successfully
    // @t1:INTERSECT
    //
    // Sample Query - `FT.EXPLAIN idx @t1:hello world @t2:howdy`
    const startsWithAt = this.C === '@'

    // If a '/' was found, next char can be escaped.
    //
    // Sample Query - `FT.EXPLAIN rs:recipes 'very simple | @t:hello @t2:{ free\\world } (@n:[1 2]|@n:[3 4]) (@g:[1.5 0.5 0.5 km] -@g:[2.5 1.5 0.5 km])'`
    let prevEscape = false
    while (
      this.C !== undefined &&
      (isLetter(this.C) ||
        ['@', ':', '\\'].includes(this.C) ||
        (startsWithAt && isDigit(this.C)) ||
        // Text can be searched in multiple schemas via '|'
        //
        // Example:
        // FT.CREATE idx SCHEMA t1 TEXT t2 TEXT
        // FT.EXPLAIN idx '@t1|t2:(text value)'
        (startsWithAt && this.C === '|') ||
        (str.startsWith('TAG:@') && isDigit(this.C)) ||
        prevEscape)
    ) {
      str += this.C
      if (this.C === '\\' && this.PeekChar() === '\\') {
        // '\' appears twice query result when escaped a character.
        //
        // For example, if space has to be escaped, instead of '\ ', you will find '\\ '.
        this.ReadChar() // read of extra '\'
        prevEscape = true
      } else {
        prevEscape = false
      }
      this.ReadChar()
    }
    return str
  }

  ReadNumber(): string {
    let str = ''
    while (
      this.C !== undefined &&
      (isDigit(this.C) || this.C === '.') &&
      !Number.isNaN(parseFloat(str + this.C))
    ) {
      str += this.C
      this.ReadChar()
    }
    return str
  }

  NextToken() {
    let t: Token | null = null

    this.SkipWhitespace()

    switch (this.C) {
      case '\n':
        t = new Token(TokenType.NEW_LINE, this.C)
        break
      case '{':
        t = new Token(TokenType.LBRACE, this.C)
        break
      case '}':
        t = new Token(TokenType.RBRACE, this.C)
        break
      case '(':
        t = new Token(TokenType.LPAREN, this.C)
        break
      case ')':
        t = new Token(TokenType.RPAREN, this.C)
        break
      case '+': // TODO: This should be PLUS token
        t = new Token(TokenType.IDENTIFIER, this.C)
        break
      case '-': // TODO: This should be MINUS token
        t = new Token(TokenType.IDENTIFIER, this.C)
        const p = this.PeekChar()
        if (p !== null && isDigit(p)) {
          this.ReadChar()
          const n = this.ReadNumber()
          t = new Token(TokenType.NUMBER, `-${n}`)
          return t
        }
        break
      case ',':
        t = new Token(TokenType.COMMA, this.C)
        break
      case '.':
        t = new Token(TokenType.DOT, this.C)
        break
      case '<':
        const lPeekChar = this.PeekChar()
        if (lPeekChar !== null && lPeekChar === '=') {
          t = new Token(TokenType.LESS_EQUAL, '<=')
          this.ReadChar()
        } else {
          t = new Token(TokenType.LESS, '<')
        }
        break
      case '>':
        const rPeekChar = this.PeekChar()
        if (rPeekChar !== null && rPeekChar === '=') {
          t = new Token(TokenType.GREATER_EQUAL, '>=')
          this.ReadChar()
        } else {
          t = new Token(TokenType.GREATER, '>')
        }
        break
      case '=':
        const ePeekChar = this.PeekChar()
        if (ePeekChar !== null && ePeekChar === '=') {
          t = new Token(TokenType.EQUAL, '==')
          this.ReadChar()
        } else {
          // No Assign Token
          t = new Token(TokenType.ILLEGAL, this.C)
        }
        break
      case undefined:
        t = new Token(TokenType.EOF, '')
        break
      default:
        if (
          this.C !== undefined &&
          (isLetter(this.C) || ['@', ':'].includes(this.C))
        ) {
          const literal = this.ReadIdentifier()
          let tokenType = KEYWORDS[literal] || TokenType.IDENTIFIER
          if (literal.startsWith('TAG:')) {
            tokenType = TokenType.TAG
          } else if (literal === 'FUZZY') {
            tokenType = TokenType.FUZZY
          } else if (literal === 'WILDCARD') {
            tokenType = TokenType.WILDCARD
          } else if (literal === 'PREFIX') {
            tokenType = TokenType.PREFIX
          } else if (literal === 'IDS') {
            tokenType = TokenType.IDS_EXPR
          } else if (literal === 'LEXRANGE') {
            tokenType = TokenType.LEXRANGE_EXPR
          } else if (literal === 'GEO') {
            tokenType = TokenType.GEO_EXPR
          } else if (literal.startsWith('@') && literal.endsWith(':OPTIONAL')) {
            tokenType = TokenType.OPTIONAL
          } else if (literal.startsWith('@') && literal.endsWith(':NOT')) {
            tokenType = TokenType.NOT
          } else if (literal.startsWith('@') && literal.endsWith(':EXACT')) {
            tokenType = TokenType.EXACT
          } else if (literal.startsWith('@') && literal.endsWith(':VECTOR')) {
            tokenType = TokenType.VECTOR
          } else if (literal.startsWith('@') && literal.endsWith(':UNION')) {
            tokenType = TokenType.UNION
          } else if (
            literal.startsWith('@') &&
            literal.endsWith(':INTERSECT')
          ) {
            tokenType = TokenType.INTERSECT
          }
          t = new Token(tokenType, literal)
          return t
        }
        if (this.C !== undefined && isDigit(this.C)) {
          const n = this.ReadNumber()
          t = new Token(TokenType.NUMBER, n)
          return t
        }
        t = new Token(TokenType.ILLEGAL, this.C)
    }
    this.ReadChar()
    return t
  }
}

export enum EntityType {
  Expr = 'Expr',
  UNION = 'UNION',
  INTERSECT = 'INTERSECT',
  OPTIONAL = 'OPTIONAL',
  NOT = 'NOT',
  EXACT = 'EXACT',
  VECTOR = 'VECTOR',
  NUMERIC = 'NUMERIC',

  // These are used exclusively in FT.PROFILE
  GEO = 'GEO',
  FUZZY = 'FUZZY',
  WILDCARD = 'WILDCARD',
  PREFIX = 'PREFIX',
  TEXT = 'TEXT',
  NUMBER = 'NUMBER',
  TAG = 'TAG',

  IDS = 'IDS',
  LEXRANGE = 'LEXRANGE',

  Index = 'Index',
  Scorer = 'Scorer',
  Sorter = 'Sorter',
  Loader = 'Loader',

  CLUSTER_MERGE = 'CLUSTER MERGE',
}

export interface EntityInfo {
  id: string
  type: EntityType
  subType?: EntityType
  data?: string
  snippet?: string
  children: EntityInfo[]
  time?: string
  counter?: string
  size?: string
  parentId?: string
  parentSnippet?: string
  level?: number
  recordsProduced?: string
}

interface IAncestors {
  found: boolean
  pairs: [string, string][]
}

export function GetAncestors(
  info: EntityInfo,
  searchId: string,
  a: IAncestors,
): IAncestors {
  if (searchId === info.id) {
    return {
      found: true,
      pairs: info.parentId ? [[info.parentId, info.id]] : [],
    }
  }
  const r: IAncestors = { ...a }
  for (let i = 0; i < info.children.length; i++) {
    const c = info.children[i]
    const ci = GetAncestors(c, searchId, a)
    if (ci.found) {
      r.found = true
      r.pairs = [...a.pairs, ...ci.pairs]
      if (info.parentId) {
        r.pairs = [...r.pairs, [info.parentId, info.id]]
      }
      return r
    }
  }
  return r
}

class Expr {
  Core: string

  SubType: EntityType

  Time?: string

  Info?: string

  constructor(
    expr: string,
    subType: EntityType,
    info: string | undefined = undefined,
  ) {
    this.Core = expr
    this.SubType = subType
    this.Info = info
  }

  toJSON(): EntityInfo {
    let snippet: string | undefined

    if (this.SubType === EntityType.TAG && this.Info?.startsWith('TAG:')) {
      snippet = this.Info?.substr(4)
    } else if (this.SubType === EntityType.GEO) {
      snippet = this.Info
      if (snippet?.endsWith(':')) {
        snippet = snippet?.slice(0, -1)
      }
    }

    return {
      id: uuidv4(),
      // data: 'Expr',
      // snippet: this.Core,
      type: EntityType.Expr,
      subType: this.SubType,
      snippet,
      data: this.Core,
      children: [],
      time: this.Time,
    }
  }
}

class NumericExpr {
  Left: number

  LSign: Token

  Identifier: Token

  Right: number

  RSign: Token

  constructor(
    left: number,
    lsign: Token,
    identifier: Token,
    rsign: Token,
    right: number,
  ) {
    this.Left = left
    this.LSign = lsign
    this.Identifier = identifier
    this.Right = right
    this.RSign = rsign
  }

  toJSON(): EntityInfo {
    return {
      id: uuidv4(),
      type: EntityType.NUMERIC,
      data: 'Numeric',
      snippet: `${this.Left.toString()} ${this.LSign.Data} ${this.Identifier.Data} ${this.RSign.Data} ${this.Right.toString()}`,
      children: [],
    }
  }
}

type SearchExpr = NumericExpr | Expr | ExpandExpr

type ExprTuple2 = SearchExpr[]

class ExpandExpr {
  Type: EntityType

  Info?: string

  Core: ExprTuple2

  constructor(type: EntityType, e: ExprTuple2, info?: string) {
    this.Core = e
    this.Info = info
    this.Type = type
  }

  toJSON(): EntityInfo {
    const id = uuidv4()

    let snippet: string | undefined

    if (this.Type === EntityType.TAG && this.Info?.startsWith('TAG:')) {
      snippet = this.Info?.substr(4)
    }

    if (!this.Info?.startsWith(this.Type)) {
      snippet = this.Info?.substring(0, this.Info.indexOf(`:${this.Type}`))
    }

    return {
      id,
      type: this.Type,
      snippet,
      children: this.Core.map((x) => x.toJSON()).map((d: EntityInfo) => ({
        ...d,
        parentId: id,
        parentSnippet: snippet,
      })),
    }
  }
}

class Parser {
  private L: Lexer

  CurrentToken: Token

  PeekToken: Token

  Errors: string[]

  constructor(l: Lexer) {
    this.L = l

    this.Errors = []
    this.CurrentToken = new Token(TokenType.INIT, '')
    this.PeekToken = new Token(TokenType.INIT, '')

    this.nextToken()
    this.nextToken()
  }

  currentTokenIs(t: TokenType) {
    return this.CurrentToken?.T === t
  }

  peekTokenIs(t: TokenType) {
    return this.PeekToken?.T === t
  }

  nextToken() {
    this.CurrentToken = this.PeekToken
    this.PeekToken = this.L.NextToken()

    if (this.CurrentToken.T === TokenType.EOF) {
      throw new Error("Didn't expect EOF token")
    }
  }

  assertToken(t: TokenType) {
    assertToken(t, this.CurrentToken.T)
  }

  // Parse an entity which can expand, i.e., has further children of
  // an entity type.
  //
  // Example:
  // <ENTITY_TYPE> { <ENTITY_TYPE> { ... } (<ENTITY_TYPE> { ... } ...) }
  parseExpandExpr(t: EntityType): ExpandExpr {
    assertExpandEntity(t)

    this.assertToken(t as unknown as TokenType)

    const data = this.CurrentToken.Data

    this.nextToken()

    this.assertToken(TokenType.LBRACE)

    const Exprs: SearchExpr[] = []
    this.nextToken()

    this.assertToken(TokenType.NEW_LINE)

    this.nextToken()

    while (true) {
      if (
        this.CurrentToken.T === TokenType.RBRACE &&
        this.PeekToken.T === TokenType.NEW_LINE
      ) {
        this.nextToken()
        break
      }

      const t = this.CurrentToken.T

      if (this.CurrentToken?.T === TokenType.NUMERIC) {
        Exprs.push(this.parseNumericExpr())
      } else if (this.CurrentToken?.T === TokenType.IDENTIFIER) {
        Exprs.push(this.parseExpr())
      } else if (
        [
          TokenType.UNION,
          TokenType.INTERSECT,
          TokenType.NOT,
          TokenType.OPTIONAL,
          TokenType.EXACT,
          TokenType.VECTOR,
          TokenType.TAG,
        ].includes(t)
      ) {
        Exprs.push(this.parseExpandExpr(EntityType[t]))
      } else if (this.CurrentToken.T === TokenType.GEO_EXPR) {
        Exprs.push(this.parseGeoExpr())
      } else if (
        [TokenType.FUZZY, TokenType.WILDCARD, TokenType.PREFIX].includes(t)
      ) {
        Exprs.push(this.parseSimpleExpr(EntityType[t]))
      } else if (this.CurrentToken.T === TokenType.IDS_EXPR) {
        Exprs.push(this.parseIdsExpr())
      } else if (this.CurrentToken.T === TokenType.LEXRANGE_EXPR) {
        Exprs.push(this.parseLexrangeExpr())
      } else if (this.CurrentToken.T === TokenType.NUMBER) {
        Exprs.push(
          new Expr(this.CurrentToken.Data.toString(), EntityType.NUMBER),
        )
      } else if (this.CurrentToken.T === TokenType.LESS) {
        Exprs.push(this.parseWildcardEmpty())
      }

      this.nextToken()
    }

    return new ExpandExpr(t, Exprs, data)
  }

  parseLexrangeExpr() {
    this.assertToken(TokenType.LEXRANGE_EXPR)

    this.nextToken()

    this.assertToken(TokenType.LBRACE)

    this.nextToken()

    this.assertToken(TokenType.IDENTIFIER)

    const first = this.CurrentToken.Data

    this.nextToken()

    this.assertToken(TokenType.DOT)

    this.nextToken()

    this.assertToken(TokenType.DOT)

    this.nextToken()

    this.assertToken(TokenType.DOT)

    this.nextToken()

    const second = this.CurrentToken.Data

    this.nextToken()

    this.assertToken(TokenType.RBRACE)

    return new Expr(`${first}...${second}`, EntityType.LEXRANGE)
  }

  parseIdsExpr() {
    this.assertToken(TokenType.IDS_EXPR)

    this.nextToken()

    this.assertToken(TokenType.LBRACE)

    this.nextToken()

    const ids: number[] = []

    while (this.CurrentToken.T !== TokenType.RBRACE) {
      ids.push(parseInt(this.CurrentToken.Data))

      this.nextToken()

      this.assertToken(TokenType.COMMA)

      this.nextToken()
    }

    this.assertToken(TokenType.RBRACE)

    this.nextToken()

    return new Expr(ids.join(','), EntityType.IDS)
  }

  // This is a special result.
  //
  // Example output: <WILDCARD>}\n
  parseWildcardEmpty() {
    // TODO: Check for WILDCARD_EMPTY
    this.assertToken(TokenType.LESS)

    this.nextToken()

    this.assertToken(TokenType.WILDCARD)

    this.nextToken()

    this.assertToken(TokenType.GREATER)

    this.nextToken()

    // TODO: Once fixed by redisearch team, remove this.
    this.assertToken(TokenType.RBRACE)

    return new Expr('<WILDCARD>', EntityType.WILDCARD)
  }

  parseExpr() {
    this.assertToken(TokenType.IDENTIFIER)

    let str = ''

    while (this.CurrentToken.T !== TokenType.NEW_LINE) {
      str += this.CurrentToken.Data
      this.nextToken()
    }

    return new Expr(str, EntityType.TEXT)
  }

  // Parse a very simple entity with format:
  // <ENTITY_TYPE> { <IDENTIFIER> }
  parseSimpleExpr(e: EntityType) {
    assertSimpleEntity(e)

    this.assertToken(TokenType[e])

    this.nextToken()

    this.assertToken(TokenType.LBRACE)

    this.nextToken()

    this.assertToken(TokenType.IDENTIFIER)

    const identifierData = this.CurrentToken.Data

    this.nextToken()

    this.assertToken(TokenType.RBRACE)

    this.nextToken()

    return new Expr(identifierData, e)
  }

  parseGeoExpr() {
    this.assertToken(TokenType.GEO_EXPR)

    const geoData = this.CurrentToken.Data

    this.nextToken()

    this.assertToken(TokenType.IDENTIFIER)

    const identifierData = this.CurrentToken.Data

    this.nextToken()

    this.assertToken(TokenType.LBRACE)

    this.nextToken()

    this.assertToken(TokenType.NUMBER)

    const first = this.CurrentToken.Data

    this.nextToken()

    this.assertToken(TokenType.COMMA)

    this.nextToken()

    this.assertToken(TokenType.NUMBER)

    const second = this.CurrentToken.Data

    this.nextToken()

    this.assertToken(TokenType.IDENTIFIER)

    assert(this.CurrentToken.Data === '-', 'Expected Identifier to be MINUS')

    this.nextToken()

    this.assertToken(TokenType.IDENTIFIER)

    assert(this.CurrentToken.Data === '-', 'Expected Identifier to be MINUS')

    this.nextToken()

    this.assertToken(TokenType.GREATER)

    this.nextToken()

    this.assertToken(TokenType.NUMBER)

    const third = this.CurrentToken.Data

    this.nextToken()

    this.assertToken(TokenType.IDENTIFIER)

    const metric = this.CurrentToken.Data

    this.nextToken()

    this.assertToken(TokenType.RBRACE)

    this.nextToken()

    return new Expr(
      `${first},${second} --> ${third} ${metric}`,
      EntityType.GEO,
      identifierData,
    )
  }

  parseNumericExpr() {
    this.assertToken(TokenType.NUMERIC)

    this.nextToken()

    this.assertToken(TokenType.LBRACE)

    this.nextToken()

    this.assertToken(TokenType.NUMBER)

    const left = this.CurrentToken?.Data

    this.nextToken()

    const lsign = this.CurrentToken // TODO: Check sign

    this.nextToken()

    this.assertToken(TokenType.IDENTIFIER)

    const identifier = this.CurrentToken

    this.nextToken()

    while (this.CurrentToken.T === TokenType.IDENTIFIER) {
      identifier.Data += this.CurrentToken.Data
      this.nextToken()
    }

    const rsign = this.CurrentToken

    this.nextToken()

    this.assertToken(TokenType.NUMBER)

    const right = this.CurrentToken?.Data

    this.nextToken()

    this.assertToken(TokenType.RBRACE)

    this.nextToken() // read off RBRACE

    // assertToken(TokenType.NEW_LINE, this.CurrentToken?.T)
    //
    // this.nextToken() // read off new line

    return new NumericExpr(
      left !== 'inf' ? parseFloat(left) : Infinity,
      lsign,
      identifier,
      rsign,
      right !== 'inf' ? parseFloat(right) : Infinity,
    )
  }
}

function Parse(data: string): SearchExpr {
  const l = new Lexer(data)

  const p = new Parser(l)

  const t = p.CurrentToken.T

  if (p.CurrentToken?.T === TokenType.NUMERIC) {
    return p.parseNumericExpr()
  }
  if (
    [
      TokenType.UNION,
      TokenType.INTERSECT,
      TokenType.NOT,
      TokenType.OPTIONAL,
      TokenType.EXACT,
      TokenType.VECTOR,
      TokenType.TAG,
    ].includes(t)
  ) {
    return p.parseExpandExpr(EntityType[t])
  }
  if (p.CurrentToken.T === TokenType.GEO_EXPR) {
    return p.parseGeoExpr()
  }
  if ([TokenType.FUZZY, TokenType.WILDCARD, TokenType.PREFIX].includes(t)) {
    return p.parseSimpleExpr(EntityType[t])
  }
  if (p.CurrentToken.T === TokenType.IDS_EXPR) {
    return p.parseIdsExpr()
  }
  if (p.CurrentToken.T === TokenType.LEXRANGE_EXPR) {
    return p.parseLexrangeExpr()
  }
  if (p.CurrentToken.T === TokenType.LESS) {
    return p.parseWildcardEmpty()
  }
  return p.parseExpr()
}

export function ParseExplain(output: string) {
  return Parse(output).toJSON()
}

function isLetter(str: string): boolean {
  return str.length === 1 && str.match(/[a-z]/i) !== null
}

function isDigit(str: string): boolean {
  return str >= '0' && str <= '9'
}

function assert(c: boolean, errorMsg: string) {
  if (!c) {
    throw new Error(errorMsg)
  }
}

function assertToken(expected: TokenType, actual: TokenType | undefined) {
  if (actual === undefined) {
    throw new Error('Token is undefined')
  }

  assert(expected === actual, `Expected ${expected}, Actual: ${actual}`)
}

function assertExpandEntity(t: EntityType) {
  if (
    ![
      EntityType.UNION,
      EntityType.INTERSECT,
      EntityType.NOT,
      EntityType.OPTIONAL,
      EntityType.EXACT,
      EntityType.VECTOR,
      EntityType.TAG,
    ].includes(t)
  ) {
    throw new Error(`${t} is not an expand entity`)
  }
}

function assertSimpleEntity(t: EntityType) {
  if (![EntityType.FUZZY, EntityType.WILDCARD, EntityType.PREFIX].includes(t)) {
    throw new Error(`${t} is not a simple entity`)
  }
}

export function ParseProfileCluster(info: any[]): [Object, EntityInfo] {
  const clusterInfo: { [key: string]: any[] } = {}
  let key: string = ''
  let i = 0
  while (i < info.length) {
    if (Array.isArray(info[i])) {
      clusterInfo[key].push(info[i])
    } else if (typeof info[i] === 'string') {
      key = info[i]
      clusterInfo[key] = []
    } else {
      throw new Error(`Expected array or string - ${JSON.stringify(info)}`)
    }
    i++
  }

  const shards: EntityInfo[] = []

  Object.keys(clusterInfo).map((k) => {
    if (k.toLowerCase().startsWith('shard')) {
      const shardProfileInfo = ParseProfile(clusterInfo[k])
      shards.push({
        id: uuidv4(),
        type: k as EntityType,
        children: [shardProfileInfo],
      })
    }
  })

  return [
    clusterInfo,
    {
      id: uuidv4(),
      type: EntityType.CLUSTER_MERGE,
      // children: shards,
      children: Object.keys(clusterInfo)
        .filter((k) => k.toLowerCase().startsWith('shard'))
        .map((k) => ParseProfile(clusterInfo[k])),
    },
  ]
}

export function ParseProfile(shard: Array<any>): EntityInfo {
  const iterators = findFlatProfile('Iterators profile', shard)
  let result = iterators ? ParseIteratorProfile(iterators) : null
  const processorsProfile: string[][] = findFlatProfile(
    'Result processors profile',
    shard,
  )

  for (let i = 0; i < processorsProfile.length; i++) {
    const e = processorsProfile[i]
    const id = uuidv4()
    result = {
      id,
      type: e[1] as EntityType,
      time: e[3],
      counter: e[5],
      children: result ? [{ ...result, parentId: id }] : [],
    }
  }

  return result as EntityInfo
}

export function ParseIteratorProfile(data: any[]): EntityInfo {
  const props: { [key: string]: any } = {}

  // Parse items with the following format [key1, value1, key2, value2, null, key3, value3, key4, value4_1[], value4_2[]]
  for (let x = 0; x < data.length; x += 2) {
    let key = data[x]
    if (key === null) {
      while (data[x] === null) {
        x += 1
      }
      key = data[x]
    }

    let val = data[x + 1]

    while (data[x + 1] === null) x += 1
    val = data[x + 1]

    if (Array.isArray(val)) {
      const arr: any[] = []
      while (x + 1 < data.length && Array.isArray(data[x + 1])) {
        arr.push(data[x + 1])
        x += 1
      }
      props[key] = arr
    } else {
      props[key] = val
    }
  }

  const childrens = props['Child iterators'] || props['Child Iterators'] || []

  const id = uuidv4()
  return {
    id,
    type: props.Type || props.TYPE,
    time: props.Time,
    counter: props.Counter,
    size: props.Size,
    data: props.Term,
    children: childrens
      .map(ParseIteratorProfile)
      .map((d: EntityInfo) => ({ ...d, parentId: id })),
  }

  // const t: EntityType = props['Type']
  // if ([EntityType.UNION, EntityType.INTERSECT].includes(t)) {
  //   const l = data.length

  //   return {
  //     id: uuidv4(),
  //     type: t,
  //     time: data[5],
  //     counter: data[7],
  //     children: props['Child iterators'].map(x => ParseIteratorProfile(x)),
  //   }
  // // } else if (t === EntityType.NUMERIC) {
  // //   return {
  // //     id: uuidv4(),
  // //     type: EntityType.NUMERIC,
  // //     snippet: 'Numeric',
  // //     children: [],
  // //   }
  // } else {
  //   return {
  //     id: uuidv4(),
  //     type: data[1],
  //     data: data[3],
  //     time: data[5],
  //     counter: data[7],
  //     size: data[9],
  //     children: [],
  //   }
  // }
}

export enum ModuleType {
  Graph,
  Search,
}

export enum CoreType {
  Profile,
  Explain,
}

export function getOutputLevel(output: string) {
  let i = 0
  while (output[i] == ' ' && i < output.length) {
    i++
  }
  return (i > 0 ? i / 4 : 0) + 1
}

function ParseEntity(entity: string, children: EntityInfo[]): EntityInfo {
  const info = entity.trim().split('|')

  let time: string | undefined = ''
  let size: string | undefined = ''

  const metaData = info.slice(-1)[0].trim()

  // Is GRAPH.PROFILE output
  if (metaData.startsWith('Records produced')) {
    ;[size, time] = metaData.trim().split(',')

    size = size.split(': ')[1]
    time = time.split(': ')[1].split(' ')[0]
    info.pop()
  }

  const snippet = [...info.slice(1)].join('|').trim()

  return {
    id: uuidv4(),
    type: info[0] as EntityType,
    snippet,
    children,
    time,
    size,
    counter: size,
    level: getOutputLevel(entity),
  }
}

export function ParseGraphV2(output: string[]) {
  const level = getOutputLevel(output[0]) + 1

  const entity = ParseEntity(output[0], [])
  const children: EntityInfo[] = []

  const pairs: [number, number][] = []

  let s: number | null = null
  const e: number | null = null
  let i = 1

  while (i < output.length) {
    const l = getOutputLevel(output[i])
    if (l === level) {
      if (s == null) {
        s = i
      } else if (s != null) {
        pairs.push([s, i])
        s = i
      }
    }
    i++
  }

  if (s !== null) {
    pairs.push([s, i])
  }

  for (let k = 0; k < pairs.length; k++) {
    const p = pairs[k]
    children.push({
      ...ParseGraphV2(output.slice(p[0], p[1])),
      parentId: entity.id,
    })
  }

  entity.children = children
  return entity
}

export function GetTotalExecutionTime(g: EntityInfo) {
  return (
    parseFloat(g.time || '') +
    g.children.reduce((a, c) => a + GetTotalExecutionTime(c), 0)
  )
}

export const findFlatProfile = (key: string, profiles: any) => {
  const index = profiles.findIndex(
    (k: string) => k?.toLowerCase?.() === key?.toLowerCase?.(),
  )
  return index > -1 ? profiles[index + 1] : undefined
}

// Helper to find a profile by key (redis < 8)
export const findProfile = (
  key: string,
  profiles: Array<[string, any]>,
  defautlVal: any = [],
) => {
  const [, ...rest] =
    profiles.find(([k]) => k?.toLowerCase?.() === key?.toLowerCase?.()) || []
  return rest?.length ? rest : [defautlVal]
}

// transform profile result to be campatible with redis 8+
export const transformProfileResult = (profiles: Array<[string, any]>) => [
  'Shards',
  [
    [
      'Total profile time',
      ...findProfile('Total profile time', profiles),
      'Parsing time',
      ...findProfile('Parsing time', profiles),
      'Pipeline creation time',
      ...findProfile('Pipeline creation time', profiles),
      'Warning',
      ...findProfile('Warning', profiles, 'None'),
      'Iterators profile',
      ...findProfile('Iterators profile', profiles),
      'Result processors profile',
      findProfile('Result processors profile', profiles),
    ],
  ],
  'Coordinator',
  [],
]
