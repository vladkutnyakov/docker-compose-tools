import fs from 'fs'
import os from 'os'
import path from 'path'
import { createSavedFile } from '../../src/core/files'
import { SavedFile } from '../../src/core/types'

export interface Config {
  files: SavedFile[]
  // command used to open files and folders, e.g. "zed" or "code"
  editor: string
  pollMs: number
}

const DEFAULTS: Config = { files: [], editor: 'zed', pollMs: 2000 }

export function configDir () {
  if (process.env.DCT_CONFIG_DIR) return process.env.DCT_CONFIG_DIR
  if (process.platform === 'win32' && process.env.APPDATA) {
    return path.join(process.env.APPDATA, 'docker-compose-tools')
  }
  return path.join(process.env.XDG_CONFIG_HOME || path.join(os.homedir(), '.config'), 'docker-compose-tools')
}

export const configPath = () => path.join(configDir(), 'config.json')

export function loadConfig (): Config {
  try {
    const raw = JSON.parse(fs.readFileSync(configPath(), 'utf8')) as Partial<Config>
    return { ...DEFAULTS, ...raw, files: Array.isArray(raw.files) ? raw.files : [] }
  } catch {
    return { ...DEFAULTS, files: [] }
  }
}

export function saveConfig (config: Config) {
  fs.mkdirSync(configDir(), { recursive: true })
  // statuses are live data, no point in persisting them
  const files = config.files.map(file => ({ ...file, status: null }))
  fs.writeFileSync(configPath(), JSON.stringify({ ...config, files }, null, 2) + '\n')
}

export type AddResult = { added: SavedFile[], skipped: { path: string, reason: string }[] }

export function addFiles (config: Config, paths: string[]): AddResult {
  const result: AddResult = { added: [], skipped: [] }

  for (const input of paths) {
    const filePath = path.resolve(input)

    if (!/\.ya?ml$/i.test(filePath)) {
      result.skipped.push({ path: filePath, reason: 'not a .yml/.yaml file' })
    } else if (!fs.existsSync(filePath)) {
      result.skipped.push({ path: filePath, reason: 'file does not exist' })
    } else if (config.files.some(file => samePath(file.path, filePath))) {
      result.skipped.push({ path: filePath, reason: 'already added' })
    } else {
      const file = createSavedFile(filePath)
      config.files.push(file)
      result.added.push(file)
    }
  }

  return result
}

export function samePath (a: string, b: string) {
  return process.platform === 'win32' ? a.toLowerCase() === b.toLowerCase() : a === b
}
