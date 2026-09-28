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

## Exportação mensal

A exportação acrescenta registros ao final de `contas-a-pagar-AAAA-MM.csv`,
com as 13 colunas financeiras, e os produtos em `precos-AAAA-MM.csv`.
O mês corresponde à data local da exportação. Arquivos existentes são preservados,
com um único cabeçalho. Exportar o mesmo documento novamente acrescenta outra linha.
Os CSVs mantêm o formato anterior: UTF-8 com BOM e colunas separadas por tabulação.

Campos não identificados ficam vazios; a situação é sempre `A pagar` e a forma
de pagamento assume `Boleto` quando não identificada. A extração depende dos
rótulos presentes no texto do PDF. Documentos já salvos precisam ser importados
novamente para extrair os novos campos. Os arquivos diários antigos não são migrados.
Boletos sem produtos usam o botão `Exportar CSV mensal`, sem consultar preços.

Blocos de parcelas no formato `001 26/05/2026 269,38` são contados sem duplicar
repetições do mesmo bloco. Todas as parcelas são armazenadas em um mapa JSON
`installments`, usando o número como chave e guardando `number`, `dueDate` e
`amount`. A tela mostra apenas o número de parcelas. O CSV recebe uma linha por
parcela, com seu número, vencimento e valor, independentemente do mês da emissão.
Sem esse bloco, a exportação usa os campos explícitos do documento como antes.

Por enquanto, o fornecedor é sempre `hering`. O número da NF também é lido
após `Nº.`, preservando a formatação (ex.: `004.636.352`). O vencimento de
referência é procurado no mês seguinte à emissão, incluindo a virada de ano;
o CSV continua listando todas as parcelas com suas próprias datas.
No CSV, a data de pagamento repete o vencimento de cada linha, e Centro de Custo,
Observações e Anexo/Link recebem `-`. Esses campos e as duas datas não aparecem
nos detalhes da tela de resultados.

O botão **Acessar CSV** abre `contas-a-pagar-AAAA-MM.csv` do mês atual.
Após Anexo/Link, esse arquivo também inclui as colunas antigas de preços e
produtos, mais código de barras, quantidade e unidade. Parcelas e produtos são
listados lado a lado, uma vez cada; quando um conjunto termina, suas colunas
ficam vazias nas linhas restantes do documento. Não há relação entre o produto
e a parcela que eventualmente aparecem na mesma linha.
Na primeira exportação no novo formato, um CSV mensal com apenas as 13 colunas
financeiras recebe as novas colunas vazias nas linhas antigas, preservando os
dados. Uma cópia anterior fica em `.csv.before-products.bak`.
