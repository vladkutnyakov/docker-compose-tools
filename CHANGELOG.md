# Список изменений

Все заметные изменения расширения Docker Compose Tools описываются в этом файле. Формат основан на [Keep a Changelog](https://keepachangelog.com/ru/1.1.0/).

## [0.2.0] - 2026-09-28

### Добавлено

- Кнопка обновления статусов в заголовке панели.
- Предупреждение, если Docker не запущен; команды Docker Compose блокируются до его запуска.
- Изменение порядка файлов перетаскиванием (с поддержкой множественного выбора).
- Открытие файла двойным щелчком.

### Исправлено

- Иконка статуса сохраняет цвет у выделенных элементов.

## [0.1.0] - 2026-04-12

### Изменено

- Терминал привязан к проекту, а не к команде.

### Исправлено

- Исправлен баг с многократным добавлением одного и того же файла.

## [0.0.1]

### Добавлено

- Панель управления проектами Docker Compose в Activity Bar.
- Мониторинг статусов проектов в реальном времени.
- Команды `pull`, `up`, `stop`, `down`.
- Управление файлами: добавление, удаление, открытие.
- Персистентное хранение списка файлов.

---

# Changelog (English)

All notable changes to the Docker Compose Tools extension are documented in this file. The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/).

## [0.2.0] - 2026-09-28

### Added

- Refresh button in the panel header.
- Warning when Docker is not running; Docker Compose commands are blocked until it starts.
- Drag and drop reordering of files (with multi-select).
- Open a file with a double click.

### Fixed

- Status icons keep their color on selected rows.

## [0.1.0] - 2026-04-12

### Changed

- Terminal is now bound to the project rather than to the command.

### Fixed

- Fixed a bug with duplicate addition of the same file.

## [0.0.1]

### Added

- Docker Compose project management panel in the Activity Bar.
- Real-time project status monitoring.
- `pull`, `up`, `stop`, `down` commands.
- File management: add, remove, open.
- Persistent file list storage.
