import ERROR_MESSAGES from 'src/constants/error-messages';
import { isClusterCursorValid, parseClusterCursor } from './clusterCursor';

const isClusterCursorValidTests = [
  { input: '172.17.0.1:7001@22||172.17.0.1:7002@33', expected: true },
  { input: '172.17.0.1:7001@-1||172.17.0.1:7002@-1', expected: true },
  {
    input:
      '172.17.0.1:7001@10' +
      '||172.17.0.1:7002@10' +
      '||172.17.0.1:7003@10' +
      '||172.17.0.1:7004@10' +
      '||172.17.0.1:7005@10' +
      '||172.17.0.1:7006@10',
    expected: true,
  },
  { input: '172.17.0.1:7001@-1', expected: true },
  { input: 'domain.com:7001@-1', expected: true },
  { input: 'domain-with-hyphens.com:7001@-1', expected: true },
  { input: '172.17.0.1:7001@1228822', expected: true },
  { input: '172.17.0.1:7001@', expected: false },
  { input: '172.17.0.1:7001@text', expected: false },
  { input: '172,17,0,1:7001@-1', expected: false },
  { input: 'plain text', expected: false },
  { input: 'text@text||text@text', expected: false },
  { input: 'text@text', expected: false },
  { input: '', expected: false },
];

describe('isClusterCursorValid', () => {
  it.each(isClusterCursorValidTests)('%j', ({ input, expected }) => {
    expect(isClusterCursorValid(input)).toBe(expected);
  });
});

const defaultNodeScanResult = {
  total: 0,
  scanned: 0,
  host: '172.17.0.1',
  port: 0,
  cursor: 0,
  keys: [],
};
const parsingError = new Error(ERROR_MESSAGES.INCORRECT_CLUSTER_CURSOR_FORMAT);
const parseClusterCursorTests = [
  {
    input: '172.17.0.1:7001@22||172.17.0.1:7002@33',
    expected: [
      { ...defaultNodeScanResult, port: 7001, cursor: 22 },
      { ...defaultNodeScanResult, port: 7002, cursor: 33 },
    ],
  },
  {
    input:
      '172.17.0.1:7001@-1' +
      '||172.17.0.1:7002@10' +
      '||172.17.0.1:7003@-1' +
      '||172.17.0.1:7004@10' +
      '||172.17.0.1:7005@-1' +
      '||172.17.0.1:7006@10',
    expected: [
      { ...defaultNodeScanResult, port: 7002, cursor: 10 },
      { ...defaultNodeScanResult, port: 7004, cursor: 10 },
      { ...defaultNodeScanResult, port: 7006, cursor: 10 },
    ],
  },
  {
    input: '172.17.0.1:7001@-1||172.17.0.1:7002@-1',
    expected: [],
  },
  { input: '172.17.0.1:7001@', expected: parsingError },
  { input: '172.17.0.1:7001@text', expected: parsingError },
  { input: '172,17,0,1:7001@-1', expected: parsingError },
  { input: 'plain text', expected: parsingError },
  { input: 'text@text||text@text', expected: parsingError },
  { input: 'text@text', expected: parsingError },
  { input: '', expected: parsingError },
  { input: '', expected: parsingError },
];

describe('parseClusterCursor', () => {
  it.each(parseClusterCursorTests)('%j', ({ input, expected }) => {
    if (expected instanceof Error) {
      try {
        parseClusterCursor(input);
      } catch (e) {
        expect(e.message).toEqual(expected.message);
      }
    } else {
      expect(parseClusterCursor(input)).toEqual(expected);
    }
  });
});
