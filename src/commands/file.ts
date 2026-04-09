import path from 'path'
import * as vscode from 'vscode'
import { FileTreeProvider } from '../fileTree'
import { SavedFile } from '../types'

export async function add (tree: FileTreeProvider) {
	const uris = await vscode.window.showOpenDialog({
		canSelectFiles: true,
		canSelectFolders: false,
		canSelectMany: true,
		openLabel: 'Выбрать файлы',
		filters: {
			'yml': ['yml', 'yaml']
		}
	})

	if (!uris) return

	tree.addFiles(uris)

	return uris
}

export async function remove (tree: FileTreeProvider, file: SavedFile) {
	return tree.removeFile(file)
}

export async function open (file: SavedFile) {
	return vscode.window.showTextDocument(vscode.Uri.file(file.path))
}

export async function openFolderInEditor (file: SavedFile) {
	return vscode.commands.executeCommand('vscode.openFolder', vscode.Uri.file(path.dirname(file.path)), true)
}

export async function openFolderInFileExplorer (file: SavedFile) {
	return vscode.commands.executeCommand('revealFileInOS', vscode.Uri.file(file.path))
}
