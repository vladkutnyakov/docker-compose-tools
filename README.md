# Docker Compose Tools

Расширение для Visual Studio Code, предназначенное для управления проектами Docker Compose. Предоставляет выделенную панель в боковой панели редактора, позволяющую добавлять файлы `docker-compose.yml`, отслеживать статусы проектов в реальном времени и выполнять основные команды Docker Compose через контекстное меню.

## Возможности

- **Панель управления проектами** -- выделенное представление в Activity Bar со списком добавленных файлов Docker Compose.
- **Мониторинг статусов** -- автоматический опрос `docker compose ls` каждые 2 секунды с цветовой индикацией состояния проектов: зеленый (running), красный (exited), серый (idle).
- **Управление жизненным циклом** -- команды `pull`, `up`, `stop` и `down` доступны через контекстное меню каждого проекта.
- **Управление файлами** -- добавление и удаление файлов `docker-compose.yml` / `docker-compose.yaml` из панели.
- **Быстрый доступ** -- открытие файла конфигурации в редакторе, открытие каталога проекта в новом окне VS Code или в системном файловом менеджере.
- **Персистентность** -- список добавленных файлов сохраняется между сессиями в глобальном состоянии расширения.
- **Управление терминалами** -- каждый проект получает собственный терминал, привязанный к каталогу файла конфигурации. Терминалы переиспользуются при повторных вызовах команд.

## Требования

- Visual Studio Code версии 1.92.0 или выше.
- Docker Engine и Docker Compose CLI, установленные и доступные в `PATH`.

## Установка

Установите расширение из Visual Studio Code Marketplace, выполнив поиск по имени **Docker Compose Tools**, или установите файл `.vsix` вручную:

```
code --install-extension docker-compose-tools-0.0.1.vsix
```

## Использование

1. После установки на Activity Bar появится иконка **Compose Tools**.
2. Нажмите кнопку **+** в заголовке панели, чтобы добавить один или несколько файлов `docker-compose.yml`.
3. Добавленные файлы отображаются в виде списка с именем родительского каталога в качестве метки и текущим статусом проекта.
4. Щелкните правой кнопкой мыши по элементу списка, чтобы открыть контекстное меню с доступными действиями.

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

## Информация о релизе

### 0.1.0

Улучшения:

- Терминал привязан к проекту, а не к команде.

Исправления:

- Исравлен баг с многократным добавлением одного и того же файла.

---

### 0.0.1

Первоначальный выпуск:

- Панель управления проектами Docker Compose в Activity Bar.
- Мониторинг статусов проектов в реальном времени.
- Команды `pull`, `up`, `stop`, `down`.
- Управление файлами: добавление, удаление, открытие.
- Персистентное хранение списка файлов.

---

# Docker Compose Tools (English)

A Visual Studio Code extension for managing Docker Compose projects. It provides a dedicated panel in the editor sidebar that allows adding `docker-compose.yml` files, monitoring project statuses in real time, and executing common Docker Compose commands via context menu.

## Features

- **Project management panel** -- a dedicated view in the Activity Bar listing all added Docker Compose files.
- **Status monitoring** -- automatic polling of `docker compose ls` every 2 seconds with color-coded project status indicators: green (running), red (exited), grey (idle).
- **Lifecycle management** -- `pull`, `up`, `stop`, and `down` commands accessible via the context menu of each project.
- **File management** -- add and remove `docker-compose.yml` / `docker-compose.yaml` files from the panel.
- **Quick access** -- open the configuration file in the editor, open the project directory in a new VS Code window, or reveal it in the system file explorer.
- **Persistence** -- the list of added files is preserved across sessions using the extension's global state.
- **Terminal management** -- each project gets its own terminal bound to the configuration file's directory. Terminals are reused on subsequent command invocations.

## Requirements

- Visual Studio Code version 1.92.0 or higher.
- Docker Engine and Docker Compose CLI installed and available in `PATH`.

## Installation

Install the extension from the Visual Studio Code Marketplace by searching for **Docker Compose Tools**, or install a `.vsix` file manually:

```
code --install-extension docker-compose-tools-0.0.1.vsix
```

## Usage

1. After installation, a **Compose Tools** icon will appear on the Activity Bar.
2. Click the **+** button in the panel header to add one or more `docker-compose.yml` files.
3. Added files are displayed as a list, using the parent directory name as a label and showing the current project status.
4. Right-click an item to open the context menu with available actions.

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

## Release Notes

### 0.1.0

Improvements:

- Terminal is now bound to the project rather than to the command.

Fixes:

- Fixed a bug with duplicate addition of the same file.

---

### 0.0.1

Initial release:

- Docker Compose project management panel in the Activity Bar.
- Real-time project status monitoring.
- `pull`, `up`, `stop`, `down` commands.
- File management: add, remove, open.
- Persistent file list storage.
