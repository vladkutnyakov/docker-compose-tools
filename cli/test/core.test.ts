import { describe, expect, it } from 'vitest'
import { moveFiles } from '../../src/core/reorder'
import { applyStatuses, normalizeStatus } from '../../src/core/status'
import { SavedFile } from '../../src/core/types'

const file = (name: string): SavedFile => ({ name: 'docker-compose.yml', path: `/p/${name}/docker-compose.yml`, label: name, status: null })
const labels = (files?: SavedFile[]) => files?.map(item => item.label)

describe('normalizeStatus', () => {
  it('strips container counts', () => {
    expect(normalizeStatus('running(2)')).toBe('running')
    expect(normalizeStatus('exited(1)')).toBe('exited')
  })

  it('falls back to idle for unknown values', () => {
    expect(normalizeStatus(null)).toBe('idle')
    expect(normalizeStatus('')).toBe('idle')
    // mixed status: the greedy regex keeps the first state (same as the extension always did)
    expect(normalizeStatus('running(1), exited(2)')).toBe('running')
    expect(normalizeStatus('paused(1)')).toBe('idle')
  })
})

describe('applyStatuses', () => {
  it('matches projects by label and marks the rest idle', () => {
    const files = [file('a'), file('b')]
    applyStatuses(files, [{ Name: 'a', Status: 'running(1)', ConfigFiles: '' }])
    expect(files.map(item => item.status)).toEqual(['running(1)', 'idle'])
  })
})

describe('moveFiles', () => {
  const files = ['a', 'b', 'c', 'd'].map(file)
  const pathOf = (name: string) => `/p/${name}/docker-compose.yml`

  it('moves down after the target', () => {
    expect(labels(moveFiles(files, [pathOf('a')], pathOf('c')))).toEqual(['b', 'c', 'a', 'd'])
  })

  it('moves up before the target', () => {
    expect(labels(moveFiles(files, [pathOf('d')], pathOf('b')))).toEqual(['a', 'd', 'b', 'c'])
  })

  it('moves to the end without a target', () => {
    expect(labels(moveFiles(files, [pathOf('a'), pathOf('b')]))).toEqual(['c', 'd', 'a', 'b'])
  })

  it('ignores a target that is being moved or unknown paths', () => {
    expect(moveFiles(files, [pathOf('a')], pathOf('a'))).toBeUndefined()
    expect(moveFiles(files, ['/nope'])).toBeUndefined()
  })

  it('does not mutate the input', () => {
    moveFiles(files, [pathOf('a')], pathOf('d'))
    expect(labels(files)).toEqual(['a', 'b', 'c', 'd'])
  })
})
