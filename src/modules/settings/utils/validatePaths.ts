import type { Settings } from "../models/settings.model"

export type PathValidationResult =
  | { valid: true }
  | { valid: false; message: string }

const WINDOWS_ABSOLUTE_PATH = /^[A-Za-z]:\\/
const INVALID_WINDOWS_PATH_CHARACTERS = /[<>:"|?*\r\n]/
const SUPPORTED_SCRIPT_EXTENSION = /\.(js|ts|py)$/i

function isValidWindowsPath(value: string): boolean {
  if (!WINDOWS_ABSOLUTE_PATH.test(value)) {
    return false
  }

  const pathWithoutDrive = value.slice(3)
  return !INVALID_WINDOWS_PATH_CHARACTERS.test(pathWithoutDrive)
}

export function validatePaths(settings: Settings): PathValidationResult {
  const scriptPath = settings.scriptPath.trim()
  const exportFolder = settings.exportFolder.trim()

  if (!scriptPath && !exportFolder) {
    return { valid: false, message: "Informe o caminho do script e a pasta de exportação." }
  }

  if (!scriptPath) {
    return { valid: false, message: "Informe o caminho do script." }
  }

  if (!exportFolder) {
    return { valid: false, message: "Informe a pasta de exportação." }
  }

  if (!isValidWindowsPath(exportFolder)) {
    return { valid: false, message: "Informe um caminho absoluto válido para a pasta de exportação." }
  }

  if (!isValidWindowsPath(scriptPath)) {
    return { valid: false, message: "Informe um caminho absoluto válido para o script." }
  }

  if (!SUPPORTED_SCRIPT_EXTENSION.test(scriptPath)) {
    return { valid: false, message: "O script precisa ter a extensão .js, .ts ou .py." }
  }

  return { valid: true }
}
