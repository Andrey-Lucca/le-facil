import { ipcMain } from "electron"
import type { Settings } from "../../src/modules/settings/models/settings.model"
import {
  deleteSettings,
  readSettingsStore,
  saveSettings,
  updateSettings,
} from "../storage/settings.store"

export function registerSettingsHandlers(): void {
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