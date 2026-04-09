import * as vscode from 'vscode'
import { SavedFile } from './types'
import path from 'path'

export class FileTreeProvider implements vscode.TreeDataProvider<SavedFile> {
  private state: vscode.Memento
  private files: SavedFile[] = []
  private _onDidChangeTreeData = new vscode.EventEmitter<SavedFile | undefined | void>()
  readonly onDidChangeTreeData = this._onDidChangeTreeData.event

  constructor (state: vscode.Memento) {
    this.state = state
    this.files = this.getFilesFromState()
  }

  getTreeItem (element: SavedFile) {
    const file = vscode.Uri.file(element.path)
    return new FileItem(file, element.label)
  }

  getChildren (element?: SavedFile | undefined) {
    return this.files
  }

  getParent (element: SavedFile): vscode.ProviderResult<SavedFile> {
    throw new Error('Method "getParent" not implemented.')
  }

  resolveTreeItem (item: vscode.TreeItem, element: SavedFile, token: vscode.CancellationToken): vscode.ProviderResult<vscode.TreeItem> {
    throw new Error('Method "resolveTreeItem" not implemented.')
  }

  refresh () {
    this._onDidChangeTreeData.fire()
  }

  getFilesFromState () {
    return this.state.get<SavedFile[]>('savedFiles', [])
  }

  async addFiles (uris: vscode.Uri[]) {
		for (const uri of uris) {
			const filePath = uri.fsPath
			const fileName = path.basename(filePath)
      const fileLabel = path.dirname(uri.path).split('/').pop() ?? path.dirname(filePath)

			this.files.push({
        name: fileName,
        path: filePath,
        label: fileLabel
      })
		}
		await this.state.update('savedFiles', this.files)

    this.refresh()
  }

  async removeFile (file: SavedFile) {
    const index = this.files.findIndex(item => item.path === file.path)
    if (index === -1) return

    this.files.splice(index, 1)
		await this.state.update('savedFiles', this.files)

    this.refresh()
  }
}

class FileItem extends vscode.TreeItem {
  constructor (uri: vscode.Uri, label: string) {
    super(uri)
    this.label = label
  }
}

export function registerFileTree (context: vscode.ExtensionContext) {
	const treeProvider = new FileTreeProvider(context.globalState)

	const tree = vscode.window.createTreeView('dockerComposeFiles', {
		treeDataProvider: treeProvider,
	})

	context.subscriptions.push(tree)

  return treeProvider
}
