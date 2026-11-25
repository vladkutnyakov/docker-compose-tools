import path from 'path'
import { SavedFile } from './types'

// label is the parent folder name, which is also the default compose project name
export function createSavedFile (filePath: string): SavedFile {
  return {
    name: path.basename(filePath),
    path: filePath,
    label: path.basename(path.dirname(filePath)) || path.dirname(filePath),
    status: null,
  }
}
