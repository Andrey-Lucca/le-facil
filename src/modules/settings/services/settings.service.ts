import type { Settings } from "../models/settings.model"

export async function loadSettings(): Promise<Settings> {
  return window.ipcRenderer.invoke("settings:get")
}

export async function saveSettings(settings: Settings): Promise<Settings> {
  return window.ipcRenderer.invoke("settings:save", settings)
}

export async function updateSettings(
  patch: Partial<Settings>,
): Promise<Settings> {
  return window.ipcRenderer.invoke("settings:update", patch)
}

export async function deleteSettings(): Promise<Settings> {
  return window.ipcRenderer.invoke("settings:delete")
}

export async function getSettingsStorePath(): Promise<string> {
  return window.ipcRenderer.invoke("settings:store-path")
}

export async function openCSV(fileName: string): Promise<void> {
  await window.ipcRenderer.invoke("exports:open-csv", fileName)
}
