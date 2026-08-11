---
tags: [projeto, conceito, frontend]
---

# O Salão (Frontend)

Voltar para [[Mapa do Projeto]].

## O que é

É tudo que você vê e toca quando abre o sistema no navegador: os botões, os formulários, os gráficos, o menu lateral, as cores, o modo claro/escuro. No restaurante, é o salão — a parte decorada, organizada para ser agradável e fácil de usar, onde o cliente se senta e faz seus pedidos.

Importante: o salão **não prepara nada sozinho**. Ele só recebe o que você pede (o que você clicou ou digitou) e leva até a cozinha (veja [[A Cozinha - Backend]]) através do garçom (veja [[O Garçom - API]]). Quando a cozinha termina, o salão só exibe o resultado na tela.

## As telas que existem no projeto

- **Login** — onde você entra com email e senha.
- **Dashboard (painel principal)** — números-resumo: quanto foi investido, quantas campanhas ativas, campanhas terminando em breve, e gráficos.
- **Lista de campanhas** — todas as campanhas, com filtros de busca e status.
- **Detalhe de uma campanha** — informações completas de uma campanha específica, incluindo sua linha do tempo de mudanças (veja [[Histórico de Auditoria]]).
- **Financeiro** — visão focada só em números de investimento e orçamento.

## Do que ele é feito (sem termos técnicos)

Pense em uma casa: ela precisa de uma estrutura (paredes, cômodos), uma decoração (cores, móveis) e um sistema elétrico (interruptores que fazem algo acontecer quando acionados). O salão desse projeto é feito de três "materiais" equivalentes:

- **Estrutura** — define o que existe na página (um botão aqui, um campo de texto ali).
- **Decoração** — define a aparência (cores, espaçamento, tema claro ou escuro).
- **Comportamento** — define o que acontece quando você clica em algo (buscar dados, mostrar um aviso, trocar de página).

Esse projeto foi feito sem usar "kits prontos" de interface (frameworks como React ou Vue) — foi construído com as ferramentas mais básicas do navegador, de propósito, para expor como tudo funciona por baixo dos panos, sem mágica escondida.

## Como o salão fala com a cozinha

Toda vez que a tela precisa de dados reais (por exemplo, a lista de campanhas), ela não inventa nada sozinha — ela manda um pedido através do garçom até a cozinha, espera a resposta, e só então desenha a informação na tela. Veja [[O Garçom - API]] e o exemplo completo em [[Criando uma Campanha - Passo a Passo]].
