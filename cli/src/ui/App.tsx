import path from 'path'
import { useRef, useState } from 'react'
import { Box, Text, useApp, useInput, useWindowSize } from 'ink'
import { moveFiles } from '../../../src/core/reorder'
import { normalizeStatus } from '../../../src/core/status'
import { SavedFile, Status } from '../../../src/core/types'
import { addFiles, Config } from '../config'
import { ComposeAction, composeCommand } from '../runner'
import { FetchProjects, useProjects } from './useProjects'

export interface AppDeps {
  fetchProjects: FetchProjects
  runCompose: (file: SavedFile, action: ComposeAction, onLine: (line: string) => void) => Promise<number>
  openInEditor: (editor: string, target: string, newWindow?: boolean) => void
  revealInFileManager: (filePath: string) => void
  saveConfig: (config: Config) => void
}

const STATUS_COLOR: Record<Status, string> = { running: 'green', exited: 'red', idle: 'gray' }
const LOG_LINES = 12

type Mode =
  | { type: 'normal' }
  | { type: 'help' }
  | { type: 'input', value: string }
  | { type: 'confirm', question: string, onYes: () => void }

interface Log {
  title: string
  lines: string[]
  exitCode?: number
}

export function App ({ config: initialConfig, deps }: { config: Config, deps: AppDeps }) {
  const { exit } = useApp()
  const { rows } = useWindowSize()

  const [config, setConfig] = useState(initialConfig)
  const [selected, setSelected] = useState(0)
  const [mode, setMode] = useState<Mode>({ type: 'normal' })
  const [message, setMessage] = useState<{ text: string, color: string } | undefined>()
  const [log, setLog] = useState<Log | undefined>()
  const [running, setRunning] = useState<Record<string, ComposeAction>>({})
  // the latest log id wins, so output of an older command can't overwrite a newer one
  const logId = useRef(0)

  const { files, dockerRunning, refresh } = useProjects(config.files, deps.fetchProjects, config.pollMs)
  const current = files[Math.min(selected, files.length - 1)] as SavedFile | undefined

  const notify = (text: string, color = 'yellow') => setMessage({ text, color })

  const updateFiles = (next: SavedFile[]) => {
    const nextConfig = { ...config, files: next }
    setConfig(nextConfig)
    deps.saveConfig(nextConfig)
  }

  const runAction = (file: SavedFile, action: ComposeAction) => {
    if (dockerRunning === false) return notify('Docker is not running. Start Docker and try again.', 'red')
    if (running[file.path]) return notify(`${file.label}: ${running[file.path]} is still running`)

    const id = ++logId.current
    const title = `${file.label} › ${composeCommand(action)}`
    setLog({ title, lines: [] })
    setMessage(undefined)
    setRunning(prev => ({ ...prev, [file.path]: action }))

    const append = (line: string) => {
      if (logId.current !== id) return
      setLog(prev => prev && { ...prev, lines: [...prev.lines, line].slice(-200) })
    }

    deps.runCompose(file, action, append).then(exitCode => {
      setRunning(({ [file.path]: _, ...rest }) => rest)
      if (logId.current === id) setLog(prev => prev && { ...prev, exitCode })
      refresh()
    })
  }

  const move = (direction: -1 | 1) => {
    if (!current) return
    const index = files.indexOf(current)
    const target = files[index + direction]
    if (!target) return

    const reordered = moveFiles(config.files, [current.path], target.path)
    if (!reordered) return
    updateFiles(reordered)
    setSelected(index + direction)
  }

  const submitInput = (value: string) => {
    // explorer's "copy as path" wraps paths in quotes
    const paths = value.split(/\s*[;\n]\s*/).map(item => item.trim().replace(/^"(.*)"$/, '$1')).filter(Boolean)
    setMode({ type: 'normal' })
    if (!paths.length) return

    const next = { ...config, files: [...config.files] }
    const result = addFiles(next, paths)
    if (result.added.length) {
      updateFiles(next.files)
      setSelected(next.files.length - 1)
      refresh()
    }

    const skipped = result.skipped.map(item => `${path.basename(item.path)}: ${item.reason}`)
    if (skipped.length) notify(skipped.join('; '), result.added.length ? 'yellow' : 'red')
    else notify(`Added ${result.added.map(file => file.label).join(', ')}`, 'green')
  }

  useInput((input, key) => {
    if (mode.type === 'input') {
      if (key.escape) return setMode({ type: 'normal' })
      if (key.return) return submitInput(mode.value)
      if (key.backspace || key.delete) return setMode({ type: 'input', value: mode.value.slice(0, -1) })
      if (!key.ctrl && !key.meta && input) setMode({ type: 'input', value: mode.value + input.replace(/\r?\n$/, '') })
      return
    }

    if (mode.type === 'confirm') {
      setMode({ type: 'normal' })
      if (input === 'y' || input === 'Y') mode.onYes()
      return
    }

    if (mode.type === 'help') return setMode({ type: 'normal' })

    if (input === 'q' || key.escape || (key.ctrl && input === 'c')) return exit()
    if (input === '?') return setMode({ type: 'help' })
    if (input === 'a') return setMode({ type: 'input', value: '' })
    if (input === 'r') {
      notify('Refreshing…', 'gray')
      refresh().then(() => setMessage(undefined))
      return
    }

    if (key.upArrow && key.shift || input === 'K') return move(-1)
    if (key.downArrow && key.shift || input === 'J') return move(1)
    if (key.upArrow || input === 'k') return setSelected(index => Math.max(0, index - 1))
    if (key.downArrow || input === 'j') return setSelected(index => Math.min(files.length - 1, index + 1))
    if (key.home || input === 'g') return setSelected(0)
    if (key.end || input === 'G') return setSelected(Math.max(0, files.length - 1))

    if (!current) return

    if (input === 'u') return runAction(current, 'up')
    if (input === 's') return runAction(current, 'stop')
    if (input === 'p') return runAction(current, 'pull')
    if (input === 'l') return runAction(current, 'logs')
    if (input === 'd') {
      return setMode({ type: 'confirm', question: `docker compose down ${current.label}?`, onYes: () => runAction(current, 'down') })
    }

    if (key.return) return deps.openInEditor(config.editor, current.path)
    if (input === 'o') return deps.openInEditor(config.editor, path.dirname(current.path), true)
    if (input === 'f') return deps.revealInFileManager(current.path)
    if (input === 'x') {
      return setMode({
        type: 'confirm',
        question: `Remove ${current.label} from the list? (file stays on disk)`,
        onYes: () => {
          updateFiles(config.files.filter(file => file.path !== current.path))
          setSelected(index => Math.max(0, Math.min(index, files.length - 2)))
        },
      })
    }
  })

  if (mode.type === 'help') return <Help />

  const labelWidth = Math.max(8, ...files.map(file => file.label.length))
  const logLines = log ? log.lines.slice(-Math.max(3, Math.min(LOG_LINES, rows - files.length - 8))) : []

  return (
    <Box flexDirection="column">
      <Text bold>Compose Tools <Text dimColor>({files.length})</Text></Text>

      {dockerRunning === false && <Text color="yellow">⚠ Docker is not running</Text>}
      {!files.length && <Text dimColor>No compose files yet. Press <Text bold>a</Text> to add one.</Text>}

      {files.map((file, index) => {
        const status = normalizeStatus(file.status)
        const isSelected = file === current
        const action = running[file.path]

        return (
          <Box key={file.path}>
            <Text color={isSelected ? 'cyan' : undefined}>{isSelected ? '›' : ' '} </Text>
            <Text color={STATUS_COLOR[status]}>●</Text>
            <Text bold={isSelected} inverse={isSelected}> {file.label.padEnd(labelWidth)} </Text>
            <Text dimColor wrap="truncate">
              {' '}{dockerRunning === undefined ? '…' : file.status || 'idle'}
              {action ? <Text color="cyan"> ⟳ {action}</Text> : null}
            </Text>
          </Box>
        )
      })}

      {log && (
        <Box flexDirection="column" marginTop={1} borderStyle="single" borderColor="gray" paddingX={1}>
          <Text bold wrap="truncate">
            {log.title}
            {log.exitCode === undefined
              ? <Text color="cyan"> …</Text>
              : <Text color={log.exitCode === 0 ? 'green' : 'red'}> {log.exitCode === 0 ? '✓' : `✗ exit ${log.exitCode}`}</Text>}
          </Text>
          {logLines.map((line, index) => <Text key={index} dimColor wrap="truncate">{line}</Text>)}
        </Box>
      )}

      <Box marginTop={1}>
        {mode.type === 'input' && <Text>Path: <Text color="cyan">{mode.value}</Text><Text inverse> </Text></Text>}
        {mode.type === 'confirm' && <Text color="yellow">{mode.question} <Text bold>[y/N]</Text></Text>}
        {mode.type === 'normal' && (message
          ? <Text color={message.color}>{message.text}</Text>
          : <Text dimColor>u up · s stop · d down · p pull · ⏎ open · ? help</Text>)}
      </Box>
    </Box>
  )
}

const HELP: [string, string][] = [
  ['↑/↓  j/k', 'select'],
  ['Shift+↑/↓  K/J', 'move up / down'],
  ['u', 'docker compose up -d'],
  ['s', 'docker compose stop'],
  ['d', 'docker compose down (asks first)'],
  ['p', 'docker compose pull'],
  ['l', 'docker compose logs --tail 100'],
  ['Enter', 'open compose file in editor'],
  ['o', 'open folder in a new editor window'],
  ['f', 'reveal in file manager'],
  ['a', 'add compose file (paths separated by ;)'],
  ['x', 'remove from list (asks first)'],
  ['r', 'refresh statuses now'],
  ['q  Esc', 'quit'],
]

function Help () {
  return (
    <Box flexDirection="column">
      <Text bold>Compose Tools: keys</Text>
      {HELP.map(([keys, description]) => (
        <Text key={keys}><Text color="cyan">{keys.padEnd(16)}</Text>{description}</Text>
      ))}
      <Text dimColor>press any key to go back</Text>
    </Box>
  )
}
