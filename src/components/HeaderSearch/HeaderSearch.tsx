import { SearchOutlined, SettingOutlined, UserOutlined } from "@ant-design/icons"
import { Button, Input } from "antd"

type HeaderSearchProps = {
  searchValue: string
  onSearchChange: (value: string) => void
}

export function HeaderSearch({ searchValue, onSearchChange }: HeaderSearchProps) {
  return (
    <header className="topbar">
      <Input
        className="topbar-search"
        size="large"
        placeholder="Search PDFs..."
        prefix={<SearchOutlined />}
        value={searchValue}
        onChange={(event) => onSearchChange(event.target.value)}
        allowClear
      />
      <div className="topbar-actions">
        <Button type="text" shape="circle" icon={<SettingOutlined />} />
        <Button type="text" shape="circle" icon={<UserOutlined />} />
      </div>
    </header>
  )
}
