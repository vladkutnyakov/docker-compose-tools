import { useCallback, useEffect, useRef, useState } from 'react'
import { applyStatuses } from '../../../src/core/status'
import { ComposeProject, SavedFile } from '../../../src/core/types'

export type FetchProjects = () => Promise<ComposeProject[] | undefined>

// mirrors the extension's poll loop: one request in flight at a time, shared with manual refresh
export function useProjects (files: SavedFile[], fetchProjects: FetchProjects, pollMs: number) {
  const [projects, setProjects] = useState<ComposeProject[]>([])
  const [dockerRunning, setDockerRunning] = useState<boolean | undefined>(undefined)
  const inFlight = useRef<Promise<void> | undefined>(undefined)

  const refresh = useCallback(() => {
    inFlight.current ??= fetchProjects()
      .then(result => {
        setDockerRunning(result !== undefined)
        setProjects(result ?? [])
      })
      .catch(() => {})
      .finally(() => { inFlight.current = undefined })
    return inFlight.current
  }, [fetchProjects])

  useEffect(() => {
    let timer: NodeJS.Timeout | undefined
    let stopped = false

    const tick = async () => {
      await refresh()
      if (!stopped) timer = setTimeout(tick, pollMs)
    }
    tick()

    return () => {
      stopped = true
      clearTimeout(timer)
    }
  }, [refresh, pollMs])

  const withStatuses = files.map(file => ({ ...file }))
  applyStatuses(withStatuses, projects)

  return { files: withStatuses, dockerRunning, refresh }
}
