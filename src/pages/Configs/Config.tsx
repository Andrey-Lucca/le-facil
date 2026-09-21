import { App as AntApp, Button, Card, Divider, Form, Input, Space } from "antd"
import { useEffect, useState } from "react"
import {
  deleteSettings,
  loadSettings,
  saveSettings,
} from "../../modules/settings/services/settings.service"
import { validatePaths } from "../../modules/settings/utils/validatePaths"

export function Config() {
  const { message } = AntApp.useApp()
  const [scriptPath, setScriptPath] = useState<string>("")
  const [exportFolder, setExportFolder] = useState<string>("")

  useEffect(() => {
    async function hydrateSettings() {
      const settings = await loadSettings()

      setScriptPath(settings.scriptPath)
      setExportFolder(settings.exportFolder)
    }

    void hydrateSettings()
  }, [])

  async function handleSave() {
    const settings = {
      scriptPath,
      exportFolder,
    }

    const validation = validatePaths(settings)

    if (!validation.valid) {
      message.warning(validation.message)
      return
    }

    try {
      const savedSettings = await saveSettings(settings)

      setScriptPath(savedSettings.scriptPath)
      setExportFolder(savedSettings.exportFolder)
      message.success("Configurações salvas com sucesso.")
    } catch (error) {
      const errorMessage = error instanceof Error
        ? error.message
        : "Não foi possível salvar as configurações."

      message.error(errorMessage)
    }
  }

  async function handleDelete() {
    try {
      const emptySettings = await deleteSettings()

      setScriptPath(emptySettings.scriptPath)
      setExportFolder(emptySettings.exportFolder)
      message.success("Configurações apagadas com sucesso.")
    } catch (error) {
      const errorMessage = error instanceof Error
        ? error.message
        : "Não foi possível apagar as configurações."

      message.error(errorMessage)
    }
  }

  return (
    <div className="view-page config-screen">
      <div className="config-content">
        <div className="workspace-title-row">
          <div className="workspace-title">
            <h1>Configurações</h1>
          </div>
        </div>
        <Divider />
        <Card style={{ backgroundColor: "#FFF" }}>
          <Form layout="vertical" onFinish={() => void handleSave()}>
            <Form.Item label="Caminho do script">
              <Input
                style={{ background: "#FFF" }}
                placeholder="Ex.: C:\\Users\\User\\Documents\\script.js"
                onChange={(e) => setScriptPath(e.target.value)}
                value={scriptPath}
              />
            </Form.Item>

            <Form.Item label="Pasta de exportação">
              <Input
                style={{ background: "#FFF" }}
                placeholder="Ex.: C:\\Users\\User\\Documents"
                onChange={(e) => setExportFolder(e.target.value)}
                value={exportFolder}
              />
            </Form.Item>

            <Space>
              <Button type="primary" htmlType="submit">
                Salvar
              </Button>

              <Button
                danger
                htmlType="button"
                onClick={() => void handleDelete()}
                style={{ background: "#EF3226", color: "#FFF" }}
              >
                Apagar configurações
              </Button>
            </Space>
          </Form>
        </Card>
      </div>
    </div>
  )
}
