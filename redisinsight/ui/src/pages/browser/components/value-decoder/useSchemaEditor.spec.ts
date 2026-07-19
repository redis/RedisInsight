import { act, renderHook } from '@testing-library/react-hooks'

import {
  createEmptyField,
  createEmptyRepeatBlock,
  isFieldNode,
  isRepeatNode,
} from './constants'
import { BinaryFieldDefinition, SchemaNode } from './types'
import {
  applyAddField,
  applyAddRepeat,
  applyFieldChange,
  applyRemoveNode,
  applyReorder,
  applyRepeatChange,
  applyRepeatFieldsChange,
  useSchemaEditor,
} from './useSchemaEditor'

const field = (
  overrides: Partial<BinaryFieldDefinition> & { id: string },
): BinaryFieldDefinition => ({
  ...createEmptyField(),
  ...overrides,
  kind: 'field',
})

describe('schema editor mutations', () => {
  describe('applyAddField / applyAddRepeat', () => {
    it('appends an empty field', () => {
      const nodes = [field({ id: 'a', name: 'a' })]
      const next = applyAddField(nodes)

      expect(next).toHaveLength(2)
      expect(next[0]).toBe(nodes[0])
      expect(isFieldNode(next[1])).toBe(true)
      expect(next[1]).toMatchObject({ name: '', dataType: 'uint8', size: 1 })
    })

    it('appends an empty repeat block with one child field', () => {
      const nodes = [field({ id: 'a', name: 'a' })]
      const next = applyAddRepeat(nodes)

      expect(next).toHaveLength(2)
      expect(isRepeatNode(next[1])).toBe(true)
      if (isRepeatNode(next[1])) {
        expect(next[1].countFieldRef).toBe('')
        expect(next[1].fields).toHaveLength(1)
        expect(isFieldNode(next[1].fields[0])).toBe(true)
      }
    })
  })

  describe('applyRemoveNode', () => {
    it('removes a top-level node', () => {
      const a = field({ id: 'a', name: 'a' })
      const b = field({ id: 'b', name: 'b' })
      expect(applyRemoveNode([a, b], 'a')).toEqual([b])
    })

    it('keeps a placeholder field when removing the last top-level node', () => {
      const a = field({ id: 'a', name: 'a' })
      const next = applyRemoveNode([a], 'a')

      expect(next).toHaveLength(1)
      expect(isFieldNode(next[0])).toBe(true)
      expect(next[0].id).not.toBe('a')
    })

    it('removes a nested field inside a repeat block', () => {
      const count = field({ id: 'count', name: 'count', dataType: 'uint8' })
      const innerA = field({ id: 'inner-a', name: 'innerA' })
      const innerB = field({ id: 'inner-b', name: 'innerB' })
      const repeat = {
        ...createEmptyRepeatBlock(),
        id: 'repeat-1',
        countFieldRef: count.id,
        fields: [innerA, innerB],
      }

      const next = applyRemoveNode([count, repeat], 'inner-a')
      expect(isRepeatNode(next[1])).toBe(true)
      if (isRepeatNode(next[1])) {
        expect(next[1].fields).toEqual([innerB])
      }
    })
  })

  describe('applyReorder', () => {
    it('reorders sibling nodes', () => {
      const a = field({ id: 'a', name: 'a' })
      const b = field({ id: 'b', name: 'b' })
      const c = field({ id: 'c', name: 'c' })

      expect(applyReorder([a, b, c], 0, 2).map((n) => n.id)).toEqual([
        'b',
        'c',
        'a',
      ])
    })

    it('returns the same array for an invalid move', () => {
      const nodes = [
        field({ id: 'a', name: 'a' }),
        field({ id: 'b', name: 'b' }),
      ]
      expect(applyReorder(nodes, 0, 0)).toBe(nodes)
      expect(applyReorder(nodes, -1, 1)).toBe(nodes)
    })
  })

  describe('applyFieldChange', () => {
    it('patches field name without changing size', () => {
      const target = field({
        id: 'f1',
        name: 'old',
        dataType: 'uint8',
        size: 1,
      })
      const next = applyFieldChange([target], 'f1', { name: 'new' })

      expect(next[0]).toMatchObject({
        id: 'f1',
        name: 'new',
        dataType: 'uint8',
        size: 1,
      })
    })

    it('resets size when changing to a fixed-width type', () => {
      const target = field({
        id: 'f1',
        name: 'payload',
        dataType: 'string',
        size: 8,
        sizeSource: 'fixed',
      })
      const next = applyFieldChange([target], 'f1', { dataType: 'uint32le' })

      expect(next[0]).toMatchObject({
        dataType: 'uint32le',
        size: 4,
        sizeSource: 'fixed',
        sizeFieldRef: undefined,
      })
    })

    it('clears size when changing to a custom-size type', () => {
      const target = field({ id: 'f1', name: 'x', dataType: 'uint8', size: 1 })
      const next = applyFieldChange([target], 'f1', { dataType: 'string' })

      expect(next[0]).toMatchObject({
        dataType: 'string',
        size: '',
      })
    })

    it('updates a nested field inside a repeat', () => {
      const count = field({ id: 'count', name: 'count' })
      const inner = field({ id: 'inner', name: 'inner', dataType: 'uint8' })
      const repeat = {
        ...createEmptyRepeatBlock(),
        id: 'repeat-1',
        countFieldRef: count.id,
        fields: [inner],
      }

      const next = applyFieldChange([count, repeat], 'inner', {
        name: 'renamed',
      })

      expect(isRepeatNode(next[1])).toBe(true)
      if (isRepeatNode(next[1])) {
        expect(next[1].fields[0]).toMatchObject({
          id: 'inner',
          name: 'renamed',
        })
      }
    })
  })

  describe('applyRepeatChange / applyRepeatFieldsChange', () => {
    it('updates countFieldRef on a repeat block', () => {
      const count = field({ id: 'count', name: 'count' })
      const repeat = {
        ...createEmptyRepeatBlock(),
        id: 'repeat-1',
        countFieldRef: '',
      }

      const next = applyRepeatChange([count, repeat], 'repeat-1', {
        countFieldRef: count.id,
      })

      expect(next[1]).toMatchObject({
        id: 'repeat-1',
        countFieldRef: 'count',
      })
    })

    it('replaces nested fields for a repeat block', () => {
      const count = field({ id: 'count', name: 'count' })
      const repeat = {
        ...createEmptyRepeatBlock(),
        id: 'repeat-1',
        countFieldRef: count.id,
        fields: [field({ id: 'old', name: 'old' })],
      }
      const replacement: SchemaNode[] = [
        field({ id: 'new-a', name: 'newA' }),
        field({ id: 'new-b', name: 'newB' }),
      ]

      const next = applyRepeatFieldsChange(
        [count, repeat],
        'repeat-1',
        replacement,
      )

      expect(isRepeatNode(next[1])).toBe(true)
      if (isRepeatNode(next[1])) {
        expect(next[1].fields).toEqual(replacement)
      }
    })

    it('supports nested repeat field replacement', () => {
      const count = field({ id: 'count', name: 'count' })
      const nestedInner = field({ id: 'nested-inner', name: 'nestedInner' })
      const nestedRepeat = {
        ...createEmptyRepeatBlock(),
        id: 'nested-repeat',
        countFieldRef: count.id,
        fields: [nestedInner],
      }
      const outerRepeat = {
        ...createEmptyRepeatBlock(),
        id: 'outer-repeat',
        countFieldRef: count.id,
        fields: [nestedRepeat],
      }

      const replacement = [field({ id: 'replacement', name: 'replacement' })]
      const next = applyRepeatFieldsChange(
        [count, outerRepeat],
        'nested-repeat',
        replacement,
      )

      expect(isRepeatNode(next[1])).toBe(true)
      if (isRepeatNode(next[1])) {
        expect(isRepeatNode(next[1].fields[0])).toBe(true)
        if (isRepeatNode(next[1].fields[0])) {
          expect(next[1].fields[0].fields).toEqual(replacement)
        }
      }
    })
  })
})

describe('useSchemaEditor', () => {
  it('wires handlers through onChange', () => {
    const onChange = jest.fn()
    const nodes = [field({ id: 'a', name: 'a' })]

    const { result } = renderHook(() => useSchemaEditor({ nodes, onChange }))

    act(() => {
      result.current.handleAddField()
    })

    expect(onChange).toHaveBeenCalledTimes(1)
    expect(onChange.mock.calls[0][0]).toHaveLength(2)
    expect(isFieldNode(onChange.mock.calls[0][0][1])).toBe(true)

    act(() => {
      result.current.handleReorder(0, 0)
    })
    expect(onChange).toHaveBeenCalledTimes(2)
    expect(onChange.mock.calls[1][0]).toBe(nodes)
  })
})
