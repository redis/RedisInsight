export const FILTER_OPERATORS = [
  '. – select an attribute (e.g. .price)',
  '== / != / < / <= / > / >=',
  'and / or / not',
  'in [ ... ]',
  '"..." for string literals',
]

export const FILTER_EXAMPLES = [
  '.price > 50',
  '.category == "books"',
  '.year >= 2020 and .rating > 4',
  '.tag in ["new", "sale"]',
]
