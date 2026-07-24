import { TFunction } from 'i18next'

export const getFilterOperators = (t: TFunction) => [
  t('browser.vectorSet.filterHelp.op.selectAttribute'),
  t('browser.vectorSet.filterHelp.op.comparison'),
  t('browser.vectorSet.filterHelp.op.logical'),
  t('browser.vectorSet.filterHelp.op.inList'),
  t('browser.vectorSet.filterHelp.op.stringLiterals'),
]

export const FILTER_EXAMPLES = [
  '.price > 50',
  '.category == "books"',
  '.year >= 2020 and .rating > 4',
  '.tag in ["new", "sale"]',
]
