import { exec } from 'child_process'
import { promisify } from 'util'
import { ComposeProject } from './types'

const execAsync = promisify(exec)

// undefined means docker is not available (daemon stopped or cli missing)
export async function fetchProjects (): Promise<ComposeProject[] | undefined> {
  try {
    const { stdout } = await execAsync('docker compose ls -a --format json', { windowsHide: true })
    return JSON.parse(stdout) as ComposeProject[]
  } catch {
    return undefined
  }
}
