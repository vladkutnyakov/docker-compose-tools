import { ComposeProject, SavedFile, Status } from './types'

const STATUSES: Status[] = ['running', 'exited', 'idle']

// "running(2)" -> "running"; anything unknown falls back to idle
export function normalizeStatus (status: string | null | undefined): Status {
  const filtered = status ? status.replace(/\(.*\)/gm, '') : 'idle'
  return STATUSES.includes(filtered as Status) ? filtered as Status : 'idle'
}

// projects are matched by compose project name, which defaults to the parent folder name
export function applyStatuses (files: SavedFile[], projects: ComposeProject[]) {
  for (const file of files) {
    const project = projects.find(project => file.label === project.Name)
    file.status = project?.Status ?? 'idle'
  }
}
