---
tags: [projeto, conceito, historico]
---

# Histórico de Auditoria

Voltar para [[Mapa do Projeto]].

## O que é

Um "livro de registro" onde toda mudança relevante em uma campanha fica anotada para sempre: o que mudou, de que valor para que valor, quem mudou e em que momento exato. É a resposta pronta para perguntas como "por que essa campanha foi pausada em maio?" ou "quem mudou o orçamento dessa campanha semana passada?".

## Como uma anotação nasce

Cada vez que uma campanha é criada ou editada em [[A Cozinha - Backend]], antes de guardar a mudança no [[O Almoxarifado - Banco de Dados]], a cozinha compara o estado **antigo** da campanha com o estado **novo** que está sendo enviado, campo por campo (nome, orçamento, status, datas, responsável). Só os campos que realmente mudaram viram uma anotação nova no livro de registro — os que continuam iguais são ignorados.

Ao **criar** uma campanha pela primeira vez, já nasce uma anotação inicial: "status: (nada) → planejada" — é assim que a linha do tempo de qualquer campanha sempre tem um ponto de partida, mesmo antes de qualquer edição futura.

## O que cada anotação guarda

- Qual campanha foi afetada.
- Qual campo mudou (nome, orçamento, status, data de início, data de fim, ou responsável).
- O valor de antes e o valor de depois.
- Quem estava logado quando fez a mudança.
- A data e hora exatas.

## Uma armadilha real que apareceu durante a construção deste projeto

No começo, o sistema comparava os valores "antigo" e "novo" como texto simples. Isso causou um problema real: o orçamento guardado no almoxarifado vinha no formato `"1000.00"` (com aspas, como texto), enquanto o valor digitado no formulário chegava como `1000` (um número puro). Comparados como texto, esses dois pareciam diferentes um do outro — mesmo representando exatamente o mesmo valor — e o sistema criava anotações falsas de "orçamento mudou", mesmo quando ninguém tinha alterado nada.

A correção foi ensinar a cozinha a comparar esse campo especificamente como número (convertendo os dois lados antes de comparar), e não como texto. Isso é um lembrete de que sistemas que lidam com dinheiro, datas e outros formatos "escondem" detalhes assim, e vale sempre conferir com cuidado antes de assumir que uma comparação simples é suficiente.

## Onde isso aparece para quem usa o sistema

Na página de detalhe de uma campanha, em [[O Salão - Frontend]], existe uma seção de linha do tempo que lista todas essas anotações em ordem cronológica — dando uma "história contada" de tudo que aconteceu com aquela campanha, do nascimento até a última mudança.
