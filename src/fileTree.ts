import * as vscode from 'vscode'
import { ComposeProject, SavedFile } from './types'
import path from 'path'
import { exec } from 'child_process'
import { promisify } from 'util'

export class FileTreeProvider implements vscode.TreeDataProvider<SavedFile> {
  private state: vscode.Memento
  private files: SavedFile[] = []

  private _onDidChangeTreeData = new vscode.EventEmitter<SavedFile | undefined | void>()
  readonly onDidChangeTreeData = this._onDidChangeTreeData.event

  private POLL_DELAY = 2000

  constructor (state: vscode.Memento) {
    this.state = state
    this.files = this.getFilesFromState()
    this.poll()
  }

  getTreeItem (element: SavedFile) {
    const item = new FileItem(vscode.Uri.file(element.path), element.label)

    const statusMap = {
      running: { icon: 'circle-filled', color: 'testing.iconPassed' },
      exited: { icon: 'circle-filled', color: 'testing.iconFailed' },
      idle: { icon: 'circle-filled', color: 'testing.iconSkipped' },
    }

    const filteredStatus = (element.status
      ? element.status.replace(/\(.*\)/gm, '')
      : 'idle') as keyof typeof statusMap

    const status = statusMap[filteredStatus] ?? statusMap['idle']

    item.iconPath = new vscode.ThemeIcon(status.icon, new vscode.ThemeColor(status.color))
    item.description = element.status || 'idle'

    return item
  }

  getChildren (element?: SavedFile | undefined) {
    return this.files
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
      if (this.files.find(file => file.path === filePath)) continue

			const fileName = path.basename(filePath)
      const fileLabel = path.dirname(uri.path).split('/').pop() ?? path.dirname(filePath)

			this.files.push({
        name: fileName,
        path: filePath,
        label: fileLabel,
        status: null
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

  execAsync = promisify(exec)
  async poll () {
    try {
      await this.updateStatuses()
    } catch (e) {
      console.log(e)
    }

    setTimeout(() => this.poll(), this.POLL_DELAY)
  }

  async updateStatuses () {
    const { stdout } = await this.execAsync('docker compose ls -a --format json')
    const projects: ComposeProject[] = JSON.parse(stdout)
    
    for (const file of this.files) {
      const project = projects.find(project => file.label === project.Name)
      file.status = project?.Status ?? 'idle'
    }

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
