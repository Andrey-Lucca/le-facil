import { Button, Input, Layout, Row, Col, Space } from "antd"
import {
  HistoryOutlined,
  SearchOutlined,
  SettingOutlined,
} from "@ant-design/icons"

import type { HeaderProps } from "./Header.types"

export function Header({
  title,
  searchValue,
  onSearchChange,
  onOpenHistory,
  onOpenSettings,
}: HeaderProps) {
  return (
    <Layout.Header
      style={{
        display: "flex",
        alignItems: "center",
        gap: "24px",
        padding: "0 24px",
        backgroundColor: "#FFFFFF",
      }}
    >
      <Row style={{ flex: 1 }} gutter={24} align="middle">
        <Col flex="0 0 auto">
          <h4 style={{ margin: 0, fontSize: "18px", fontWeight: 600, color: "#333" }}>
            {title}
          </h4>
        </Col>

        <Col flex="1" style={{ maxWidth: "520px" }}>
          <Input
            size="large"
            placeholder="Pesquisar no PDF..."
            prefix={<SearchOutlined />}
            value={searchValue}
            onChange={(event) => onSearchChange(event.target.value)}
            allowClear
            style={{
                backgroundColor: "#F5F1E8",
                borderColor: "#E8DCC8",
            }}
          />
        </Col>

        <Col flex="0 0 auto">
          <Space>
            <Button
              type="text"
              shape="circle"
              icon={<HistoryOutlined />}
              onClick={onOpenHistory}
            />
            <Button
              type="text"
              shape="circle"
              icon={<SettingOutlined />}
              onClick={onOpenSettings}
            />
          </Space>
        </Col>
      </Row>
    </Layout.Header>
  )
}
