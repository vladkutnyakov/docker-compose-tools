import * as vscode from 'vscode'
import { FileTreeProvider } from './fileTree'
import { SavedFile } from './types'
import { pull, up, down } from './commands/compose'
import { add, open, openFolderInEditor, openFolderInFileExplorer, remove } from './commands/file'

export function registerCommands (context: vscode.ExtensionContext, tree: FileTreeProvider) {
	context.subscriptions.push(
		vscode.commands.registerCommand('docker-compose-tools.file.add', () => add(tree)),
		vscode.commands.registerCommand('docker-compose-tools.file.open', open),
		vscode.commands.registerCommand('docker-compose-tools.file.openFolderInEditor', openFolderInEditor),
		vscode.commands.registerCommand('docker-compose-tools.file.openFolderInFileExplorer', openFolderInFileExplorer),
		vscode.commands.registerCommand('docker-compose-tools.file.remove', (item: SavedFile) => remove(tree, item)),

		vscode.commands.registerCommand('docker-compose-tools.compose.pull', pull),
		vscode.commands.registerCommand('docker-compose-tools.compose.up', up),
		vscode.commands.registerCommand('docker-compose-tools.compose.down', down),
	)
}
