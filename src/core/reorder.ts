import { SavedFile } from './types'

// returns a new array with the files at `paths` moved next to `targetPath` (or to the end)
// dragging down -> placed after target, dragging up -> placed before target
export function moveFiles (files: SavedFile[], paths: string[], targetPath?: string): SavedFile[] | undefined {
  const firstMovedIndex = files.findIndex(file => paths.includes(file.path))
  const moved = files.filter(file => paths.includes(file.path))
  if (!moved.length) return

  const rest = files.filter(file => !paths.includes(file.path))

  let insertIndex = rest.length
  if (targetPath !== undefined) {
    const targetIndex = rest.findIndex(file => file.path === targetPath)
    if (targetIndex === -1) return

    const originalTargetIndex = files.findIndex(file => file.path === targetPath)
    insertIndex = firstMovedIndex < originalTargetIndex ? targetIndex + 1 : targetIndex
  }

  rest.splice(insertIndex, 0, ...moved)
  return rest
}
