import { ipcMain } from "electron"
import { spawn } from "node:child_process"
import { readSettingsStore } from "../storage/settings.store"
import { getDocumentsStorePath } from "../main"

export type SearchResponse = {
  success: boolean
  message: string
}

export async function registerSearchEngineHandlers(): Promise<void> {
  const documentsPath = getDocumentsStorePath()

  ipcMain.handle("search-engine:run", async (_event, id: string) => {
    const PATHS = await readSettingsStore()

    return new Promise<SearchResponse>((resolve) => {
      const process = spawn("node", [PATHS.scriptPath, id, PATHS.exportFolder, documentsPath])

      process.stdout?.on("data", (data) => {
        console.log("Saída do script:", data.toString())
      })

      let errorMessage = ""

      process.on("error", (error) => {
        resolve({ success: false, message: error.message })
      })

      process.stderr?.on("data", (data) => {
        errorMessage += data.toString()
      })

      process.on("close", (code) => {
        resolve(
          code === 0
            ? { success: true, message: "Automação concluída com sucesso" }
            : {
                success: false,
                message: errorMessage.trim() || "Erro ao executar a automação.",
              },
        )
      })
    })
  })
}
