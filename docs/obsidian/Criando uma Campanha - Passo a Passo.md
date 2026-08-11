---
tags: [projeto, conceito, fluxo]
---

# Criando uma Campanha — Passo a Passo

Voltar para [[Mapa do Projeto]].

Este é um exemplo completo, do clique no botão até a informação ficar guardada para sempre, juntando tudo que as outras notas explicaram separadamente.

## O caminho completo

1. **Você preenche o formulário** em [[O Salão - Frontend]]: nome da campanha, cliente, orçamento, datas de início e fim, plataforma (Instagram, Google Ads, etc).

2. **Você clica em "Salvar"**. O salão empacota essas informações junto com sua pulseirinha de identificação (veja [[Login e Segurança]]) e entrega o pacote para [[O Garçom - API]].

3. **O garçom leva o pedido até a cozinha**, na "estação" certa para pedidos de campanha.

4. **A cozinha confere a pulseirinha** — só continua se ela for válida e ainda não tiver vencido.

5. **A cozinha confere se o pedido faz sentido** — por exemplo, se a data final não é antes da data inicial, se o orçamento é um número válido, se o nome não está vazio. Se algo estiver errado, o pedido para aqui, e uma mensagem de erro específica volta para o salão (ex: "a data final não pode ser antes da data inicial").

6. **A cozinha aplica a regra de negócio**: uma campanha nova sempre nasce com status "planejada", e uma primeira linha já é escrita no livro de registro (veja [[Histórico de Auditoria]]) dizendo "campanha criada".

7. **A cozinha manda o almoxarifado guardar uma ficha nova** na gaveta de campanhas (veja [[O Almoxarifado - Banco de Dados]]).

8. **A cozinha devolve a confirmação** para o garçom: "prato pronto, aqui está a campanha criada, com o número de identificação dela".

9. **O garçom entrega a resposta de volta ao salão**, que atualiza a tela — por exemplo, fechando o formulário e mostrando a campanha nova na lista, ou levando você direto para a página de detalhe dela.

## E se, depois, você editar essa campanha?

O caminho é parecido, mas com uma diferença importante no passo 6: a cozinha primeiro busca o estado **atual** da campanha no almoxarifado, compara campo por campo com o que você está enviando de novo, e só escreve no livro de registro os campos que **realmente mudaram** — ignorando os que continuam iguais. É assim que a página de detalhe consegue te mostrar uma linha do tempo com só as mudanças reais, sem repetição desnecessária.

## Por que vale a pena entender esse fluxo

Ele mostra, num exemplo concreto, por que o projeto é dividido em [[O Salão - Frontend]], [[O Garçom - API]], [[A Cozinha - Backend]] e [[O Almoxarifado - Banco de Dados]]: cada etapa do caminho tem uma responsabilidade única e clara, e um problema em qualquer etapa (um erro de digitação, uma falha de conexão, uma regra violada) pode ser identificado e resolvido sem bagunçar as outras.
