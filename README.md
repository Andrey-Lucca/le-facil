# Lê Fácil

Aplicativo desktop com Electron, React e TypeScript para extrair itens de PDFs,
consultar preços e exportar os resultados em CSV.

## Desenvolvimento

Use Node.js e Yarn Classic 1.22.22. O gerenciador adotado é o Yarn;
versione o `yarn.lock` ao alterar dependências.

```sh
yarn install --frozen-lockfile
yarn dev
```

Na tela de configurações, informe o caminho de `scripts/searchAutomation.js`
e a pasta de exportação. A automação usa Chromium; antes da primeira execução:

```sh
yarn playwright install chromium
```

## Verificação

```sh
yarn lint
yarn tsc --noEmit
yarn playwright test
```

Os testes em `tests/invoiceParser.spec.ts` verificam a leitura dos itens das notas.
Eles não cobrem a interface nem a integração com o Electron.

## Empacotamento

```sh
yarn build
```

O build gera `dist/`, `dist-electron/` e instaladores em `release/`.
Essas saídas não devem ser versionadas.

## Dados locais

As configurações e documentos são armazenados em `settings.json` e
`documents.json` na pasta de dados do usuário do Electron. Os CSVs são gravados
na pasta de exportação configurada no aplicativo.

Não inclua credenciais, documentos reais ou exportações no repositório.
Use dados sintéticos nos testes e mantenha valores secretos fora do Git.
