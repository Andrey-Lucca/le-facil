import { SearchOutlined, SettingOutlined, UserOutlined } from "@ant-design/icons"
import { Button, Input } from "antd"
import "./HeaderSearch.styles.css"
import { useNavigate } from "react-router-dom"

type HeaderSearchProps = {
  searchValue: string
  onSearchChange: (value: string) => void
}

export function HeaderSearch({ searchValue, onSearchChange }: HeaderSearchProps) {

  const navigate = useNavigate();

  return (
    <header className="topbar">
      <Input
        className="topbar-search"
        size="large"
        placeholder="Buscar PDFs..."
        prefix={<SearchOutlined />}
        value={searchValue}
        onChange={(event) => onSearchChange(event.target.value)}
        allowClear
      />
      <div className="topbar-actions">
        <Button type="text" shape="circle" icon={<SettingOutlined />} onClick={() => navigate("/config")}/>
        <Button type="text" shape="circle" icon={<UserOutlined />} />
      </div>
    </header>
  )
}
