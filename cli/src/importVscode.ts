import fs from 'fs'
import os from 'os'
import path from 'path'
import { SavedFile } from '../../src/core/types'

const EXTENSION_ID = 'vladkutnyakov.docker-compose-tools'

export function vscodeStatePath () {
  const home = os.homedir()
  const base = process.platform === 'win32'
    ? path.join(process.env.APPDATA ?? path.join(home, 'AppData', 'Roaming'), 'Code')
    : process.platform === 'darwin'
      ? path.join(home, 'Library', 'Application Support', 'Code')
      : path.join(process.env.XDG_CONFIG_HOME ?? path.join(home, '.config'), 'Code')

  return path.join(base, 'User', 'globalStorage', 'state.vscdb')
}

// reads the extension's globalState ("savedFiles") straight from vscode's sqlite storage
export async function readVscodeFiles (dbPath = vscodeStatePath()): Promise<SavedFile[]> {
  if (!fs.existsSync(dbPath)) throw new Error(`VS Code state not found: ${dbPath}`)

  // node:sqlite is still flagged as experimental, keep the warning out of the output
  process.removeAllListeners('warning')
  const { DatabaseSync } = await import('node:sqlite')

  const db = new DatabaseSync(dbPath, { readOnly: true })
  try {
    const row = db.prepare('SELECT value FROM ItemTable WHERE key = ?').get(EXTENSION_ID) as { value?: string | Uint8Array } | undefined
    if (!row?.value) return []

    const value = typeof row.value === 'string' ? row.value : Buffer.from(row.value).toString('utf8')
    const state = JSON.parse(value) as { savedFiles?: SavedFile[] }
    return state.savedFiles ?? []
  } finally {
    db.close()
  }
}
