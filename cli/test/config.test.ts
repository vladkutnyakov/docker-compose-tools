import fs from 'fs'
import os from 'os'
import path from 'path'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { addFiles, configPath, loadConfig, saveConfig } from '../src/config'

let dir: string

beforeEach(() => {
  dir = fs.mkdtempSync(path.join(os.tmpdir(), 'dct-'))
  process.env.DCT_CONFIG_DIR = path.join(dir, 'config')
})

afterEach(() => {
  delete process.env.DCT_CONFIG_DIR
  fs.rmSync(dir, { recursive: true, force: true })
})

const composeFile = (project: string, name = 'docker-compose.yml') => {
  fs.mkdirSync(path.join(dir, project), { recursive: true })
  const filePath = path.join(dir, project, name)
  fs.writeFileSync(filePath, 'services: {}\n')
  return filePath
}

describe('config', () => {
  it('returns defaults when there is no config yet', () => {
    expect(loadConfig()).toEqual({ files: [], editor: 'zed', pollMs: 2000 })
  })

  it('round-trips files without persisting statuses', () => {
    const config = loadConfig()
    addFiles(config, [composeFile('api')])
    config.files[0].status = 'running(1)'
    saveConfig(config)

    const saved = JSON.parse(fs.readFileSync(configPath(), 'utf8'))
    expect(saved.files[0]).toMatchObject({ label: 'api', status: null })
    expect(loadConfig().files).toHaveLength(1)
  })

  it('keeps user settings such as editor', () => {
    fs.mkdirSync(path.dirname(configPath()), { recursive: true })
    fs.writeFileSync(configPath(), JSON.stringify({ editor: 'code' }))
    expect(loadConfig()).toMatchObject({ editor: 'code', pollMs: 2000, files: [] })
  })

  it('validates added paths', () => {
    const config = loadConfig()
    const valid = composeFile('web', 'compose.yaml')
    const notYaml = composeFile('web', 'README.md')

    const result = addFiles(config, [valid, valid, notYaml, path.join(dir, 'missing.yml')])

    expect(result.added.map(file => file.label)).toEqual(['web'])
    expect(result.skipped.map(item => item.reason)).toEqual(['already added', 'not a .yml/.yaml file', 'file does not exist'])
  })
})
