---
tags: [projeto, conceito, banco-de-dados]
---

# O Almoxarifado (Banco de Dados)

Voltar para [[Mapa do Projeto]].

## O que é

É onde toda informação fica guardada de forma permanente e organizada — como um arquivo gigante de fichas, dividido em gavetas. [[A Cozinha - Backend]] não guarda nada "de cabeça": toda vez que precisa de um dado, ela vai até o almoxarifado buscar a ficha certa, ou escrever uma ficha nova.

## As gavetas (tabelas) que existem neste projeto

- **Usuários** — quem pode entrar no sistema (nome, email, senha protegida, veja [[Login e Segurança]]).
- **Clientes** — os clientes da agência, donos das campanhas (não fazem login, só são "referenciados").
- **Campanhas** — a ficha central: nome, cliente dono, orçamento, datas de início e fim, status (planejada, ativa, pausada, concluída, cancelada), responsável.
- **Histórico de campanhas** — uma ficha para cada mudança que qualquer campanha já sofreu (veja [[Histórico de Auditoria]]).
- **Marcos de campanha** — datas importantes dentro de uma campanha além do início/fim (ex: "aprovação do criativo").

## Por que usar um almoxarifado especializado em vez de, por exemplo, uma planilha comum

Um sistema como este (chamado *banco de dados relacional*) garante coisas que uma planilha comum não garante sozinha:

- **Nunca perder uma referência**: uma campanha sempre aponta para um cliente que realmente existe. O sistema recusa, por exemplo, apagar um cliente que ainda tem campanhas em aberto — ele obriga alguém a decidir o que fazer com essas campanhas antes.
- **Nunca ter dado corrompido**: um campo de dinheiro é sempre guardado exatamente como dinheiro (nunca "quase certo" por causa de arredondamento).
- **Buscar rápido mesmo com muita informação**: existem "atalhos" internos (chamados índices) nas colunas mais consultadas, como o status da campanha — sem eles, o sistema teria que olhar ficha por ficha toda vez.

## "Excluir" uma campanha não apaga de verdade

Quando uma campanha é "excluída" pela tela, ela não desaparece do almoxarifado — ela é marcada com uma etiqueta de "removida em tal data" e passa a ser ignorada nas buscas normais. Isso existe por dois motivos: preservar o histórico de auditoria mesmo depois da remoção, e permitir reverter uma exclusão feita por engano. Esse tipo de exclusão "de mentirinha" é chamado de **soft delete** (exclusão suave).
