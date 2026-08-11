---
tags: [projeto, conceito, backend]
---

# A Cozinha (Backend)

Voltar para [[Mapa do Projeto]].

## O que é

É um programa que fica rodando o tempo todo, sem nenhuma tela própria, esperando pedidos chegarem. É a cozinha do restaurante: ninguém de fora vê o que acontece lá dentro, mas é lá que o trabalho de verdade é feito — as contas, as regras, as decisões.

Quando [[O Salão - Frontend]] precisa de alguma coisa (ver campanhas, criar uma nova, confirmar um login), o pedido chega até a cozinha através d' [[O Garçom - API]].

## O que a cozinha faz, na prática

- Confere se quem está pedindo tem permissão (está logado — veja [[Login e Segurança]]).
- Confere se as informações enviadas fazem sentido (ex: a data final de uma campanha não pode ser antes da data inicial).
- Aplica as regras do negócio — por exemplo: "se o orçamento de uma campanha mudou, anote isso no livro de registro" (veja [[Histórico de Auditoria]]).
- Vai até [[O Almoxarifado - Banco de Dados]] buscar ou guardar informações — a cozinha não guarda nada na própria "cabeça", ela sempre consulta ou atualiza o almoxarifado.
- Devolve o resultado pronto para o garçom levar de volta ao salão.

## Por que a cozinha é organizada em "estações de trabalho"

Uma cozinha profissional não tem uma pessoa fazendo tudo sozinha do início ao fim — existe quem recebe a comanda, quem prepara o prato, quem confere a qualidade antes de sair. Esse projeto segue a mesma ideia: o trabalho da cozinha é dividido em etapas, cada uma com uma responsabilidade única:

1. **Recepção do pedido** — identifica que tipo de pedido é este (buscar campanhas? criar uma nova?).
2. **Segurança na porta** — confere se quem pediu está autorizado (tem uma "pulseirinha" válida — veja [[Login e Segurança]]).
3. **Conferência do pedido** — confere se o pedido está bem formado (todos os campos obrigatórios preenchidos, formatos corretos).
4. **Preparo** — aplica as regras de negócio de verdade (o que conta como "campanha alterada", por exemplo).
5. **Busca de ingredientes** — vai ao almoxarifado buscar ou guardar dados.

Dividir dessa forma significa que, se um dia uma dessas etapas precisar mudar (por exemplo, uma nova regra de negócio), só aquela etapa é mexida — as outras continuam funcionando exatamente como antes, sem risco de quebrar o resto.

## Se algo dá errado no meio do preparo

A cozinha tem um protocolo para quando algo sai errado (ex: pedido de uma campanha que não existe, ou uma tentativa de login com senha errada): ela nunca deixa o cliente sem resposta, nem devolve informações internas sensíveis por engano. Ela sempre responde com uma mensagem de erro clara e um "código do problema", para o salão poder exibir um aviso adequado (ex: "campanha não encontrada", "credenciais inválidas").
