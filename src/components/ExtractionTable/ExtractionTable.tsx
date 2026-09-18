import { SearchOutlined } from "@ant-design/icons"
import { Button, Empty, Input, Space, Table, Tag, message } from "antd"
import type { ColumnsType } from "antd/es/table"
import { useMemo, useState } from "react"
import type {
  ExtractedPdfResult,
  ExtractionStatus,
} from "../../modules/pdf/models/extracted-pdf-result.model"
import type { ExtractedProductItem } from "../../modules/pdf/models/extracted-product-item.model"
import "./ExtractionTable.styles.css"
import { openCSV } from "../../modules/settings/services/settings.service"

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
  const [openingCSV, setOpeningCSV] = useState(false)
  const [messageApi, contextHolder] = message.useMessage()

  async function handleOpenCSV() {
    setOpeningCSV(true)
    try {
      await openCSV()
    } catch (error) {
      void messageApi.error(
        error instanceof Error ? error.message : "Não foi possível abrir o CSV.",
      )
    } finally {
      setOpeningCSV(false)
    }
  }

  const dataSource = useMemo(() => {
    const items = result?.items ?? []
    return items.filter((item) => {
      const matchesDescription = item.description
        .toLowerCase()
        .includes(descriptionFilter.toLowerCase())
      const matchesProductCode = item.productCode
        .toLowerCase()
        .includes(productCodeSearch.toLowerCase())
      return matchesDescription && matchesProductCode
    })
  }, [descriptionFilter, productCodeSearch, result?.items])

  const columns: ColumnsType<ExtractedProductItem> = [
    {
      title: "Código do Produto",
      dataIndex: "productCode",
      key: "productCode",
      width: 140,
    },
    {
      title: "Descrição",
      dataIndex: "description",
      key: "description",
      width: 300,
    },
    {
      title: "Número do Pedido",
      dataIndex: "orderNumber",
      key: "orderNumber",
      width: 150,
    },
    { title: "CEAN", dataIndex: "cean", key: "cean", width: 150 },
    { title: "NCM/SH", dataIndex: "ncmSh", key: "ncmSh", width: 120 },
    { title: "CST", dataIndex: "cst", key: "cst", width: 90 },
    { title: "CFOP", dataIndex: "cfop", key: "cfop", width: 90 },
    { title: "Unidade", dataIndex: "unit", key: "unit", width: 90 },
    { title: "Quantidade", dataIndex: "quantity", key: "quantity", width: 120 },
    {
      title: "Valor Unitário",
      dataIndex: "unitValue",
      key: "unitValue",
      width: 130,
      render: formatMoney,
    },
    {
      title: "Valor Total",
      dataIndex: "totalValue",
      key: "totalValue",
      width: 130,
      render: formatMoney,
    },
    {
      title: "ICMS Base",
      dataIndex: "icmsBaseValue",
      key: "icmsBaseValue",
      width: 160,
      render: formatMoney,
    },
    {
      title: "ICMS",
      dataIndex: "icmsValue",
      key: "icmsValue",
      width: 130,
      render: formatMoney,
    },
    {
      title: "IPI",
      dataIndex: "ipiValue",
      key: "ipiValue",
      width: 130,
      render: formatMoney,
    },
    {
      title: "Alíquota ICMS",
      dataIndex: "icmsRate",
      key: "icmsRate",
      width: 120,
      render: (value: number) => `${value}%`,
    },
    {
      title: "Alíquota IPI",
      dataIndex: "ipiRate",
      key: "ipiRate",
      width: 120,
      render: (value: number) => `${value}%`,
    },
  ]

  return (
    <section className="results-panel">
      {contextHolder}
      <div className="results-header">
        <div className="results-title">
          <h2>Resultados da Extração</h2>
          <p>{result ? result.fileName : "Nenhum PDF processado ainda"}</p>
        </div>
        <Space>
          {result ? (
            <Tag color={statusColors[result.status]}>
              {statusLabels[result.status]}
            </Tag>
          ) : null}
          <Button id="results-access-csv" loading={openingCSV} onClick={handleOpenCSV}>
            Acessar CSV
          </Button>
        </Space>
      </div>

      <div className="table-toolbar">
        <Input
          placeholder="Filtrar por descrição"
          prefix={<SearchOutlined />}
          value={descriptionFilter}
          onChange={(event) => setDescriptionFilter(event.target.value)}
          allowClear
        />
        <Input
          placeholder="Filtrar por código do produto"
          prefix={<SearchOutlined />}
          value={productCodeSearch}
          onChange={(event) => setProductCodeSearch(event.target.value)}
          allowClear
        />
      </div>

      {result ? (
        <Table
          rowKey={(record, index) =>
            `${record.productCode}-${record.description}-${record.totalValue}-${index}`
          }
          columns={columns}
          dataSource={dataSource}
          pagination={{
            defaultPageSize: 8,
            pageSizeOptions: [8, 10, 20, 50, 100],
            showSizeChanger: true,
            locale: { items_per_page: "/itens por página" },
          }}
          scroll={{ x: 1980, y: "calc(100vh - 430px)" }}
          size="middle"
        />
      ) : (
        <Empty description="Selecione ou faça o upload de um PDF para ver os produtos extraídos." />
      )}
    </section>
  )
}
