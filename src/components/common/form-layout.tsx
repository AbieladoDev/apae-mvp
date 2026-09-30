"use client"

import * as React from "react"
import { Loader2, Plus, RotateCcw } from "lucide-react"

import { Switch } from "@/components/ui/switch"

import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { cn } from "@/lib/utils"

/**
 * O molde dos formulários do painel — nascido no formulário de evento em
 * 22/08/2026 e extraído para cá no mesmo dia, quando as outras telas de
 * cadastro/edição passaram a usá-lo.
 *
 * A forma: seções com o rótulo na MARGEM ESQUERDA dizendo o que aquele bloco
 * resolve, campos à direita ocupando a largura da tela, divisórias de ponta a
 * ponta e uma tira de ações grudada no fim da tela. O que ele substituiu foi
 * a coluna centralizada de 768px com cartão de cabeçalho — que repetia o
 * título da página e deixava metade da tela vazia dos dois lados.
 *
 * ⚠️ Todo formulário que usar isto precisa do `-mx-4 md:-mx-6 md:-mb-6` no
 * `<form>`: é o que cancela o padding do `DashboardLayout` para as divisórias
 * alcançarem as bordas e a tira encostar no fim da tela. Sem isso as linhas
 * param a 24px da borda e o formulário volta a parecer um cartão.
 */
/**
 * ⚠️ O `flex min-h-full flex-col` é o que mantém a tira de ações COLADA no
 * rodapé da tela em formulário curto (28/08/2026). `sticky bottom-0` sozinho
 * gruda no fim do CONTEÚDO: com dois campos — ou num passo curto do cadastro
 * de aluno — a barra parava no meio da tela, e "Cadastrar" ficava flutuando
 * onde o formulário acabou. Com o `<form>` ocupando a altura toda e o
 * `mt-auto` do `FormFooter`, ela desce até o fim mesmo sem rolagem.
 *
 * O `min-h-full` não cria barra de rolagem: os 24px que ele passaria do fim
 * são os mesmos que o `md:-mb-6` já devolve ao `main`.
 */
/**
 * ⚠️ O `-mt-4 md:-mt-6` (28/08/2026) é o que faz a PRIMEIRA divisória encostar
 * na borda do cabeçalho da página. Sem ele sobra o padding do `main` entre as
 * duas linhas, e a de cima parece solta — o formulário começa flutuando.
 * As quatro margens negativas andam juntas: o conteúdo vai de ponta a ponta.
 */
export const FORM_MOLDE =
  "-mx-4 -mt-4 flex min-h-full flex-col md:-mx-6 md:-mb-6 md:-mt-6"

/**
 * Uma seção: rótulo na margem esquerda, campos à direita.
 *
 * A coluna do rótulo tem largura FIXA (`220px`) para que todas as seções
 * alinhem os campos na mesma linha vertical — com `1fr 1fr` cada seção
 * começaria os campos num lugar diferente e o formulário viraria uma escada.
 */
export function Secao({
  titulo,
  descricao,
  children,
}: {
  titulo: string
  descricao: string
  children: React.ReactNode
}) {
  return (
    <section className="grid gap-x-10 gap-y-4 border-b px-4 py-6 md:grid-cols-[220px_1fr] md:px-6">
      <div className="min-w-0">
        <h3 className="text-sm font-semibold">{titulo}</h3>
        <p className="mt-1 text-xs leading-snug text-muted-foreground">
          {descricao}
        </p>
      </div>
      {/* Sem `max-w` aqui: quem limita a largura é cada campo (`w-32`, `w-56`,
          `w-96`), e a coluna só precisa caber o par rótulo+campo. */}
      <div className="min-w-0 space-y-4">{children}</div>
    </section>
  )
}

/**
 * Uma linha: nome e explicação de um lado, o controle na outra ponta.
 *
 * A dica vive junto do RÓTULO e não embaixo do campo: do outro lado ela
 * empurraria o controle para baixo e quebraria o alinhamento da coluna.
 */
export function Campo({
  label,
  htmlFor,
  required,
  hint,
  children,
  className,
}: {
  label: string
  htmlFor?: string
  required?: boolean
  hint?: React.ReactNode
  children: React.ReactNode
  className?: string
}) {
  return (
    <div
      className={cn(
        "flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between sm:gap-8",
        className
      )}
    >
      <div className="min-w-0 sm:max-w-sm sm:pt-2">
        <Label htmlFor={htmlFor}>
          {label}
          {required && <span className="text-destructive"> *</span>}
        </Label>
        {hint && (
          <p className="mt-1 text-xs leading-snug text-muted-foreground">
            {hint}
          </p>
        )}
      </div>
      {/* `shrink-0`: o controle tem largura própria e não deve encolher para
          caber a explicação — quem quebra linha é o texto, não o campo.
          ⚠️ Por isso os campos usam `w-*` e não `max-w-*`: num item que não
          estica, `max-w` não define largura nenhuma e o input cai no tamanho
          intrínseco (~190px). */}
      <div className="sm:shrink-0">{children}</div>
    </div>
  )
}

/**
 * A tira de ações, grudada no fim da tela.
 *
 * `sticky bottom-0` sozinho parava 24px antes do fim: o elemento gruda na
 * borda da caixa de CONTEÚDO do container que rola, e o `main` do
 * `DashboardLayout` tem `md:pb-6`. O `md:-bottom-6` desce o ponto de grude os
 * mesmos 24px que o `md:-mb-6` do `<form>` cancelou.
 */
export function FormFooter({
  isSubmitting,
  submitLabel,
  onCancel,
  onReset,
  resetLabel,
  navegacao,
  className,
}: {
  isSubmitting?: boolean
  submitLabel: string
  onCancel: () => void
  /** Sem isto, a tira mostra só Cancelar e o botão de salvar. */
  onReset?: () => void
  resetLabel?: string
  /**
   * Navegação do formulário em passos (Voltar/Avançar), à ESQUERDA da tira.
   *
   * Fica aqui, e não solta no fim do conteúdo, porque a tira é o que está
   * sempre à vista: com os botões no corpo, passar de passo exigia rolar até
   * o fim de cada um. Cancelar e salvar continuam do outro lado — a distância
   * é o que impede trocar "Avançar" por "Cadastrar" no impulso.
   */
  navegacao?: React.ReactNode
  /**
   * ⚠️ Existe por um motivo só: desligar o `mt-auto` com `className="mt-0"`.
   *
   * Margem automática consome o espaço livre do flex ANTES de o `flex-1` de um
   * irmão crescer. No formulário cujo conteúdo precisa ocupar a altura toda —
   * o cadastro de aluno, com a coluna de passos de ponta a ponta — o `mt-auto`
   * daqui roubava justamente essa sobra, e a coluna parava no meio da tela.
   * Nos outros 10 formulários o `mt-auto` continua sendo o que gruda a tira
   * no rodapé.
   */
  className?: string
}) {
  return (
    <div
      className={cn(
        /* `py-2` + botões `sm`: 47px de altura contra os 61 de antes. A
           tira é uma barra de AÇÃO, não um bloco de conteúdo — grossa, ela
           comia altura da área que se preenche, em toda tela de cadastro. */
        /* ⚠️ `shrink-0`: num formulário de altura travada (o cadastro de
           aluno) a tira é irmã de um `flex-1`, e sem isto ela cede altura
           para o miolo em vez de o miolo rolar. */
        "sticky bottom-0 mt-auto flex shrink-0 flex-wrap items-center justify-end gap-2 border-t bg-background px-4 py-1.5 md:-bottom-6 md:px-6",
        className
      )}
    >
      {/* Limpar e a navegação ficam LONGE dos outros dois: uma joga trabalho
          fora, a outra muda de passo, e nenhuma pode estar a um pixel do
          botão de salvar. */}
      {(onReset || navegacao) && (
        <div className="mr-auto flex flex-wrap items-center gap-2">
          {navegacao}
          {onReset && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="text-muted-foreground"
              onClick={onReset}
              disabled={isSubmitting}
            >
              <RotateCcw className="mr-1.5 h-3.5 w-3.5" />
              {resetLabel ?? "Limpar formulário"}
            </Button>
          )}
        </div>
      )}
      <Button
        type="button"
        variant="outline"
        size="sm"
        onClick={onCancel}
        disabled={isSubmitting}
      >
        Cancelar
      </Button>
      <Button type="submit" size="sm" disabled={isSubmitting}>
        {isSubmitting && <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />}
        {submitLabel}
      </Button>
    </div>
  )
}

/* ------------------------------------------------------------------------ *
 * O molde EMPILHADO (28/08/2026)
 *
 * O `Secao`/`Campo` acima põem o rótulo de um lado e o controle do outro
 * (`justify-between`) numa faixa da largura da tela. Funciona em formulário
 * curto; no cadastro de aluno, com dezoito campos, virava uma escada — vão
 * enorme no meio de cada linha e controles de larguras diferentes alinhados à
 * direita, cada um começando num lugar.
 *
 * Este segundo molde empilha rótulo e campo e distribui em GRADE, dentro de
 * uma coluna de largura legível. É o desenho para formulário longo; o de cima
 * segue valendo para os curtos. Não converter os 11 formulários de uma vez:
 * cada um muda quando for mexido.
 * ------------------------------------------------------------------------ */

/**
 * O cabeçalho de um bloco de campos — o nome do assunto e o que ele resolve.
 *
 * Diferente do `Secao`, o título fica ACIMA dos campos, não à margem: a coluna
 * de rótulo de 220px custava largura que a grade de dois campos precisa.
 */
export function Bloco({
  id,
  titulo,
  descricao,
  acao,
  children,
  className,
}: {
  /**
   * Ancora para o erro de validacao poder ROLAR ate a secao.
   *
   * ⚠️ Sem ela, num formulario de duas colunas o toast manda procurar o campo
   * — que e o que o cadastro de aluno fazia antes de ter passos, e o que
   * voltaria a fazer ao perde-los.
   */
  id?: string
  titulo: string
  descricao?: string
  /**
   * Um gesto que vale para o bloco INTEIRO, na ponta direita do cabeçalho
   * (29/08/2026, "Adicionar dia" do construtor de rotina).
   *
   * ⚠️ No cabeçalho e não no pé: no pé, com a lista rolada, o botão que
   * ACRESCENTA à lista só existia para quem chegasse ao fim dela.
   */
  acao?: React.ReactNode
  children: React.ReactNode
  className?: string
}) {
  return (
    <section id={id} className={cn("min-w-0", className)}>
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h2 className="text-base font-semibold">{titulo}</h2>
          {descricao && (
            <p className="mt-1 text-sm leading-snug text-muted-foreground">
              {descricao}
            </p>
          )}
        </div>
        {acao && <div className="shrink-0">{acao}</div>}
      </div>
      <div className="mt-5 grid grid-cols-1 gap-x-6 gap-y-5 sm:grid-cols-2">
        {children}
      </div>
    </section>
  )
}

/**
 * Um campo da grade: rótulo em cima, controle ocupando a célula inteira.
 *
 * `largo` faz o campo atravessar as duas colunas — nome, endereço e área de
 * texto, que ficam ridículos com metade da largura.
 *
 * ⚠️ O controle filho deve vir SEM `w-*`: aqui quem define a largura é a
 * célula da grade. Um `w-56` herdado do molde antigo deixa buraco à direita.
 */
export function CampoEmpilhado({
  label,
  htmlFor,
  required,
  hint,
  largo,
  children,
  className,
}: {
  label: string
  htmlFor?: string
  required?: boolean
  hint?: React.ReactNode
  largo?: boolean
  children: React.ReactNode
  className?: string
}) {
  return (
    <div
      className={cn(
        "flex min-w-0 flex-col gap-1.5",
        largo && "sm:col-span-2",
        className
      )}
    >
      <Label htmlFor={htmlFor}>
        {label}
        {required && <span className="text-destructive"> *</span>}
      </Label>
      {children}
      {hint && (
        <p className="text-xs leading-snug text-muted-foreground">{hint}</p>
      )}
    </div>
  )
}

/**
 * Um bloco de campos que começa FECHADO, atrás de um botão (28/08/2026).
 *
 * Nasceu no cadastro de aluno, para responsável, endereço e observações: são
 * os três blocos que a maioria dos cadastros não preenche — aluno adulto não
 * tem responsável, e o endereço quase nunca é pedido no balcão. Abertos, eles
 * ocupavam metade do formulário oferecendo dez campos vazios, e a pessoa lia
 * dez perguntas para responder nenhuma.
 *
 * ⚠️ **Fechado com conteúdo NÃO esconde o conteúdo**: o botão passa a mostrar
 * o `resumo`. Um bloco que engole o que foi digitado é pior que um bloco
 * comprido — o dado existe, vai ser salvo, e ninguém vê que existe.
 *
 * ⚠️ **Fechar não apaga.** Quem preencheu e recolheu continua salvando o que
 * preencheu; limpar aqui seria destruir dado por um gesto de layout.
 *
 * ⚠️ **Não usa `Collapsible` do Radix**: ele anima com `--radix-collapsible-
 * content-height`, uma variável que o Radix mede uma vez e que erra assim que
 * o conteúdo muda de altura sozinho — o que uma `Textarea` faz ao crescer. A
 * abertura aqui é o truque de `grid-rows`, que não mede nada.
 */
export function Abrivel({
  aberto,
  onAlternar,
  rotulo,
  resumo,
  disabled,
  children,
}: {
  aberto: boolean
  onAlternar: (aberto: boolean) => void
  /** O que o botão diz quando está fechado e vazio. */
  rotulo: string
  /** O que foi preenchido, para o botão mostrar quando fechado. */
  resumo?: string
  disabled?: boolean
  children: React.ReactNode
}) {
  const temConteudo = Boolean(resumo)

  return (
    <div
      className={cn(
        "overflow-hidden rounded-lg border transition-colors sm:col-span-2",
        !disabled && "hover:border-primary/60",
        /* Tracejado enquanto está vazio: é convite. Aberto ou preenchido,
           vira uma linha sólida como qualquer campo que já tem valor. */
        aberto || temConteudo ? "border-solid" : "border-dashed",
        disabled && "opacity-60"
      )}
    >
      <button
        type="button"
        disabled={disabled}
        aria-expanded={aberto}
        onClick={() => onAlternar(!aberto)}
        className="flex w-full items-center gap-2 px-3 py-2.5 text-left text-sm disabled:pointer-events-none"
      >
        <span
          aria-hidden
          className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full border border-dashed text-muted-foreground"
        >
          {/* Um ícone só, que GIRA — o `+` deitado é o `−`. Trocar de ícone
              faria a mudança acontecer sem trajeto, e o botão que abre o
              cartão pareceria outro botão depois de aberto. */}
          <Plus
            className={cn(
              "h-3.5 w-3.5 transition-transform duration-200 motion-reduce:transition-none",
              aberto && "rotate-45"
            )}
          />
        </span>
        <span className="min-w-0 flex-1">
          <span className="block font-medium">{rotulo}</span>
          {/* O resumo só aparece FECHADO: aberto, os próprios campos o dizem
              melhor, e a linha viraria eco do que está logo abaixo. */}
          {!aberto && temConteudo && (
            <span className="block truncate text-xs text-muted-foreground">
              {resumo}
            </span>
          )}
        </span>
      </button>

      {/*
        A ABERTURA É DO PRÓPRIO CARTÃO (28/08/2026, pedido do Arthur): os
        campos crescem de dentro dele, e não num bloco solto que aparecia
        abaixo. O botão é o cabeçalho do mesmo cartão o tempo todo.

        ⚠️ **`grid-rows-[0fr]` → `[1fr]` é o que permite ANIMAR** uma altura
        que ninguém sabe de antemão. `height: auto` não é interpolável, e a
        alternativa seria medir o conteúdo em JS a cada render — que erra no
        primeiro campo que muda de tamanho (uma `Textarea`, aqui).

        ⚠️ O `overflow-hidden` do filho é obrigatório: sem ele o conteúdo
        transborda a linha de altura zero e o cartão fechado mostra os campos
        por cima do que vem depois. Nenhum destes blocos tem `Select` ou
        `DatePicker` — se um dia tiver, o popover é cortado aqui.
      */}
      <div
        className={cn(
          "grid transition-[grid-template-rows] duration-200 ease-out motion-reduce:transition-none",
          aberto ? "grid-rows-[1fr]" : "grid-rows-[0fr]"
        )}
      >
        <div className="overflow-hidden">
          <div className="grid grid-cols-1 gap-x-6 gap-y-5 border-t px-3 py-4 sm:grid-cols-2">
            {children}
          </div>
        </div>
      </div>
    </div>
  )
}

/**
 * Um SIM/NÃO como linha inteira: rótulo e explicação à esquerda, interruptor à
 * direita (28/08/2026).
 *
 * Nasceu no cadastro de funcionário. Num `CampoEmpilhado` o rótulo fica acima e
 * o controle abaixo, e um `Switch` de 36px sozinho embaixo de "Funcionário
 * ativo" deixava a linha com um buraco à direita e nenhuma pista de onde
 * clicar. Aqui a área clicável é a linha toda.
 *
 * Com `children`, ele vira um CARTÃO QUE ABRE: os campos que só existem quando
 * a resposta é sim moram dentro dele, e aparecem ao ligar. É o caso de "tem
 * acesso ao sistema", que revela e-mail e senha — soltos abaixo, eles surgiam
 * do nada e ninguém ligava um ao outro.
 *
 * ⚠️ **O `<label>` envolve só o CABEÇALHO**, nunca o corpo: envolvendo os dois,
 * clicar dentro do campo de e-mail alternaria o interruptor e fecharia o
 * cartão que se estava preenchendo.
 *
 * ⚠️ A abertura é o truque de `grid-rows-[0fr]` → `[1fr]`, o mesmo do
 * `Abrivel`. `height: auto` não é interpolável.
 */
export function Interruptor({
  rotulo,
  descricao,
  marcado,
  onMarcar,
  disabled,
  children,
}: {
  rotulo: string
  descricao?: string
  marcado: boolean
  onMarcar: (marcado: boolean) => void
  disabled?: boolean
  /** Os campos que só fazem sentido com o interruptor LIGADO. */
  children?: React.ReactNode
}) {
  return (
    <div
      className={cn(
        "overflow-hidden rounded-lg border transition-colors sm:col-span-2",
        !disabled && "hover:border-primary/60",
        marcado && children ? "border-primary/60" : undefined,
        disabled && "opacity-60"
      )}
    >
      <label
        className={cn(
          "flex items-start justify-between gap-4 px-3 py-2.5",
          disabled ? "cursor-default" : "cursor-pointer"
        )}
      >
        <span className="min-w-0">
          <span className="block text-sm font-medium">{rotulo}</span>
          {descricao && (
            <span className="block text-xs leading-snug text-muted-foreground">
              {descricao}
            </span>
          )}
        </span>
        <Switch
          checked={marcado}
          onCheckedChange={onMarcar}
          disabled={disabled}
          className="mt-0.5 shrink-0"
        />
      </label>

      {children && (
        <div
          className={cn(
            "grid transition-[grid-template-rows] duration-200 ease-out motion-reduce:transition-none",
            marcado ? "grid-rows-[1fr]" : "grid-rows-[0fr]"
          )}
        >
          <div className="overflow-hidden">
            <div className="grid grid-cols-1 gap-x-6 gap-y-5 border-t px-3 py-4 sm:grid-cols-2">
              {children}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
