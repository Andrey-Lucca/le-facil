import { DownloadOutlined, SearchOutlined } from "@ant-design/icons"
import { Button, Input, Space, Table, Tag } from "antd"
import type { ColumnsType } from "antd/es/table"
import { useMemo, useState } from "react"
import type { ExtractedPdfResult, ExtractionStatus } from "../../modules/pdf/models/extracted-pdf-result.model"
import type { ExtractedProductItem } from "../../modules/pdf/models/extracted-product-item.model"

type ExtractionTableProps = {
  result?: ExtractedPdfResult
}

const statusLabels: Record<ExtractionStatus, string> = {
  success: "success",
  partial: "partial",
  failed: "failed",
}

const statusColors: Record<ExtractionStatus, string> = {
  success: "green",
  partial: "gold",
  failed: "red",
}

function formatMoney(value: number): string {
  return value.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })
}

export function ExtractionTable({ result }: ExtractionTableProps) {
  const [descriptionFilter, setDescriptionFilter] = useState("")
  const [productCodeSearch, setProductCodeSearch] = useState("")

  const dataSource = useMemo(() => {
    const items = result?.items ?? []
    return items.filter((item) => {
      const matchesDescription = item.description.toLowerCase().includes(descriptionFilter.toLowerCase())
      const matchesProductCode = item.productCode.toLowerCase().includes(productCodeSearch.toLowerCase())
      return matchesDescription && matchesProductCode
    })
  }, [descriptionFilter, productCodeSearch, result?.items])

  const columns: ColumnsType<ExtractedProductItem> = [
    { title: "Product Code", dataIndex: "productCode", key: "productCode", fixed: "left", width: 140 },
    { title: "Description", dataIndex: "description", key: "description", width: 280 },
    { title: "Order Number", dataIndex: "orderNumber", key: "orderNumber", width: 150 },
    { title: "CEAN", dataIndex: "cean", key: "cean", width: 150 },
    { title: "NCM/SH", dataIndex: "ncmSh", key: "ncmSh", width: 120 },
    { title: "CST", dataIndex: "cst", key: "cst", width: 90 },
    { title: "CFOP", dataIndex: "cfop", key: "cfop", width: 90 },
    { title: "Unit", dataIndex: "unit", key: "unit", width: 90 },
    { title: "Quantity", dataIndex: "quantity", key: "quantity", width: 120 },
    { title: "Unit Value", dataIndex: "unitValue", key: "unitValue", width: 130, render: formatMoney },
    { title: "Total Value", dataIndex: "totalValue", key: "totalValue", width: 130, render: formatMoney },
    { title: "ICMS Base Value", dataIndex: "icmsBaseValue", key: "icmsBaseValue", width: 160, render: formatMoney },
    { title: "ICMS Value", dataIndex: "icmsValue", key: "icmsValue", width: 130, render: formatMoney },
    { title: "IPI Value", dataIndex: "ipiValue", key: "ipiValue", width: 130, render: formatMoney },
    { title: "ICMS Rate", dataIndex: "icmsRate", key: "icmsRate", width: 120, render: (value: number) => `${value}%` },
    { title: "IPI Rate", dataIndex: "ipiRate", key: "ipiRate", width: 120, render: (value: number) => `${value}%` },
  ]

  return (
    <section className="results-panel">
      <div className="results-header">
        <div>
          <h2>Extraction Results</h2>
          <p>{result ? result.fileName : "No PDF processed yet"}</p>
        </div>
        <Space>
          {result ? <Tag color={statusColors[result.status]}>{statusLabels[result.status]}</Tag> : null}
          <Button icon={<DownloadOutlined />} disabled>
            Export CSV
          </Button>
        </Space>
      </div>

      <div className="table-toolbar">
        <Input
          placeholder="Filter by description"
          prefix={<SearchOutlined />}
          value={descriptionFilter}
          onChange={(event) => setDescriptionFilter(event.target.value)}
          allowClear
        />
        <Input
          placeholder="Search by product code"
          prefix={<SearchOutlined />}
          value={productCodeSearch}
          onChange={(event) => setProductCodeSearch(event.target.value)}
          allowClear
        />
      </div>

      <Table
        rowKey={(record) => `${record.productCode}-${record.description}-${record.totalValue}`}
        columns={columns}
        dataSource={dataSource}
        pagination={{ pageSize: 8, showSizeChanger: true }}
        scroll={{ x: 2100 }}
        size="middle"
      />
    </section>
  )
}
