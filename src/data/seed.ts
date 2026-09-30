import type {
  Apoiador,
  Auditoria,
  Bem,
  Compra,
  ContaPagar,
  ContaReceber,
  ItemEstoque,
  MovEstoque,
  Notificacao,
  Prestador,
  Verba,
} from "./tipos"
import { dataISO } from "@/lib/datas"

/**
 * DADOS DE DEMONSTRAÇÃO.
 *
 * As datas são relativas a HOJE (o dia em que a demo foi aberta ou restaurada),
 * para o painel sempre parecer vivo: há conta vencendo esta semana, conta
 * vencida, compra esperando aprovação e seis meses de histórico nos gráficos.
 */

function dia(offset: number, base = new Date()): string {
  const d = new Date(base.getFullYear(), base.getMonth(), base.getDate())
  d.setDate(d.getDate() + offset)
  return dataISO(d)
}

/** Dia `n` do mês deslocado em `meses` a partir do mês atual. */
function noMes(meses: number, n: number): string {
  const hoje = new Date()
  const d = new Date(hoje.getFullYear(), hoje.getMonth() + meses, 1)
  const ultimo = new Date(d.getFullYear(), d.getMonth() + 1, 0).getDate()
  d.setDate(Math.min(n, ultimo))
  return dataISO(d)
}

function instante(offsetDias: number, hora = 10, minuto = 0): string {
  const d = new Date()
  d.setDate(d.getDate() + offsetDias)
  d.setHours(hora, minuto, 0, 0)
  return d.toISOString()
}

const hojeISO = () => dia(0)

export interface DadosDemo {
  apoiadores: Apoiador[]
  verbas: Verba[]
  contasPagar: ContaPagar[]
  contasReceber: ContaReceber[]
  compras: Compra[]
  itensEstoque: ItemEstoque[]
  movsEstoque: MovEstoque[]
  bens: Bem[]
  prestadores: Prestador[]
  auditoria: Auditoria[]
  notificacoes: Notificacao[]
  lidas: Record<string, string[]>
  seq: number
}

export function gerarSeed(): DadosDemo {
  const apoiadores: Apoiador[] = [
    { id: "ap1", nome: "Prefeitura Municipal de Esteio", criadoEm: dia(-400) },
    { id: "ap2", nome: "Governo do Estado do RS", criadoEm: dia(-400) },
    { id: "ap3", nome: "Emenda Parlamentar — Dep. Federal", criadoEm: dia(-300) },
    { id: "ap4", nome: "Programa Nota Fiscal Gaúcha", criadoEm: dia(-400) },
    { id: "ap5", nome: "Rotary Club de Esteio", criadoEm: dia(-200) },
    { id: "ap6", nome: "Supermercado Bom Preço", criadoEm: dia(-150) },
    { id: "ap7", nome: "Doadores pessoa física", criadoEm: dia(-400) },
  ]

  const ano = new Date().getFullYear()
  const verbas: Verba[] = [
    {
      id: "vb1",
      nome: `Convênio Municipal ${ano} — Educação Especial`,
      descricao:
        "Repasse mensal da Secretaria de Educação para manutenção da escola especial: alimentação, material pedagógico e transporte.",
      apoiadorId: "ap1",
      tipo: "convenio",
      valorCents: 48000000,
      inicio: `${ano}-01-01`,
      fim: `${ano}-12-31`,
    },
    {
      id: "vb2",
      nome: "Programa Estadual de Reabilitação",
      descricao:
        "Recurso da SES/RS para atendimentos de fisioterapia, fonoaudiologia e terapia ocupacional.",
      apoiadorId: "ap2",
      tipo: "programa",
      valorCents: 21000000,
      inicio: `${ano}-03-01`,
      fim: `${ano + 1}-02-28`,
    },
    {
      id: "vb3",
      nome: "Emenda — Van adaptada e equipamentos",
      descricao:
        "Emenda parlamentar destinada à compra de veículo adaptado e equipamentos de reabilitação.",
      apoiadorId: "ap3",
      tipo: "emenda",
      valorCents: 25000000,
      inicio: `${ano}-02-01`,
      fim: `${ano}-12-31`,
    },
    {
      id: "vb4",
      nome: "Campanha Inverno Aquecido",
      descricao: "Arrecadação para cobertores, agasalhos e aquecimento das salas.",
      apoiadorId: "ap5",
      tipo: "campanha",
      valorCents: 1800000,
      inicio: noMes(-4, 1),
      fim: noMes(1, 28),
    },
    {
      id: "vb5",
      nome: "Nota Fiscal Gaúcha — repasses do ano",
      descricao: "Valores recebidos pelo programa estadual por indicação da entidade nas notas.",
      apoiadorId: "ap4",
      tipo: "programa",
      valorCents: 3600000,
      inicio: `${ano}-01-01`,
      fim: `${ano}-12-31`,
    },
  ]

  // ---------- Contas a pagar: seis meses de recorrentes + avulsas ----------
  const contasPagar: ContaPagar[] = []
  let n = 0
  const cp = (c: Omit<ContaPagar, "id" | "criadoEm" | "observacoes" | "usaVerba"> & { observacoes?: string }) => {
    n++
    const pago = c.pagoEm
    contasPagar.push({
      id: `cp${n}`,
      observacoes: "",
      usaVerba: Boolean(c.verbaId),
      criadoEm: dia(-5, new Date(c.vencimento + "T12:00:00")),
      ...c,
      pagoEm: pago,
    })
  }
  for (let m = -5; m <= 1; m++) {
    const passado = m < 0
    const atual = m === 0
    const pagoSe = (diaVenc: number) => {
      const venc = noMes(m, diaVenc)
      if (passado) return venc
      if (atual && venc < hojeISO()) return venc
      return undefined
    }
    const varia = (base: number, k: number) => base + ((m + 7) * k) % 9000
    cp({ descricao: "Energia elétrica — RGE", valorCents: varia(318000, 1300), vencimento: noMes(m, 10), categoria: "Água, luz e telefone", fornecedor: "RGE Sul", pagoEm: pagoSe(10), forma: "boleto" })
    cp({ descricao: "Água e esgoto — Corsan", valorCents: varia(96000, 700), vencimento: noMes(m, 12), categoria: "Água, luz e telefone", fornecedor: "Corsan", pagoEm: pagoSe(12), forma: "boleto" })
    cp({ descricao: "Internet e telefone", valorCents: 38990, vencimento: noMes(m, 15), categoria: "Água, luz e telefone", fornecedor: "Vivo Empresas", pagoEm: pagoSe(15), forma: "boleto" })
    cp({ descricao: "Hortifruti e mercado da cozinha", valorCents: varia(1240000, 2300), vencimento: noMes(m, 5), categoria: "Alimentação", fornecedor: "Supermercado Bom Preço", verbaId: "vb1", pagoEm: pagoSe(5), forma: "pix" })
    cp({ descricao: "Combustível da van", valorCents: varia(185000, 900), vencimento: noMes(m, 20), categoria: "Transporte", fornecedor: "Posto Esteio Centro", verbaId: "vb1", pagoEm: pagoSe(20), forma: "cartao" })
    cp({ descricao: "Fisioterapeuta — Dra. Paula Kern", valorCents: 450000, vencimento: noMes(m, 7), categoria: "Prestadores de serviço", fornecedor: "Paula Kern", prestadorId: "pr2", verbaId: "vb2", pagoEm: pagoSe(7), forma: "transferencia" })
    cp({ descricao: "Fonoaudióloga — Letícia Moraes", valorCents: 380000, vencimento: noMes(m, 7), categoria: "Prestadores de serviço", fornecedor: "Letícia Moraes", prestadorId: "pr1", verbaId: "vb2", pagoEm: pagoSe(7), forma: "transferencia" })
    cp({ descricao: "Contabilidade mensal", valorCents: 120000, vencimento: noMes(m, 25), categoria: "Prestadores de serviço", fornecedor: "Escritório Contábil Sinos", prestadorId: "pr8", pagoEm: pagoSe(25), forma: "boleto" })
    cp({ descricao: "Produtos de limpeza", valorCents: varia(64000, 500), vencimento: noMes(m, 18), categoria: "Limpeza e higiene", fornecedor: "Distribuidora Limpa Tudo", pagoEm: pagoSe(18), forma: "boleto" })
  }
  cp({ descricao: "Manutenção do telhado — bloco B", valorCents: 870000, vencimento: noMes(-3, 14), categoria: "Manutenção", fornecedor: "Construtora Vale", pagoEm: noMes(-3, 14), forma: "transferencia" })
  cp({ descricao: "Material pedagógico — 1º semestre", valorCents: 642000, vencimento: noMes(-4, 8), categoria: "Material pedagógico", fornecedor: "Papelaria Central", verbaId: "vb1", pagoEm: noMes(-4, 8), forma: "boleto" })
  cp({ descricao: "Van adaptada Renault Master — entrada", valorCents: 9500000, vencimento: noMes(-2, 3), categoria: "Equipamentos", fornecedor: "Mobilidade Sul Veículos", verbaId: "vb3", pagoEm: noMes(-2, 3), forma: "transferencia" })
  cp({ descricao: "Van adaptada Renault Master — saldo", valorCents: 9500000, vencimento: noMes(0, 3) < hojeISO() ? dia(9) : noMes(0, 3), categoria: "Equipamentos", fornecedor: "Mobilidade Sul Veículos", verbaId: "vb3", forma: "transferencia" })
  cp({ descricao: "Cobertores e agasalhos", valorCents: 690000, vencimento: noMes(-2, 22), categoria: "Outros", fornecedor: "Atacado Têxtil RS", verbaId: "vb4", pagoEm: noMes(-2, 22), forma: "pix" })
  cp({ descricao: "Aquecedores para as salas", valorCents: 480000, vencimento: noMes(-1, 11), categoria: "Equipamentos", fornecedor: "Eletro Esteio", verbaId: "vb4", pagoEm: noMes(-1, 11), forma: "cartao" })
  cp({ descricao: "Revisão elétrica do refeitório", valorCents: 145000, vencimento: dia(-3), categoria: "Manutenção", fornecedor: "Rogério Elétrica", prestadorId: "pr9", forma: "pix", observacoes: "Aguardando nota fiscal para pagar." })
  cp({ descricao: "Exames e EPIs da equipe", valorCents: 98000, vencimento: dia(2), categoria: "Saúde e terapias", fornecedor: "Clínica Ocupacional Esteio", forma: "boleto" })
  cp({ descricao: "Bolas suíças e colchonetes", valorCents: 236000, vencimento: dia(5), categoria: "Saúde e terapias", fornecedor: "Ortopédica Gaúcha", verbaId: "vb2", forma: "boleto", compraId: "co2" })

  // ---------- Contas a receber ----------
  const contasReceber: ContaReceber[] = []
  let r = 0
  const cr = (c: Omit<ContaReceber, "id" | "criadoEm" | "observacoes" | "usaVerba" | "forma"> & { observacoes?: string; forma?: ContaReceber["forma"] }) => {
    r++
    contasReceber.push({
      id: `cr${r}`,
      observacoes: "",
      usaVerba: Boolean(c.verbaId),
      forma: "transferencia",
      criadoEm: dia(-5, new Date(c.vencimento + "T12:00:00")),
      ...c,
    })
  }
  for (let m = -5; m <= 1; m++) {
    const recebe = (d: number) => {
      const v = noMes(m, d)
      return m < 0 || (m === 0 && v < hojeISO()) ? v : undefined
    }
    cr({ descricao: "Repasse mensal — Convênio Municipal", valorCents: 4000000, vencimento: noMes(m, 8), origem: "Convênio", pagador: "Prefeitura Municipal de Esteio", verbaId: "vb1", apoiadorId: "ap1", recebidoEm: recebe(8) })
    cr({ descricao: "Nota Fiscal Gaúcha — repasse", valorCents: 280000 + ((m + 6) * 3700) % 60000, vencimento: noMes(m, 20), origem: "Nota Fiscal Gaúcha", pagador: "Governo do Estado do RS", verbaId: "vb5", apoiadorId: "ap4", recebidoEm: recebe(20) })
    cr({ descricao: "Contribuição de sócios", valorCents: 410000 + ((m + 6) * 5100) % 40000, vencimento: noMes(m, 10), origem: "Contribuição de sócios", pagador: "Sócios contribuintes", recebidoEm: recebe(10), forma: "pix" })
    if (m % 3 === 0 || m === -5 || m === -2) {
      cr({ descricao: "Parcela trimestral — Programa de Reabilitação", valorCents: 5250000, vencimento: noMes(m, 15), origem: "Convênio", pagador: "Governo do Estado do RS", verbaId: "vb2", apoiadorId: "ap2", recebidoEm: recebe(15) })
    }
  }
  cr({ descricao: "Emenda parlamentar — van e equipamentos", valorCents: 25000000, vencimento: noMes(-3, 2), origem: "Emenda parlamentar", pagador: "Fundo Nacional de Saúde", verbaId: "vb3", apoiadorId: "ap3", recebidoEm: noMes(-3, 2) })
  cr({ descricao: "Doação Rotary — Inverno Aquecido", valorCents: 1200000, vencimento: noMes(-3, 18), origem: "Doação", pagador: "Rotary Club de Esteio", verbaId: "vb4", apoiadorId: "ap5", recebidoEm: noMes(-3, 18) })
  cr({ descricao: "Galeto beneficente — ingressos", valorCents: 1860000, vencimento: noMes(-1, 26), origem: "Evento / campanha", pagador: "Venda de ingressos", recebidoEm: noMes(-1, 26), forma: "pix" })
  cr({ descricao: "Doação mensal — Supermercado Bom Preço", valorCents: 150000, vencimento: dia(4), origem: "Doação", pagador: "Supermercado Bom Preço", apoiadorId: "ap6" })
  cr({ descricao: "Bazar da APAE", valorCents: 320000, vencimento: dia(-2), origem: "Evento / campanha", pagador: "Vendas do bazar", forma: "dinheiro", observacoes: "Conferir o caixa do bazar." })

  // ---------- Estoque ----------
  const itensEstoque: ItemEstoque[] = [
    { id: "es1", nome: "Arroz tipo 1 (5 kg)", categoria: "Alimentos", unidade: "pct", quantidade: 18, minimo: 10, local: "Despensa" },
    { id: "es2", nome: "Feijão preto (1 kg)", categoria: "Alimentos", unidade: "pct", quantidade: 6, minimo: 12, local: "Despensa" },
    { id: "es3", nome: "Leite integral (1 L)", categoria: "Alimentos", unidade: "L", quantidade: 48, minimo: 36, local: "Despensa" },
    { id: "es4", nome: "Papel sulfite A4", categoria: "Material escolar", unidade: "resma", quantidade: 14, minimo: 8, local: "Almoxarifado" },
    { id: "es5", nome: "Massinha de modelar", categoria: "Material escolar", unidade: "cx", quantidade: 3, minimo: 10, local: "Almoxarifado" },
    { id: "es6", nome: "Fralda geriátrica G", categoria: "Higiene", unidade: "pct", quantidade: 22, minimo: 15, local: "Enfermaria" },
    { id: "es7", nome: "Luvas descartáveis", categoria: "Saúde", unidade: "cx", quantidade: 0, minimo: 5, local: "Enfermaria" },
    { id: "es8", nome: "Álcool 70%", categoria: "Saúde", unidade: "L", quantidade: 11, minimo: 6, local: "Enfermaria" },
    { id: "es9", nome: "Detergente neutro", categoria: "Limpeza", unidade: "un", quantidade: 30, minimo: 12, local: "Almoxarifado" },
    { id: "es10", nome: "Papel higiênico", categoria: "Higiene", unidade: "fardo", quantidade: 4, minimo: 4, local: "Almoxarifado" },
    { id: "es11", nome: "Tinta guache (kit 6 cores)", categoria: "Material escolar", unidade: "cx", quantidade: 16, minimo: 6, local: "Almoxarifado" },
    { id: "es12", nome: "Canetas esferográficas", categoria: "Escritório", unidade: "cx", quantidade: 9, minimo: 3, local: "Secretaria" },
  ]
  const movsEstoque: MovEstoque[] = [
    { id: "me1", itemId: "es1", tipo: "entrada", quantidade: 20, responsavel: "Juliana Prates", motivo: "Compra do mês", data: dia(-20) },
    { id: "me2", itemId: "es1", tipo: "saida", quantidade: 2, setor: "Cozinha", responsavel: "Dona Célia", motivo: "Almoço da semana", data: dia(-6) },
    { id: "me3", itemId: "es2", tipo: "saida", quantidade: 4, setor: "Cozinha", responsavel: "Dona Célia", motivo: "Almoço da semana", data: dia(-6) },
    { id: "me4", itemId: "es5", tipo: "saida", quantidade: 5, setor: "Pedagogia", responsavel: "Ana Souza", motivo: "Oficina de artes", data: dia(-4) },
    { id: "me5", itemId: "es7", tipo: "saida", quantidade: 3, setor: "Saúde e terapias", responsavel: "Paula Kern", motivo: "Atendimentos", data: dia(-2) },
    { id: "me6", itemId: "es4", tipo: "entrada", quantidade: 10, responsavel: "Juliana Prates", motivo: "Doação da Papelaria Central", data: dia(-12) },
    { id: "me7", itemId: "es4", tipo: "saida", quantidade: 3, setor: "Administrativo", responsavel: "Carlos Menezes", motivo: "Impressões da secretaria", data: dia(-1) },
    { id: "me8", itemId: "es3", tipo: "entrada", quantidade: 60, responsavel: "Juliana Prates", motivo: "Compra do mês", data: dia(-15) },
    { id: "me9", itemId: "es3", tipo: "saida", quantidade: 12, setor: "Cozinha", responsavel: "Dona Célia", motivo: "Lanches", data: dia(-3) },
  ]

  // ---------- Compras ----------
  const compras: Compra[] = [
    {
      id: "co1",
      codigo: "C-0014",
      solicitante: "funcionario",
      solicitanteNome: "Ana Souza",
      setor: "Pedagogia",
      itens: [
        { id: "i1", descricao: "Massinha de modelar", quantidade: 10, unidade: "cx", estimadoCents: 1890, destino: "estoque", itemEstoqueId: "es5" },
        { id: "i2", descricao: "Tesoura sem ponta", quantidade: 15, unidade: "un", estimadoCents: 690, destino: "consumo" },
      ],
      justificativa: "Oficina de artes das turmas da tarde; a massinha acabou no almoxarifado.",
      urgencia: "normal",
      status: "solicitada",
      criadoEm: instante(-1, 9, 40),
    },
    {
      id: "co2",
      codigo: "C-0012",
      solicitante: "financeiro",
      solicitanteNome: "Paula Kern (via Carlos)",
      setor: "Saúde e terapias",
      itens: [
        { id: "i1", descricao: "Bola suíça 65 cm", quantidade: 4, unidade: "un", estimadoCents: 18900, destino: "consumo" },
        { id: "i2", descricao: "Colchonete de EVA", quantidade: 8, unidade: "un", estimadoCents: 19500, destino: "consumo" },
      ],
      justificativa: "Reposição do material da sala de fisioterapia.",
      urgencia: "normal",
      status: "comprada",
      criadoEm: instante(-12, 14, 5),
      verbaId: "vb2",
      aprovadoPor: "Marta Ribeiro",
      aprovadoEm: instante(-11, 8, 30),
      compradoPor: "Juliana Prates",
      compradoEm: instante(-8, 16, 10),
      fornecedor: "Ortopédica Gaúcha",
      valorRealCents: 236000,
      vencimento: dia(5),
      forma: "boleto",
      contaPagarId: "",
    },
    {
      id: "co3",
      codigo: "C-0013",
      solicitante: "compras",
      solicitanteNome: "Dona Célia (via Juliana)",
      setor: "Cozinha",
      itens: [
        { id: "i1", descricao: "Feijão preto (1 kg)", quantidade: 30, unidade: "pct", estimadoCents: 780, destino: "estoque", itemEstoqueId: "es2" },
        { id: "i2", descricao: "Liquidificador industrial 4 L", quantidade: 1, unidade: "un", estimadoCents: 89000, destino: "patrimonio" },
      ],
      justificativa: "O feijão está abaixo do mínimo e o liquidificador antigo queimou.",
      urgencia: "alta",
      status: "aprovada",
      criadoEm: instante(-3, 11, 20),
      verbaId: "vb1",
      aprovadoPor: "Marta Ribeiro",
      aprovadoEm: instante(-2, 9, 0),
    },
    {
      id: "co4",
      codigo: "C-0011",
      solicitante: "funcionario",
      solicitanteNome: "Ana Souza",
      setor: "Pedagogia",
      itens: [{ id: "i1", descricao: "Tablet 10\" para comunicação alternativa", quantidade: 2, unidade: "un", estimadoCents: 159000, destino: "patrimonio" }],
      justificativa: "Pranchas de comunicação alternativa para dois alunos não verbais.",
      urgencia: "baixa",
      status: "recusada",
      criadoEm: instante(-18, 10, 0),
      aprovadoPor: "Marta Ribeiro",
      aprovadoEm: instante(-16, 15, 0),
      motivoRecusa: "Vamos buscar doação na campanha de fim de ano antes de comprar.",
    },
    {
      id: "co5",
      codigo: "C-0015",
      solicitante: "compras",
      solicitanteNome: "Juliana Prates",
      setor: "Saúde e terapias",
      itens: [{ id: "i1", descricao: "Luvas descartáveis (cx 100)", quantidade: 10, unidade: "cx", estimadoCents: 3290, destino: "estoque", itemEstoqueId: "es7" }],
      justificativa: "Estoque de luvas zerado na enfermaria.",
      urgencia: "alta",
      status: "solicitada",
      criadoEm: instante(0, 8, 15),
    },
  ]
  const contaDaCompra = contasPagar.find((c) => c.compraId === "co2")
  compras[1].contaPagarId = contaDaCompra?.id

  // ---------- Patrimônio ----------
  const bem = (b: Omit<Bem, "movimentacoes" | "descricao" | "notaFiscal"> & Partial<Pick<Bem, "movimentacoes" | "descricao" | "notaFiscal">>): Bem => ({
    movimentacoes: [],
    descricao: "",
    notaFiscal: "",
    ...b,
  })
  const bens: Bem[] = [
    bem({ id: "bm1", plaqueta: "APAE-0001", nome: "Van adaptada Renault Master", categoria: "Veículos", descricao: "16 lugares, elevador para cadeira de rodas. Placa IZX-4B21.", setor: "Transporte", responsavel: "Seu Valdir (motorista)", estado: "novo", valorCents: 19000000, aquisicao: noMes(-2, 3), origem: "verba", verbaId: "vb3", apoiadorId: "ap3", notaFiscal: "NF 18.442" }),
    bem({ id: "bm2", plaqueta: "APAE-0002", nome: "Barra paralela de fisioterapia", categoria: "Equipamentos terapêuticos", setor: "Saúde e terapias", responsavel: "Paula Kern", estado: "bom", valorCents: 420000, aquisicao: dia(-420), origem: "verba", verbaId: "vb2", apoiadorId: "ap2", notaFiscal: "NF 3.120" }),
    bem({ id: "bm3", plaqueta: "APAE-0003", nome: "Geladeira industrial 4 portas", categoria: "Cozinha", setor: "Cozinha", responsavel: "Dona Célia", estado: "regular", valorCents: 680000, aquisicao: dia(-1300), origem: "doacao", apoiadorId: "ap6" }),
    bem({ id: "bm4", plaqueta: "APAE-0004", nome: "Fogão industrial 6 bocas", categoria: "Cozinha", setor: "Cozinha", responsavel: "Dona Célia", estado: "bom", valorCents: 245000, aquisicao: dia(-900), origem: "compra", notaFiscal: "NF 7.785" }),
    bem({ id: "bm5", plaqueta: "APAE-0005", nome: "Notebook Dell Inspiron 15", categoria: "Informática", setor: "Administrativo", responsavel: "Carlos Menezes", estado: "bom", valorCents: 389000, aquisicao: dia(-500), origem: "compra", notaFiscal: "NF 22.019",
      movimentacoes: [{ id: "mv1", data: dia(-120), deSetor: "Direção", paraSetor: "Administrativo", deResponsavel: "Marta Ribeiro", paraResponsavel: "Carlos Menezes", motivo: "Troca do computador do financeiro", por: "Marta Ribeiro" }] }),
    bem({ id: "bm6", plaqueta: "APAE-0006", nome: "Projetor multimídia Epson", categoria: "Eletrônicos", setor: "Pedagogia", responsavel: "Ana Souza", estado: "bom", valorCents: 310000, aquisicao: dia(-700), origem: "doacao", apoiadorId: "ap5" }),
    bem({ id: "bm7", plaqueta: "APAE-0007", nome: "Cadeira de rodas adulto", categoria: "Equipamentos terapêuticos", setor: "Saúde e terapias", responsavel: "Paula Kern", estado: "ruim", valorCents: 129000, aquisicao: dia(-1600), origem: "doacao", apoiadorId: "ap7", descricao: "Pneu traseiro furado, freio solto." }),
    bem({ id: "bm8", plaqueta: "APAE-0008", nome: "Mesa escolar adaptada (regulável)", categoria: "Mobiliário", setor: "Pedagogia", responsavel: "Ana Souza", estado: "bom", valorCents: 98000, aquisicao: dia(-300), origem: "verba", verbaId: "vb1", apoiadorId: "ap1" }),
    bem({ id: "bm9", plaqueta: "APAE-0009", nome: "Aquecedor a óleo 1500 W", categoria: "Eletrônicos", setor: "Pedagogia", responsavel: "Ana Souza", estado: "novo", valorCents: 96000, aquisicao: noMes(-1, 11), origem: "verba", verbaId: "vb4", apoiadorId: "ap5" }),
    bem({ id: "bm10", plaqueta: "APAE-0010", nome: "Tatame EVA 1×1 m (kit 20)", categoria: "Esportes", setor: "Esportes", responsavel: "Rafael Lima", estado: "regular", valorCents: 184000, aquisicao: dia(-800), origem: "compra" }),
    bem({ id: "bm11", plaqueta: "APAE-0011", nome: "Computador de mesa — secretaria", categoria: "Informática", setor: "Administrativo", responsavel: "Carlos Menezes", estado: "regular", valorCents: 260000, aquisicao: dia(-1500), origem: "compra" }),
    bem({ id: "bm12", plaqueta: "APAE-0012", nome: "Balanço terapêutico (integração sensorial)", categoria: "Equipamentos terapêuticos", setor: "Saúde e terapias", responsavel: "Bruna Tavares", estado: "bom", valorCents: 215000, aquisicao: dia(-240), origem: "verba", verbaId: "vb2", apoiadorId: "ap2" }),
  ]

  // ---------- Prestadores ----------
  const prestadores: Prestador[] = [
    { id: "pr1", nome: "Letícia Moraes", area: "Fonoaudiologia", descricao: "Atendimento individual de fala e deglutição; avaliação de comunicação alternativa.", documento: "CRFa 7-12345", telefone: "(51) 99812-3344", email: "leticia.fono@gmail.com", tipo: "contrato", valorMensalCents: 380000, vigenciaInicio: `${ano}-03-01`, vigenciaFim: `${ano + 1}-02-28`, verbaId: "vb2", dias: [{ dia: 1, inicio: "08:00", fim: "12:00", setor: "Saúde e terapias" }, { dia: 3, inicio: "08:00", fim: "12:00", setor: "Saúde e terapias" }] },
    { id: "pr2", nome: "Paula Kern", area: "Fisioterapia", descricao: "Fisioterapia motora e respiratória; coordena a sala de reabilitação.", documento: "CREFITO 5-98765", telefone: "(51) 99655-1020", email: "paula.kern.fisio@gmail.com", tipo: "contrato", valorMensalCents: 450000, vigenciaInicio: `${ano}-03-01`, vigenciaFim: `${ano + 1}-02-28`, verbaId: "vb2", dias: [{ dia: 1, inicio: "13:00", fim: "17:30", setor: "Saúde e terapias" }, { dia: 2, inicio: "08:00", fim: "12:00", setor: "Saúde e terapias" }, { dia: 4, inicio: "08:00", fim: "17:00", setor: "Saúde e terapias" }] },
    { id: "pr3", nome: "Marcelo Duarte", area: "Psicologia", descricao: "Acompanhamento dos alunos e grupo de apoio às famílias.", documento: "CRP 07/33210", telefone: "(51) 98441-7788", email: "marcelo.psi@outlook.com", tipo: "cedido", valorMensalCents: 0, vigenciaInicio: `${ano}-01-01`, vigenciaFim: `${ano}-12-31`, dias: [{ dia: 2, inicio: "13:00", fim: "17:00", setor: "Saúde e terapias" }, { dia: 5, inicio: "08:00", fim: "12:00", setor: "Serviço social" }] },
    { id: "pr4", nome: "Bruna Tavares", area: "Terapia ocupacional", descricao: "Integração sensorial e atividades de vida diária.", documento: "CREFITO 5-44120-TO", telefone: "(51) 99230-5566", email: "bruna.to@gmail.com", tipo: "contrato", valorMensalCents: 320000, vigenciaInicio: `${ano}-04-01`, vigenciaFim: `${ano}-12-31`, verbaId: "vb2", dias: [{ dia: 3, inicio: "13:00", fim: "17:30", setor: "Saúde e terapias" }, { dia: 5, inicio: "13:00", fim: "17:30", setor: "Saúde e terapias" }] },
    { id: "pr5", nome: "Dr. Henrique Salles", area: "Neuropediatria", descricao: "Consultas mensais voluntárias e laudos para benefícios.", documento: "CRM-RS 28.114", telefone: "(51) 3473-2200", email: "consultorio@drhenrique.med.br", tipo: "voluntario", valorMensalCents: 0, vigenciaInicio: `${ano}-01-01`, vigenciaFim: `${ano}-12-31`, dias: [{ dia: 4, inicio: "14:00", fim: "17:00", setor: "Saúde e terapias" }] },
    { id: "pr6", nome: "Rafael Lima", area: "Educação física", descricao: "Atividades motoras, bocha adaptada e preparação para as Olimpíadas APAE.", documento: "CREF 018877-G/RS", telefone: "(51) 99103-4455", email: "rafa.edfisica@gmail.com", tipo: "cedido", valorMensalCents: 0, vigenciaInicio: `${ano}-02-01`, vigenciaFim: `${ano}-12-31`, dias: [{ dia: 2, inicio: "08:00", fim: "11:30", setor: "Esportes" }, { dia: 4, inicio: "08:00", fim: "11:30", setor: "Esportes" }] },
    { id: "pr7", nome: "Sofia Rangel", area: "Música", descricao: "Musicalização e coral da APAE.", documento: "CPF 012.345.678-90", telefone: "(51) 98877-6655", email: "sofia.musica@gmail.com", tipo: "voluntario", valorMensalCents: 0, vigenciaInicio: `${ano}-03-01`, vigenciaFim: `${ano}-12-15`, dias: [{ dia: 5, inicio: "09:00", fim: "11:00", setor: "Oficinas" }] },
    { id: "pr8", nome: "Escritório Contábil Sinos", area: "Contabilidade", descricao: "Contabilidade, folha e prestação de contas aos órgãos públicos.", documento: "CNPJ 12.345.678/0001-90", telefone: "(51) 3459-1122", email: "contato@contabilsinos.com.br", tipo: "contrato", valorMensalCents: 120000, vigenciaInicio: `${ano - 2}-01-01`, vigenciaFim: `${ano}-12-31`, dias: [] },
    { id: "pr9", nome: "Rogério Elétrica", area: "Manutenção elétrica", descricao: "Chamados de manutenção elétrica; orçamento por serviço.", documento: "CNPJ 33.221.110/0001-45", telefone: "(51) 99988-1234", email: "rogerio.eletrica@gmail.com", tipo: "contrato", valorMensalCents: 0, vigenciaInicio: `${ano}-01-01`, vigenciaFim: `${ano}-12-31`, dias: [] },
    { id: "pr10", nome: "Camila Rocha", area: "Nutrição", descricao: "Cardápio da cozinha e acompanhamento nutricional dos alunos.", documento: "CRN-2 11223", telefone: "(51) 99345-6677", email: "camila.nutri@gmail.com", tipo: "cedido", valorMensalCents: 0, vigenciaInicio: `${ano}-01-01`, vigenciaFim: `${ano}-12-31`, dias: [{ dia: 1, inicio: "09:00", fim: "11:00", setor: "Cozinha" }] },
  ]

  // ---------- Histórico e notificações iniciais ----------
  const auditoria: Auditoria[] = [
    { id: "au1", entidade: "compra", entidadeId: "co5", acao: "CREATE", rotulo: "C-0015 · Luvas descartáveis", usuario: "Juliana Prates", perfil: "compras", data: instante(0, 8, 15) },
    { id: "au2", entidade: "estoque", entidadeId: "es4", acao: "SAIDA", rotulo: "Papel sulfite A4 — 3 resma para Administrativo", usuario: "Carlos Menezes", perfil: "financeiro", data: instante(-1, 16, 20) },
    { id: "au3", entidade: "compra", entidadeId: "co1", acao: "CREATE", rotulo: "C-0014 · Massinha de modelar e mais 1", usuario: "Ana Souza", perfil: "funcionario", data: instante(-1, 9, 40) },
    { id: "au4", entidade: "compra", entidadeId: "co3", acao: "APROVAR", rotulo: "C-0013 · Feijão e liquidificador", usuario: "Marta Ribeiro", perfil: "admin", data: instante(-2, 9, 0) },
    { id: "au5", entidade: "estoque", entidadeId: "es7", acao: "SAIDA", rotulo: "Luvas descartáveis — 3 cx para Saúde e terapias", usuario: "Paula Kern", perfil: "compras", data: instante(-2, 14, 30) },
    { id: "au6", entidade: "compra", entidadeId: "co2", acao: "COMPRAR", rotulo: "C-0012 · Ortopédica Gaúcha — R$ 2.360,00", usuario: "Juliana Prates", perfil: "compras", data: instante(-8, 16, 10) },
  ]
  const notificacoes: Notificacao[] = [
    { id: "nt1", tom: "info", entidade: "compra", titulo: "Nova solicitação de compra", corpo: "C-0015 · Luvas descartáveis — Saúde e terapias (urgente)", href: "/painel/compras/co5", para: ["admin"], ator: "Juliana Prates", data: instante(0, 8, 15) },
    { id: "nt2", tom: "info", entidade: "compra", titulo: "Nova solicitação de compra", corpo: "C-0014 · Massinha de modelar e mais 1 — Pedagogia", href: "/painel/compras/co1", para: ["admin"], ator: "Ana Souza", data: instante(-1, 9, 40) },
    { id: "nt3", tom: "sucesso", entidade: "compra", titulo: "Compra aprovada — pode comprar", corpo: "C-0013 · Feijão e liquidificador (Cozinha)", href: "/painel/compras/co3", para: ["compras"], ator: "Marta Ribeiro", data: instante(-2, 9, 0) },
    { id: "nt4", tom: "perigo", entidade: "compra", titulo: "Sua solicitação foi recusada", corpo: "C-0011 · Tablet para comunicação alternativa", href: "/painel/compras/co4", para: ["funcionario"], ator: "Marta Ribeiro", data: instante(-16, 15, 0) },
    { id: "nt5", tom: "sucesso", entidade: "conta_pagar", titulo: "Compra virou conta a pagar", corpo: "C-0012 · Ortopédica Gaúcha — R$ 2.360,00", href: "/painel/compras/co2", para: ["financeiro"], ator: "Juliana Prates", data: instante(-8, 16, 10) },
  ]

  return {
    apoiadores,
    verbas,
    contasPagar,
    contasReceber,
    compras,
    itensEstoque,
    movsEstoque,
    bens,
    prestadores,
    auditoria,
    notificacoes,
    lidas: { admin: [], financeiro: ["nt5"], compras: [], funcionario: [] },
    seq: 1000,
  }
}
