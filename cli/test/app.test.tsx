import { render } from 'ink-testing-library'
import { describe, expect, it, vi } from 'vitest'
import { ComposeProject, SavedFile } from '../../src/core/types'
import { Config } from '../src/config'
import { App, AppDeps } from '../src/ui/App'

const file = (name: string): SavedFile => ({ name: 'docker-compose.yml', path: `/p/${name}/docker-compose.yml`, label: name, status: null })

const tick = (ms = 30) => new Promise(resolve => setTimeout(resolve, ms))

const RUNNING_API: ComposeProject[] = [{ Name: 'api', Status: 'running(2)', ConfigFiles: '' }]

function setup (projects: ComposeProject[] | 'docker-down' = RUNNING_API) {
  const config: Config = { files: [file('api'), file('web')], editor: 'zed', pollMs: 60_000 }
  const deps: AppDeps = {
    fetchProjects: vi.fn(async () => projects === 'docker-down' ? undefined : projects),
    runCompose: vi.fn(async (_file, _action, onLine) => {
      onLine('Container started')
      return 0
    }),
    openInEditor: vi.fn(),
    revealInFileManager: vi.fn(),
    saveConfig: vi.fn(),
  }
  const app = render(<App config={config} deps={deps} />)
  return { app, deps }
}

describe('App', () => {
  it('shows projects with statuses', async () => {
    const { app } = setup()
    await tick()
    const frame = app.lastFrame()!
    expect(frame).toContain('api')
    expect(frame).toContain('running(2)')
    expect(frame).toMatch(/web\s+idle/)
  })

  it('runs compose up for the selected project and shows output', async () => {
    const { app, deps } = setup()
    await tick()
    app.stdin.write('j')
    await tick()
    app.stdin.write('u')
    await tick()

    expect(deps.runCompose).toHaveBeenCalledWith(expect.objectContaining({ label: 'web' }), 'up', expect.any(Function))
    expect(app.lastFrame()).toContain('Container started')
    expect(app.lastFrame()).toContain('✓')
  })

  it('asks before down', async () => {
    const { app, deps } = setup()
    await tick()
    app.stdin.write('d')
    await tick()
    expect(app.lastFrame()).toContain('[y/N]')
    app.stdin.write('n')
    await tick()
    expect(deps.runCompose).not.toHaveBeenCalled()

    app.stdin.write('d')
    await tick()
    app.stdin.write('y')
    await tick()
    expect(deps.runCompose).toHaveBeenCalledWith(expect.objectContaining({ label: 'api' }), 'down', expect.any(Function))
  })

  it('reorders and saves', async () => {
    const { app, deps } = setup()
    await tick()
    app.stdin.write('J')
    await tick()
    expect(deps.saveConfig).toHaveBeenCalledWith(expect.objectContaining({
      files: [expect.objectContaining({ label: 'web' }), expect.objectContaining({ label: 'api' })],
    }))
  })

  it('opens the file in the editor on enter', async () => {
    const { app, deps } = setup()
    await tick()
    app.stdin.write('\r')
    await tick()
    expect(deps.openInEditor).toHaveBeenCalledWith('zed', '/p/api/docker-compose.yml')
  })

  it('warns and blocks commands when docker is down', async () => {
    const { app, deps } = setup('docker-down')
    await tick()
    expect(app.lastFrame()).toContain('Docker is not running')
    app.stdin.write('u')
    await tick()
    expect(deps.runCompose).not.toHaveBeenCalled()
  })
})
