# docker-compose-tools

Terminal UI for managing Docker Compose projects — the CLI companion to the
[Docker Compose Tools](https://github.com/vladkutnyakov/docker-compose-tools)
VS Code extension. Works in any terminal; made to live in Zed's terminal panel.

## Requirements

- Node.js 22.13 or newer
- Docker Engine and Docker Compose CLI available in `PATH`

## Install

> **This is a CLI tool, not a library.** Install it globally with `-g`,
> otherwise the `dct` command won't be on your `PATH`.

```console
npm install -g docker-compose-tools
```

Import your project list from the VS Code extension:

```console
dct import-vscode
```

## Usage

| Command | Action |
|--------|--------|
| `dct` | Open the terminal UI (needs an interactive terminal) |
| `dct add <file...>` | Add compose files to the list |
| `dct ls` | Print saved projects with their status, no TUI |
| `dct import-vscode` | Copy the list from the VS Code extension |
| `dct config` | Print the config file path |

### Keybindings

| Key | Action |
|-----|--------|
| `↑`/`↓`, `j`/`k` | Select a project |
| `Shift+↑`/`↓`, `K`/`J` | Move a project up or down |
| `u` / `s` / `d` / `p` | `up -d` / `stop` / `down` (asks first) / `pull` |
| `l` | `docker compose logs --tail 100` |
| `Enter` / `o` / `f` | Open the file in the editor / the folder in a new window / in the file manager |
| `a` / `x` | Add a file / remove it from the list |
| `r`, `?`, `q` | Refresh statuses, help, quit |

## Settings

Stored in `%APPDATA%\docker-compose-tools\config.json` on Windows and
`~/.config/docker-compose-tools/config.json` on macOS/Linux:

- `editor` — command used to open files and folders (default: `zed`)
- `pollMs` — status polling interval (default: `2000`)

## Zed setup

Example tasks, keymap and settings live in
[`cli/zed/`](https://github.com/vladkutnyakov/docker-compose-tools/tree/main/cli/zed):
a **Compose Tools** task that runs `dct`, per-file `compose: up/stop/down/pull/logs`
tasks (`$ZED_DIRNAME`), a `ctrl-alt-d` keybinding, and a terminal docked to the
side so the TUI looks like a sidebar.

## License

[MIT](https://github.com/vladkutnyakov/docker-compose-tools/blob/main/LICENSE)
