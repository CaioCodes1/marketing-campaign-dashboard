---
tags: [projeto, conceito, api]
---

# O Garçom (API)

Voltar para [[Mapa do Projeto]].

## O que é

É o mensageiro entre [[O Salão - Frontend]] e [[A Cozinha - Backend]]. O salão nunca entra na cozinha diretamente — ele entrega o pedido ao garçom, numa lista fixa de formatos aceitos, e espera a resposta.

Essa "lista fixa de pedidos que o garçom aceita anotar" tem um nome técnico: **API** (uma espécie de cardápio de ações possíveis, não de pratos). Por exemplo, alguns pedidos que esse garçom aceita:

- "Fazer login com este email e senha"
- "Buscar todas as campanhas" (com filtros opcionais, tipo só as ativas)
- "Buscar os detalhes de uma campanha específica"
- "Criar uma campanha nova"
- "Atualizar uma campanha existente"
- "Buscar os números do painel principal"

## Por que ter um garçom em vez do salão falar direto com a cozinha

1. **Organização**: existe um único ponto de entrada e saída de pedidos, então fica fácil saber tudo que o sistema é capaz de fazer.
2. **Independência**: se um dia o salão inteiro for reconstruído do zero (nova aparência, nova tecnologia de tela), a cozinha nem percisa saber — desde que o novo salão continue "falando a língua" que o garçom entende, tudo continua funcionando.
3. **Seguraça**: o garçom pode recusar pedidos malformados ou de quem não tem permissão, antes mesmo de incomodar a cozinha.

## Como um pedido de verdade circula

1. O salão monta o pedido (ex: "criar campanha", junto com nome, orçamento, datas) e a pulseirinha de identificação (veja [[Login e Segurança]]).
2. O pedido viaja até o garçom pela internet (ou, no caso de estar tudo no mesmo computador durante o desenvolvimento, localmente).
3. O garçom entrega para a estação certa da cozinha.
4. A cozinha processa e devolve um resultado — sempre no mesmo formato padronizado: ou "deu certo, aqui está o resultado", ou "deu errado, e aqui está o motivo".
5. O garçom entrega essa resposta de volta ao salão, que atualiza a tela.

Veja o exemplo completo em [[Criando uma Campanha - Passo a Passo]].

## Uma resposta sempre no mesmo formato

Para o salão nunca ficar "adivinhando" como interpretar uma resposta, toda resposta do garçom segue um dos dois formatos:

- **Sucesso**: contém os dados pedidos.
- **Erro**: contém uma mensagem explicando o que deu errado, e um código curto identificando o tipo do problema (por exemplo, "campanha não encontrada" ou "credenciais inválidas").

Isso é parecido com sempre receber a resposta de um garçom no mesmo formato educado: "aqui está seu prato" ou "infelizmente esse prato acabou, mas temos estas opções".
