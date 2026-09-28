import { ipcMain, shell } from "electron"
import { stat } from "node:fs/promises"
import path from "node:path"
import type { Settings } from "../../src/modules/settings/models/settings.model"
import {
  deleteSettings,
  readSettingsStore,
  saveSettings,
  updateSettings,
} from "../storage/settings.store"

export function registerSettingsHandlers(): void {
  ipcMain.handle("exports:open-csv", async () => {
    const { exportFolder } = await readSettingsStore()
    if (!exportFolder.trim()) {
      throw new Error("Configure a pasta de exportação antes de abrir o CSV.")
    }

    const date = new Date()
    const month = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`
    const csvPath = path.join(exportFolder, `contas-a-pagar-${month}.csv`)
    try {
      const file = await stat(csvPath)
      if (!file.isFile()) throw new Error("Não é um arquivo")
    } catch {
      throw new Error(`CSV indisponível em ${csvPath}. Exporte os dados deste mês antes de acessar o arquivo.`)
    }

    const error = await shell.openPath(csvPath)
    if (error) {
      throw new Error(`Não foi possível abrir o CSV: ${error}`)
    }
  })

  ipcMain.handle("settings:get", () => {
    return readSettingsStore()
  })

  ipcMain.handle(
    "settings:save",
    (_event, settings: Settings) => {
      return saveSettings(settings)
    },
  )

  ipcMain.handle(
    "settings:update",
    (_event, patch: Partial<Settings>) => {
      return updateSettings(patch)
    },
  )

  ipcMain.handle("settings:delete", () => {
    return deleteSettings()
  })
}
