import * as vscode from 'vscode'
import { ComposeProject, SavedFile } from './types'
import path from 'path'
import { exec } from 'child_process'
import { promisify } from 'util'

const TREE_MIME = 'application/vnd.code.tree.dockercomposefiles'
const CLICK_COMMAND = 'docker-compose-tools.file.click'
const DOUBLE_CLICK_DELAY = 500

// pinned row shown above the files while docker is unavailable
const DOCKER_WARNING = { dockerWarning: true } as const
type TreeElement = SavedFile | typeof DOCKER_WARNING
const isDockerWarning = (element: TreeElement): element is typeof DOCKER_WARNING => element === DOCKER_WARNING

export class FileTreeProvider implements vscode.TreeDataProvider<TreeElement>, vscode.TreeDragAndDropController<TreeElement> {
  private state: vscode.Memento
  private files: SavedFile[] = []

  readonly dragMimeTypes = [TREE_MIME]
  readonly dropMimeTypes = [TREE_MIME]

  private _onDidChangeTreeData = new vscode.EventEmitter<TreeElement | undefined | void>()
  readonly onDidChangeTreeData = this._onDidChangeTreeData.event

  dockerRunning: boolean | undefined
  private _onDidChangeDockerRunning = new vscode.EventEmitter<boolean>()
  readonly onDidChangeDockerRunning = this._onDidChangeDockerRunning.event

  private POLL_DELAY = 2000

  constructor (state: vscode.Memento, private extensionUri: vscode.Uri) {
    this.state = state
    this.files = this.getFilesFromState()
    this.poll()
  }

  getTreeItem (element: TreeElement) {
    if (isDockerWarning(element)) return this.getDockerWarningItem()

    const item = new FileItem(vscode.Uri.file(element.path), element.label)

    const statuses = ['running', 'exited', 'idle']

    const filteredStatus = element.status
      ? element.status.replace(/\(.*\)/gm, '')
      : 'idle'

    const status = statuses.includes(filteredStatus) ? filteredStatus : 'idle'

    // svg instead of ThemeIcon: vscode repaints ThemeIcon colors in selected rows
    item.iconPath = vscode.Uri.joinPath(this.extensionUri, 'resources', 'status', `${status}.svg`)
    item.description = element.status || 'idle'
    item.command = {
      command: CLICK_COMMAND,
      title: 'Open',
      arguments: [element],
    }

    return item
  }

  getDockerWarningItem () {
    const item = new vscode.TreeItem('Docker is not running')
    item.iconPath = new vscode.ThemeIcon('warning', new vscode.ThemeColor('list.warningForeground'))
    item.tooltip = 'Start Docker to manage compose projects'
    item.contextValue = 'dockerWarning'

    return item
  }

  getChildren (element?: TreeElement | undefined): TreeElement[] {
    return this.dockerRunning === false
      ? [DOCKER_WARNING, ...this.files]
      : this.files
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

  handleDrag (source: readonly TreeElement[], dataTransfer: vscode.DataTransfer) {
    const files = source.filter((element): element is SavedFile => !isDockerWarning(element))
    dataTransfer.set(TREE_MIME, new vscode.DataTransferItem(files.map(file => file.path)))
  }

  async handleDrop (target: TreeElement | undefined, dataTransfer: vscode.DataTransfer) {
    const paths: string[] | undefined = dataTransfer.get(TREE_MIME)?.value
    if (!paths?.length) return
    if (target && isDockerWarning(target)) return
    if (target && paths.includes(target.path)) return

    await this.moveFiles(paths, target)
  }

  async moveFiles (paths: string[], target?: SavedFile) {
    const firstMovedIndex = this.files.findIndex(file => paths.includes(file.path))
    const moved = this.files.filter(file => paths.includes(file.path))
    if (!moved.length) return

    const rest = this.files.filter(file => !paths.includes(file.path))

    let insertIndex = rest.length
    if (target) {
      const targetIndex = rest.findIndex(file => file.path === target.path)
      if (targetIndex === -1) return

      // dragging down -> place after target, dragging up -> place before target
      const originalTargetIndex = this.files.findIndex(file => file.path === target.path)
      insertIndex = firstMovedIndex < originalTargetIndex ? targetIndex + 1 : targetIndex
    }

    rest.splice(insertIndex, 0, ...moved)
    this.files.splice(0, this.files.length, ...rest)
    await this.state.update('savedFiles', this.files)

    this.refresh()
  }

  execAsync = promisify(exec)
  async poll () {
    try {
      const projects = await this.fetchProjects()
      this.setDockerRunning(projects !== undefined)
      await this.updateStatuses(projects ?? [])
    } catch (e) {
      console.log(e)
    }

    setTimeout(() => this.poll(), this.POLL_DELAY)
  }

  // undefined means docker is not available (daemon stopped or cli missing)
  async fetchProjects () {
    try {
      const { stdout } = await this.execAsync('docker compose ls -a --format json')
      return JSON.parse(stdout) as ComposeProject[]
    } catch (e) {
      console.log(e)
      return undefined
    }
  }

  setDockerRunning (running: boolean) {
    if (this.dockerRunning === running) return

    this.dockerRunning = running
    this._onDidChangeDockerRunning.fire(running)
  }

  async updateStatuses (projects: ComposeProject[]) {
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
    this.contextValue = 'composeFile'
  }
}

export function registerFileTree (context: vscode.ExtensionContext) {
	const treeProvider = new FileTreeProvider(context.globalState, context.extensionUri)

	const tree = vscode.window.createTreeView('dockerComposeFiles', {
		treeDataProvider: treeProvider,
		dragAndDropController: treeProvider,
		canSelectMany: true,
	})

  // tree views have no native double click event, so detect it from two clicks in a row
  let lastClick: { path: string, time: number } | undefined
  const click = vscode.commands.registerCommand(CLICK_COMMAND, (file: SavedFile) => {
    const now = Date.now()
    const isDoubleClick = lastClick?.path === file.path && now - lastClick.time < DOUBLE_CLICK_DELAY

    lastClick = isDoubleClick ? undefined : { path: file.path, time: now }
    if (isDoubleClick) {
      vscode.commands.executeCommand('docker-compose-tools.file.open', file)
    }
  })

  const dockerStatus = treeProvider.onDidChangeDockerRunning(running => {
    if (!running) {
      vscode.window.showWarningMessage('Docker is not running. Start Docker to manage compose projects.')
    }
  })

  context.subscriptions.push(tree, click, dockerStatus)

  return treeProvider
}
