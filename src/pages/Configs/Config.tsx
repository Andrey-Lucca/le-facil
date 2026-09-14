import { Button, Card, Divider, Form, Input } from "antd"

type ConfigProps = {
  scriptPath: string
  exportPath: string
}

export function Config() {
  return (
    <div className="view-page config-screen">
      <div className="config-content">
        <div className="workspace-title-row">
          <div className="workspace-title">
            <h1>Configurações</h1>
          </div>
        </div>
        <Divider/>
        <Card style={{backgroundColor: "#FFF"}}>
        <Form layout="vertical">
          <Form.Item
            label="Caminho do script"
            name="scriptPath"
          >
            <Input style={{background: "#FFF"}}placeholder="Ex.: C:\scripts\extrator.py" />
          </Form.Item>

          <Form.Item
            label="Pasta de exportação"
            name="exportPath"
          >
            <Input style={{background: "#FFF"}} placeholder="Ex.: C:\Users\Drey\Documents" />
          </Form.Item>

          <Button type="primary" htmlType="submit">
            Salvar configurações
          </Button>
        </Form>
      </Card>
      </div>
    </div>
  )
}
