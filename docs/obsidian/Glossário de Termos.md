---
tags: [projeto, glossario]
---

# Glossário de Termos

Voltar para [[Mapa do Projeto]].

Cada termo abaixo tem a explicação em uma frase, e aponta para a nota onde ele é explorado com mais calma.

- **Frontend** — o "salão": telas, botões, o que você vê e clica. Veja [[O Salão - Frontend]].
- **Backend** — a "cozinha": o programa invisível que processa pedidos e aplica regras. Veja [[A Cozinha - Backend]].
- **Banco de dados** — o "almoxarifado": onde as informações ficam guardadas permanentemente, organizadas em gavetas (tabelas). Veja [[O Almoxarifado - Banco de Dados]].
- **API** — o "garçom": o conjunto fixo de pedidos que o salão pode fazer à cozinha, e o caminho pelo qual eles viajam. Veja [[O Garçom - API]].
- **Tabela** — uma "gaveta" do almoxarifado, dedicada a um tipo de informação (ex: a gaveta "campanhas").
- **Login** — o processo de provar quem você é (email + senha) para o sistema liberar acesso.
- **Hash** — o "triturador de papel": transforma uma senha numa bagunça de caracteres sem volta possível. Veja [[Login e Segurança]].
- **Token (ou JWT)** — a "pulseirinha" que você recebe depois do login, provando que já se identificou, sem precisar repetir email e senha a cada ação. Veja [[Login e Segurança]].
- **Soft delete (exclusão suave)** — "excluir" uma campanha sem realmente apagá-la do almoxarifado — ela só é marcada como removida e escondida das buscas normais, preservando o histórico. Veja [[O Almoxarifado - Banco de Dados]].
- **Histórico de auditoria** — o "livro de registro" que anota toda mudança relevante em uma campanha, com quem mudou e quando. Veja [[Histórico de Auditoria]].
- **Status de uma campanha** — o estado atual dela: planejada, ativa, pausada, concluída ou cancelada.
- **Dashboard (painel)** — a tela-resumo com números e gráficos importantes, para não precisar ler campanha por campanha para ter uma visão geral.
- **Servidor** — o computador (ou processo) onde a cozinha (backend) fica rodando o tempo todo, esperando pedidos.
- **Requisição (pedido)** — uma mensagem enviada do salão até a cozinha através do garçom, pedindo alguma ação ou informação.
