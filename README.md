# Docker Compose Tools

Расширение для Visual Studio Code, предназначенное для управления проектами Docker Compose. Предоставляет выделенную панель в боковой панели редактора, позволяющую добавлять файлы `docker-compose.yml`, отслеживать статусы проектов в реальном времени и выполнять основные команды Docker Compose через контекстное меню.

## Возможности

- **Панель управления проектами** -- выделенное представление в Activity Bar со списком добавленных файлов Docker Compose.
- **Мониторинг статусов** -- автоматический опрос `docker compose ls` каждые 2 секунды с цветовой индикацией состояния проектов: зеленый (running), красный (exited), серый (idle). Кнопка обновления в заголовке панели запрашивает статусы немедленно.
- **Проверка Docker** -- если Docker не запущен, в панели появляется предупреждение, а команды Docker Compose блокируются до его запуска.
- **Управление жизненным циклом** -- команды `pull`, `up`, `stop` и `down` доступны через контекстное меню каждого проекта.
- **Управление файлами** -- добавление и удаление файлов `docker-compose.yml` / `docker-compose.yaml` из панели, изменение порядка перетаскиванием.
- **Быстрый доступ** -- открытие файла конфигурации в редакторе, открытие каталога проекта в новом окне VS Code или в системном файловом менеджере.
- **Персистентность** -- список добавленных файлов сохраняется между сессиями в глобальном состоянии расширения.
- **Управление терминалами** -- каждый проект получает собственный терминал, привязанный к каталогу файла конфигурации. Терминалы переиспользуются при повторных вызовах команд.

## Требования

- Visual Studio Code версии 1.92.0 или выше.
- Docker Engine и Docker Compose CLI, установленные и доступные в `PATH`.

## Установка

Установите расширение из Visual Studio Code Marketplace, выполнив поиск по имени **Docker Compose Tools**, или установите файл `.vsix` вручную:

```
code --install-extension docker-compose-tools-0.2.0.vsix
```

## Использование

1. После установки на Activity Bar появится иконка **Compose Tools**.
2. Нажмите кнопку **+** в заголовке панели, чтобы добавить один или несколько файлов `docker-compose.yml`.
3. Добавленные файлы отображаются в виде списка с именем родительского каталога в качестве метки и текущим статусом проекта.
4. Щелкните правой кнопкой мыши по элементу списка, чтобы открыть контекстное меню с доступными действиями.
5. Двойной щелчок по элементу открывает файл конфигурации в редакторе. Порядок элементов можно менять перетаскиванием.

### Команды Docker Compose

| Команда | Действие |
|---------|----------|
| Compose Pull | Выполняет `docker compose pull` |
| Compose Up | Выполняет `docker compose up -d` |
| Compose Stop | Выполняет `docker compose stop` |
| Compose Down | Выполняет `docker compose down` |

### Команды управления файлами

| Команда | Действие |
|---------|----------|
| Open File | Открывает файл конфигурации в редакторе |
| Open Folder in Editor | Открывает каталог проекта в новом окне VS Code |
| Open Folder in File Explorer | Открывает каталог проекта в системном файловом менеджере |
| Add File | Добавляет файлы `.yml` / `.yaml` в панель |
| Remove File | Удаляет файл из панели (не с диска) |
| Refresh | Немедленно обновляет статусы проектов |

## Zed и терминал: `dct`

Расширения Zed не умеют добавлять собственные панели, поэтому функции расширения повторяет консольное приложение `dct` (папка `cli/`). Это TUI со списком проектов, живыми статусами и теми же командами. Работает в панели терминала Zed и в любом другом терминале.

Требуется Node.js 22.13 или выше.

```
npm install -g docker-compose-tools
dct import-vscode        # переносит список файлов из расширения VS Code
dct                      # открывает TUI
```

Другие команды: `dct add <файл...>`, `dct ls` (статусы без TUI), `dct config` (путь к файлу настроек). В настройках (`%APPDATA%\docker-compose-tools\config.json`, на macOS и Linux `~/.config/docker-compose-tools/config.json`) можно поменять редактор (`"editor": "zed"`) и интервал опроса (`"pollMs": 2000`).

| Клавиша | Действие |
|---------|----------|
| `↑`/`↓`, `j`/`k` | Выбор проекта |
| `Shift+↑`/`↓`, `K`/`J` | Перемещение проекта вверх и вниз |
| `u` / `s` / `d` / `p` | `up -d` / `stop` / `down` (с подтверждением) / `pull` |
| `l` | `docker compose logs --tail 100` |
| `Enter` / `o` / `f` | Открыть файл в редакторе / папку в новом окне / в проводнике |
| `a` / `x` | Добавить файл / убрать из списка |
| `r`, `?`, `q` | Обновить статусы, справка, выход |

### Настройка Zed

Примеры лежат в `cli/zed/`:

- `tasks.json`: задача **Compose Tools**, которая запускает `dct`, и задачи `compose: up/stop/down/pull/logs` для открытого compose-файла (`$ZED_DIRNAME`). Скопируйте в `%APPDATA%\Zed\tasks.json`.
- `keymap.json`: `ctrl-alt-d` открывает **Compose Tools**.
- `settings.json`: `"terminal": { "dock": "right" }` ставит терминал сбоку, и TUI выглядит как боковая панель.

## Информация о релизе

История изменений по версиям — в [CHANGELOG.md](CHANGELOG.md).

---

# Docker Compose Tools (English)

A Visual Studio Code extension for managing Docker Compose projects. It provides a dedicated panel in the editor sidebar that allows adding `docker-compose.yml` files, monitoring project statuses in real time, and executing common Docker Compose commands via context menu.

## Features

- **Project management panel** -- a dedicated view in the Activity Bar listing all added Docker Compose files.
- **Status monitoring** -- automatic polling of `docker compose ls` every 2 seconds with color-coded project status indicators: green (running), red (exited), grey (idle). The refresh button in the panel header fetches statuses immediately.
- **Docker check** -- when Docker is not running, the panel shows a warning and Docker Compose commands are blocked until it starts.
- **Lifecycle management** -- `pull`, `up`, `stop`, and `down` commands accessible via the context menu of each project.
- **File management** -- add and remove `docker-compose.yml` / `docker-compose.yaml` files from the panel, reorder them with drag and drop.
- **Quick access** -- open the configuration file in the editor, open the project directory in a new VS Code window, or reveal it in the system file explorer.
- **Persistence** -- the list of added files is preserved across sessions using the extension's global state.
- **Terminal management** -- each project gets its own terminal bound to the configuration file's directory. Terminals are reused on subsequent command invocations.

## Requirements

- Visual Studio Code version 1.92.0 or higher.
- Docker Engine and Docker Compose CLI installed and available in `PATH`.

## Installation

Install the extension from the Visual Studio Code Marketplace by searching for **Docker Compose Tools**, or install a `.vsix` file manually:

```
code --install-extension docker-compose-tools-0.2.0.vsix
```

## Usage

1. After installation, a **Compose Tools** icon will appear on the Activity Bar.
2. Click the **+** button in the panel header to add one or more `docker-compose.yml` files.
3. Added files are displayed as a list, using the parent directory name as a label and showing the current project status.
4. Right-click an item to open the context menu with available actions.
5. Double-click an item to open its configuration file in the editor. Drag items to reorder them.

### Docker Compose Commands

| Command | Action |
|---------|--------|
| Compose Pull | Runs `docker compose pull` |
| Compose Up | Runs `docker compose up -d` |
| Compose Stop | Runs `docker compose stop` |
| Compose Down | Runs `docker compose down` |

### File Management Commands

| Command | Action |
|---------|--------|
| Open File | Opens the configuration file in the editor |
| Open Folder in Editor | Opens the project directory in a new VS Code window |
| Open Folder in File Explorer | Reveals the project directory in the system file manager |
| Add File | Adds `.yml` / `.yaml` files to the panel |
| Remove File | Removes the file from the panel (does not delete from disk) |
| Refresh | Fetches project statuses immediately |

## Zed and the terminal: `dct`

Zed extensions cannot add custom panels, so the extension's features are also available as the `dct` terminal app (`cli/` folder). It is a TUI with the project list, live statuses and the same commands. It runs in Zed's terminal panel or any other terminal.

Requires Node.js 22.13 or newer.

```
npm install -g docker-compose-tools
dct import-vscode        # copies the file list from the VS Code extension
dct                      # opens the TUI
```

Other commands: `dct add <file...>`, `dct ls` (statuses without the TUI), `dct config` (settings file path). The settings file (`%APPDATA%\docker-compose-tools\config.json`, or `~/.config/docker-compose-tools/config.json` on macOS and Linux) sets the editor (`"editor": "zed"`) and the poll interval (`"pollMs": 2000`).

| Key | Action |
|-----|--------|
| `↑`/`↓`, `j`/`k` | Select a project |
| `Shift+↑`/`↓`, `K`/`J` | Move a project up or down |
| `u` / `s` / `d` / `p` | `up -d` / `stop` / `down` (asks first) / `pull` |
| `l` | `docker compose logs --tail 100` |
| `Enter` / `o` / `f` | Open the file in the editor / the folder in a new window / in the file manager |
| `a` / `x` | Add a file / remove it from the list |
| `r`, `?`, `q` | Refresh statuses, help, quit |

### Zed setup

Examples are in `cli/zed/`:

- `tasks.json`: a **Compose Tools** task that runs `dct`, plus `compose: up/stop/down/pull/logs` tasks for the open compose file (`$ZED_DIRNAME`). Copy into `%APPDATA%\Zed\tasks.json`.
- `keymap.json`: `ctrl-alt-d` opens **Compose Tools**.
- `settings.json`: `"terminal": { "dock": "right" }` puts the terminal on the side, so the TUI looks like a sidebar.

## Release Notes

See [CHANGELOG.md](CHANGELOG.md) for the version history.
