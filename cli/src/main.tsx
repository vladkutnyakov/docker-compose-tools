import { render } from 'ink'
import { fetchProjects } from '../../src/core/docker'
import { applyStatuses, normalizeStatus } from '../../src/core/status'
import { addFiles, configPath, loadConfig, samePath, saveConfig } from './config'
import { readVscodeFiles } from './importVscode'
import { openInEditor, revealInFileManager, runCompose } from './runner'
import { App } from './ui/App'

const USAGE = `Docker Compose Tools

Usage:
  dct                    open the terminal UI
  dct add <file...>      add docker-compose files to the list
  dct ls                 print saved projects with their status
  dct import-vscode      copy the list from the VS Code extension
  dct config             print the config file path

Config: ${configPath()}`

async function main (args: string[]) {
  const [command, ...rest] = args

  switch (command) {
    case undefined:
      return tui()
    case 'add':
      return add(rest)
    case 'ls':
    case 'list':
      return list()
    case 'import-vscode':
      return importVscode()
    case 'config':
      return console.log(configPath())
    case '-h':
    case '--help':
    case 'help':
      return console.log(USAGE)
    default:
      console.error(`Unknown command: ${command}\n\n${USAGE}`)
      process.exitCode = 1
  }
}

async function tui () {
  if (!process.stdin.isTTY) {
    console.error('dct needs an interactive terminal')
    process.exitCode = 1
    return
  }

  const config = loadConfig()
  const instance = render(
    <App config={config} deps={{ fetchProjects, runCompose, openInEditor, revealInFileManager, saveConfig }} />,
    { alternateScreen: true },
  )
  await instance.waitUntilExit()
}

function add (paths: string[]) {
  if (!paths.length) {
    console.error('Usage: dct add <file...>')
    process.exitCode = 1
    return
  }

  const config = loadConfig()
  const result = addFiles(config, paths)
  if (result.added.length) saveConfig(config)

  for (const file of result.added) console.log(`+ ${file.label}  ${file.path}`)
  for (const item of result.skipped) console.log(`- ${item.path}: ${item.reason}`)
  if (!result.added.length) process.exitCode = 1
}

const COLORS = { running: 32, exited: 31, idle: 90 }

async function list () {
  const { files } = loadConfig()
  const projects = await fetchProjects()
  if (projects === undefined) console.log('\x1b[33m⚠ Docker is not running\x1b[0m')

  applyStatuses(files, projects ?? [])
  const width = Math.max(0, ...files.map(file => file.label.length))

  for (const file of files) {
    const color = COLORS[normalizeStatus(file.status)]
    console.log(`\x1b[${color}m●\x1b[0m ${file.label.padEnd(width)}  ${(file.status ?? 'idle').padEnd(12)}  \x1b[90m${file.path}\x1b[0m`)
  }
  if (!files.length) console.log('No compose files yet. Use `dct add <file>` or `dct import-vscode`.')
}

async function importVscode () {
  const saved = await readVscodeFiles()
  const config = loadConfig()
  let added = 0

  for (const file of saved) {
    if (config.files.some(existing => samePath(existing.path, file.path))) continue
    config.files.push({ ...file, status: null })
    added++
  }

  saveConfig(config)
  console.log(`Imported ${added} of ${saved.length} files from VS Code into ${configPath()}`)
}

main(process.argv.slice(2)).catch(error => {
  console.error(error instanceof Error ? error.message : error)
  process.exitCode = 1
})
