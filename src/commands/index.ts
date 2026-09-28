import * as vscode from 'vscode'
import { FileTreeProvider } from '../fileTree'
import { SavedFile } from '../types'
import { pull, up, stop, down } from './compose'
import { add, open, openFolderInEditor, openFolderInFileExplorer, remove } from './file'

export function registerCommands (context: vscode.ExtensionContext, tree: FileTreeProvider) {
	const withDocker = (command: (item: SavedFile) => void) => (item: SavedFile) => {
		if (tree.dockerRunning === false) {
			vscode.window.showErrorMessage('Docker is not running. Start Docker and try again.')
			return
		}
		command(item)
	}

	context.subscriptions.push(
		vscode.commands.registerCommand('docker-compose-tools.file.add', () => add(tree)),
		vscode.commands.registerCommand('docker-compose-tools.file.open', open),
		vscode.commands.registerCommand('docker-compose-tools.file.openFolderInEditor', openFolderInEditor),
		vscode.commands.registerCommand('docker-compose-tools.file.openFolderInFileExplorer', openFolderInFileExplorer),
		vscode.commands.registerCommand('docker-compose-tools.file.remove', (item: SavedFile) => remove(tree, item)),

		vscode.commands.registerCommand('docker-compose-tools.compose.pull', withDocker(pull)),
		vscode.commands.registerCommand('docker-compose-tools.compose.up', withDocker(up)),
		vscode.commands.registerCommand('docker-compose-tools.compose.stop', withDocker(stop)),
		vscode.commands.registerCommand('docker-compose-tools.compose.down', withDocker(down)),
	)
}
