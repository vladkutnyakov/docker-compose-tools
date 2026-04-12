import { tryTerminal } from "../terminal"
import { SavedFile } from "../types"

export function pull (item: SavedFile) {
	const terminal = tryTerminal(item)

	terminal.show()
	terminal.sendText('docker compose pull')
}

export function up (item: SavedFile) {
	const terminal = tryTerminal(item)

	terminal.show()
	terminal.sendText('docker compose up -d')
}

export function down (item: SavedFile) {
	const terminal = tryTerminal(item)

	terminal.show()
	terminal.sendText('docker compose down')
}

export function stop (item: SavedFile) {
	const terminal = tryTerminal(item)

	terminal.show()
	terminal.sendText('docker compose stop')
}
