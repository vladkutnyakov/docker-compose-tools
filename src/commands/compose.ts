import * as vscode from 'vscode'
import path from "path"
import { SavedFile } from "../types"

export function pull (item: SavedFile) {
	const terminal = vscode.window.createTerminal({
		name: `${item.label} pull`,
		cwd: path.dirname(item.path),
	})

	terminal.show()
	terminal.sendText('docker compose pull')
}

export function up (item: SavedFile) {
	const terminal = vscode.window.createTerminal({
		name: `${item.label} up`,
		cwd: path.dirname(item.path),
	})

	terminal.show()
	terminal.sendText('docker compose up -d')
}

export function down (item: SavedFile) {
	const terminal = vscode.window.createTerminal({
		name: `${item.label} down`,
		cwd: path.dirname(item.path),
	})

	terminal.show()
	terminal.sendText('docker compose down')
}