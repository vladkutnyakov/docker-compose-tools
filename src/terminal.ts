import * as vscode from 'vscode'
import path from "path"
import { SavedFile } from './types'

const activeTerminals = new Map<string, vscode.Terminal>()

export function getTerminal (fsPath: string) {
	return activeTerminals.get(fsPath)
}

export function createTerminal (item: SavedFile) {
  const fileDir = path.dirname(item.path)

	const terminal = vscode.window.createTerminal({
		name: item.label,
		cwd: fileDir,
	})
	activeTerminals.set(fileDir, terminal)

	return terminal
}

function removeTerminal (fsPath: string) {
  return activeTerminals.delete(fsPath)
}

export function tryTerminal (item: SavedFile) {
  const fileDir = path.dirname(item.path)

	const terminal = getTerminal(fileDir) ?? createTerminal(item)
	terminal.show()

	if (terminal.shellIntegration && terminal.shellIntegration.cwd?.fsPath !== fileDir) {
		terminal.sendText(`cd ${fileDir}`)
	}

	return terminal
}

export function registerTerminal (context: vscode.ExtensionContext) {
  const disposable = vscode.window.onDidCloseTerminal(terminal => {
    if ('cwd' in terminal.creationOptions) {
      const terminalPath = typeof terminal.creationOptions.cwd === 'string'
        ? terminal.creationOptions.cwd
        : terminal.creationOptions.cwd?.path

      if (!terminalPath) return

      removeTerminal(terminalPath)
    }
  })

  context.subscriptions.push(disposable)
}
