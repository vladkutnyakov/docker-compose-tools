import * as vscode from 'vscode'
import { registerCommands } from './commands'
import { registerFileTree } from './fileTree'

export function activate (context: vscode.ExtensionContext) {
	const tree = registerFileTree(context)
	registerCommands(context, tree)
}

export function deactivate () {}
