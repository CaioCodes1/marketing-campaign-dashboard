---
tags: [projeto, conceito, seguranca]
---

# Login e Segurança

Voltar para [[Mapa do Projeto]].

## O triturador de papel (proteção da senha)

Quando alguém cria uma conta, a senha digitada **nunca** é guardada em [[O Almoxarifado - Banco de Dados]] do jeito que foi escrita. Isso seria perigoso: se alguém conseguisse acesso indevido ao almoxarifado, teria a senha de todo mundo em mãos, prontinha para usar.

Em vez disso, antes de guardar, a senha passa por um processo parecido com jogar um papel num **triturador**: o resultado é uma bagunça de caracteres sem nenhuma forma de reconstruir o papel original a partir dela. Esse processo se chama **hash**, e o resultado (a bagunça) é o que realmente fica guardado.

Quando você tenta logar de novo, o sistema não "abre" a bagunça guardada para comparar com o que você digitou — isso seria impossível, de propósito. Em vez disso, ele pega a senha que você acabou de digitar, passa pelo **mesmo triturador**, e compara a nova bagunça com a bagunça guardada. Se as duas bagunças forem idênticas, a senha era a mesma — sem que o sistema nunca tenha precisado "saber" ou "guardar" a senha real em algum lugar.

> Curiosidade: mesmo triturando a mesma senha duas vezes, a bagunça resultante sai diferente a cada vez (por causa de um ingrediente aleatório extra, chamado "sal", que o processo acrescenta). Mesmo assim, a comparação ainda funciona, porque esse "sal" fica anotado junto com a própria bagunça guardada.

## A pulseirinha (o que acontece depois do login)

Depois de confirmar que a senha está certa, o sistema te entrega algo parecido com uma **pulseirinha de parque de diversões**: um código que prova, nas próximas visitas aos brinquedos (ou seja, nas próximas ações que você fizer no sistema), que você já se identificou uma vez — sem precisar digitar email e senha de novo a cada clique.

Essa pulseirinha tem um **selo de autenticidade** aplicado pelo próprio sistema, usando uma "receita secreta" que só ele conhece. Se alguém tentasse rabiscar a pulseirinha por fora (por exemplo, tentando se passar por um administrador em vez de um usuário comum), o selo de autenticidade não bateria mais com o conteúdo rabiscado — e o sistema recusaria a pulseirinha na próxima tentativa de uso, mesmo sem nunca ter visto aquela pessoa antes.

Essa pulseirinha (o **token**) contém, de forma legível para qualquer um que souber olhar (não é segredo o conteúdo dela, só o selo é protegido): quem é você, e até quando a pulseirinha vale.

## Por onde a pulseirinha viaja

Toda vez que [[O Salão - Frontend]] pede algo protegido para a [[A Cozinha - Backend]] através d' [[O Garçom - API]] (por exemplo, "me mostra minhas campanhas"), a pulseirinha viaja junto com o pedido. A cozinha confere o selo dela antes de fazer qualquer trabalho — se o selo não bate, ou a pulseirinha já venceu, o pedido é recusado, e o salão te manda de volta para a tela de login.

## Por que ninguém consegue "forjar" uma pulseirinha nova

Forjar uma pulseirinha exigiria conhecer a "receita secreta" usada para gerar o selo — e essa receita nunca sai de dentro do sistema, não é enviada em nenhum momento para o navegador. Sem ela, é possível até editar o conteúdo visível da pulseirinha, mas impossível gerar um selo que combine com esse novo conteúdo.
