import { app } from "electron"
import { mkdir, readFile, writeFile } from "node:fs/promises"
import path from "node:path"
import type {
  Settings,
} from "../../src/modules/settings/models/settings.model"
import { defaultSettings } from "../../src/modules/settings/models/settings.model"

function getSettingsStorePath(): string {
  return path.join(app.getPath("userData"), "settings.json")
}

export async function readSettingsStore(): Promise<Settings> {
  try {
    const content = await readFile(getSettingsStorePath(), "utf-8")
    const parsedSettings = JSON.parse(content) as Partial<Settings>

    return {
      scriptPath: parsedSettings.scriptPath ?? "",
      exportFolder: parsedSettings.exportFolder ?? "",
    }
  } catch (error) {
    return {
      scriptPath: "",
      exportFolder: "",
    }
  }
}

export async function saveSettings(settings: Settings): Promise<Settings> {
  const storePath = getSettingsStorePath()

  await mkdir(path.dirname(storePath), { recursive: true })

  await writeFile(storePath, JSON.stringify(settings, null, 2), "utf-8")

  return settings
}

export async function updateSettings(patch: Partial<Settings>) {
  const currentSettings = await readSettingsStore()

  return saveSettings({
    ...currentSettings,
    ...patch,
  })
}

export async function deleteSettings(): Promise<Settings> {
  return saveSettings(defaultSettings)
}