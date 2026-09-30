# Decisões — apae-mvp

## 2026-09-29 — Entrou × saiu em azul e laranja
**Decidido:** gráficos financeiros usam azul `#1d64d8` (entrou) e laranja `#ea580c` (saiu).
**Por quê:** verde × vermelho falhou no validador de daltonismo (ΔE 5,6 deutan); azul × laranja passa (29).
**Rejeitado:** verde/vermelho (convenção, mas ilegível para ~8% dos homens).

## 2026-09-29 — Prestação de contas em regime de caixa
**Decidido:** o período conta o que foi efetivamente pago/recebido (data de quitação). Na aba "Por
verba", os valores são acumulados desde o início da verba.
**Por quê:** é o que convênio e apoiador cobram na prestação de contas.
**Rejeitado:** competência (vencimento) — mistura o que ainda não saiu do caixa.

## 2026-09-29 — Verba é cadastro próprio, com saldo
**Decidido:** Verba = nome, apoiador, tipo, valor aprovado e período. Conta a pagar/receber tem
"Usa verba?" → escolhe a verba → o apoiador vem da verba. Saldo = aprovado − (pago + a pagar).
**Por quê:** permite saldo por verba e prestação de contas por apoiador.
**Rejeitado:** verba como texto livre na conta (sem saldo, só filtro).

## 2026-09-29 — Fluxo de compras com setor de Compras
**Decidido:** Funcionário solicita → Direção aprova (podendo escolher a verba) ou recusa com motivo →
Compras marca "Comprado" (fornecedor, valor real, vencimento) → nasce a conta a pagar; itens com
destino "estoque" dão entrada automática; itens "patrimônio" ganham atalho de cadastro.
**Por quê:** separa quem pede, quem aprova e quem compra, e o financeiro não relança nada.
**Rejeitado:** o próprio solicitante marcar comprado (sem controle de quem compra).

## 2026-09-29 — Dados em zustand + localStorage, perfis trocáveis
**Decidido:** store único persistido, com seed de datas relativas a hoje e botão "Restaurar dados de
demonstração"; quatro perfis com permissões `recurso.acao`, trocáveis pelo menu do usuário.
**Por quê:** a demo precisa contar o fluxo entre módulos (compra → conta → verba → histórico → sino).
**Rejeitado:** `useState` por página como no cuble-db-mvp (fluxos entre telas ficariam só visuais).

## 2026-09-29 — Base da todosDan-client, não do default-admin
**Decidido:** shell, `ui/`, `common/` e histórico copiados da todosDan-client, sem a camada de API.
**Por quê:** pedido explícito ("como na TodosDan"); é o painel mais recente com notificações,
histórico e molde de ficha prontos.
**Rejeitado:** base do cuble-db-mvp (não tem notificação nem histórico).

## 2026-09-29 — Patrimônio sem baixa no MVP
**Decidido:** patrimônio tem cadastro, origem (compra/doação/verba), transferência entre setores e
etiqueta/termo imprimíveis. Baixa ficou fora.
**Por quê:** escolha do Arthur ao definir o escopo.
