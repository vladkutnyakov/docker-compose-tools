import { spawn } from 'child_process'
import path from 'path'
import { SavedFile } from '../../src/core/types'

export type ComposeAction = 'pull' | 'up' | 'stop' | 'down' | 'logs'

const ARGS: Record<ComposeAction, string[]> = {
  pull: ['pull'],
  up: ['up', '-d'],
  stop: ['stop'],
  down: ['down'],
  logs: ['logs', '--tail', '100', '--no-color'],
}

export const composeCommand = (action: ComposeAction) => ['docker', 'compose', ...ARGS[action]].join(' ')

// runs `docker compose <action>` in the compose file's folder, like the extension's terminals did
export function runCompose (file: SavedFile, action: ComposeAction, onLine: (line: string) => void) {
  // --progress is too new for older compose versions, COMPOSE_PROGRESS is simply ignored there
  return runProcess('docker', ['compose', '--ansi', 'never', ...ARGS[action]], path.dirname(file.path), onLine, { COMPOSE_PROGRESS: 'plain' })
}

export function runProcess (command: string, args: string[], cwd: string, onLine: (line: string) => void, env: Record<string, string> = {}) {
  return new Promise<number>(resolve => {
    const child = spawn(command, args, { cwd, windowsHide: true, env: { ...process.env, ...env } })

    const pipe = (stream: NodeJS.ReadableStream) => {
      let buffer = ''
      stream.setEncoding('utf8')
      stream.on('data', (chunk: string) => {
        buffer += chunk
        const lines = buffer.split(/\r?\n|\r/)
        buffer = lines.pop() ?? ''
        lines.filter(Boolean).forEach(onLine)
      })
      stream.on('end', () => { if (buffer) onLine(buffer) })
    }

    pipe(child.stdout)
    pipe(child.stderr)

    child.on('error', error => {
      onLine(error.message)
      resolve(-1)
    })
    child.on('close', code => resolve(code ?? -1))
  })
}

// fire and forget: editor / file manager windows
export function launch (command: string, args: string[]) {
  try {
    const child = spawn(command, args, { detached: true, stdio: 'ignore', shell: process.platform === 'win32', windowsHide: true })
    child.on('error', () => {})
    child.unref()
  } catch {
    // ignore, nothing useful to show in the tui
  }
}

const quote = (arg: string) => /[\s"]/.test(arg) ? `"${arg.replace(/"/g, '\\"')}"` : arg

export function openInEditor (editor: string, target: string, newWindow = false) {
  const args = newWindow ? ['-n', target] : [target]
  launch(editor, process.platform === 'win32' ? args.map(quote) : args)
}

export function revealInFileManager (filePath: string) {
  if (process.platform === 'win32') {
    spawn('explorer.exe', [`/select,${filePath}`], { detached: true, stdio: 'ignore' }).unref()
  } else if (process.platform === 'darwin') {
    launch('open', ['-R', filePath])
  } else {
    launch('xdg-open', [path.dirname(filePath)])
  }
}
