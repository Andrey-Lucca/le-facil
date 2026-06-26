import { App as AntApp, ConfigProvider } from "antd"
import { Home } from "./pages/Home"
import { themeTokens } from "./shared/theme/themeTokens"
import "./App.css"

function App() {
  return (
    <ConfigProvider
      theme={{
        token: {
          colorPrimary: themeTokens.textPrimary,
          colorBgBase: themeTokens.background,
          colorText: themeTokens.textPrimary,
          colorTextSecondary: themeTokens.textSecondary,
          colorBorder: themeTokens.border,
          borderRadius: 8,
          fontFamily: "Inter, system-ui, -apple-system, BlinkMacSystemFont, Segoe UI, sans-serif",
        },
      }}
    >
      <AntApp>
        <Home />
      </AntApp>
    </ConfigProvider>
  )
}

export default App
