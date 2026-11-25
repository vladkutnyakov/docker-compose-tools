export interface SavedFile {
  name: string
  path: string
  label: string
  status: string | null
}

export interface ComposeProject {
  ConfigFiles: string
  Name: string
  Status: string
}

export type Status = 'running' | 'exited' | 'idle'
