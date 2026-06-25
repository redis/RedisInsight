import { SampleArrayDataset } from './LoadSampleDataset.types'

export const SAMPLE_DATASETS: SampleArrayDataset[] = [
  {
    collectionName: 'temperature-readings',
    keyName: 'temp:room12:day7',
    label: 'Temperature readings (sparse)',
    description: 'Sparse',
    elementCount: 22,
    highestIndex: '1439',
    previewRows: [
      { index: '0', value: '18.4' },
      { index: '1', value: '18.6' },
      { index: '2', value: '18.9' },
      { index: '12', value: '19.2' },
      { index: '60', value: '20.4' },
    ],
  },
  {
    collectionName: 'server-errors',
    keyName: 'log:server:errors',
    label: 'Server error log (sparse)',
    description: 'Sparse',
    elementCount: 13,
    highestIndex: '255',
    previewRows: [
      { index: '0', value: 'boot: ok' },
      { index: '1', value: 'warn: disk' },
      { index: '2', value: 'ERROR: cpu' },
      { index: '3', value: 'info: ready' },
      { index: '4', value: 'error: net' },
    ],
  },
  {
    collectionName: 'readme-document',
    keyName: 'doc:readme.md',
    label: 'README document (contiguous)',
    description: 'Contiguous',
    elementCount: 39,
    highestIndex: '38',
    previewRows: [
      { index: '0', value: '# Redis Insight prototype' },
      { index: '1', value: '' },
      {
        index: '2',
        value: 'Welcome to the **Redis Insight** array viewer prototype.',
      },
      {
        index: '3',
        value:
          'It treats a Redis array as if it were a Markdown file — one row per line.',
      },
      { index: '4', value: '' },
    ],
  },
]

export const DEFAULT_SAMPLE_DATASET = SAMPLE_DATASETS[0]
