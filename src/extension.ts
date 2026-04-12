import * as vscode from 'vscode'
import { registerCommands } from './commands'
import { registerFileTree } from './fileTree'
import { registerTerminal } from './terminal'

export function activate (context: vscode.ExtensionContext) {
	const tree = registerFileTree(context)
	registerCommands(context, tree)
	registerTerminal(context)
}

export function deactivate () {}
