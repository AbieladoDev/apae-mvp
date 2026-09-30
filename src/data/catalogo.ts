import type {
  DestinoItem,
  EstadoBem,
  FormaPagamento,
  OrigemBem,
  Perfil,
  StatusCompra,
  TipoPrestador,
  TipoVerba,
  Urgencia,
  Usuario,
} from "./tipos"

/** Os quatro perfis da demo. O login escolhe um deles. */
export const USUARIOS: Record<Perfil, Usuario> = {
  admin: {
    perfil: "admin",
    nome: "Marta Ribeiro",
    cargo: "Direção",
    email: "direcao@apaeesteio.org.br",
    setor: "Direção",
  },
  financeiro: {
    perfil: "financeiro",
    nome: "Carlos Menezes",
    cargo: "Financeiro",
    email: "financeiro@apaeesteio.org.br",
    setor: "Administrativo",
  },
  compras: {
    perfil: "compras",
    nome: "Juliana Prates",
    cargo: "Compras e almoxarifado",
    email: "compras@apaeesteio.org.br",
    setor: "Administrativo",
  },
  funcionario: {
    perfil: "funcionario",
    nome: "Ana Souza",
    cargo: "Professora — Pedagogia",
    email: "ana.souza@apaeesteio.org.br",
    setor: "Pedagogia",
  },
}

export const PERFIL_LABEL: Record<Perfil, string> = {
  admin: "Direção",
  financeiro: "Financeiro",
  compras: "Compras",
  funcionario: "Funcionário",
}

export const SETORES = [
  "Direção",
  "Administrativo",
  "Pedagogia",
  "Saúde e terapias",
  "Serviço social",
  "Cozinha",
  "Limpeza",
  "Transporte",
  "Oficinas",
  "Esportes",
] as const

export const CATEGORIAS_DESPESA = [
  "Alimentação",
  "Material pedagógico",
  "Saúde e terapias",
  "Manutenção",
  "Transporte",
  "Prestadores de serviço",
  "Água, luz e telefone",
  "Limpeza e higiene",
  "Equipamentos",
  "Outros",
] as const

/** Cor de cada categoria nos gráficos e bolinhas. Classes literais: o Tailwind lê o arquivo. */
export const COR_CATEGORIA: Record<string, { dot: string; hex: string }> = {
  "Alimentação": { dot: "bg-orange-500", hex: "#f97316" },
  "Material pedagógico": { dot: "bg-sky-500", hex: "#0ea5e9" },
  "Saúde e terapias": { dot: "bg-rose-500", hex: "#f43f5e" },
  "Manutenção": { dot: "bg-amber-500", hex: "#f59e0b" },
  "Transporte": { dot: "bg-indigo-500", hex: "#6366f1" },
  "Prestadores de serviço": { dot: "bg-pink-500", hex: "#ec4899" },
  "Água, luz e telefone": { dot: "bg-cyan-500", hex: "#06b6d4" },
  "Limpeza e higiene": { dot: "bg-teal-500", hex: "#14b8a6" },
  "Equipamentos": { dot: "bg-violet-500", hex: "#8b5cf6" },
  "Outros": { dot: "bg-slate-400", hex: "#94a3b8" },
}

export const ORIGENS_RECEITA = [
  "Convênio",
  "Emenda parlamentar",
  "Doação",
  "Nota Fiscal Gaúcha",
  "Evento / campanha",
  "Contribuição de sócios",
  "Outros",
] as const

export const COR_ORIGEM: Record<string, string> = {
  "Convênio": "#2563eb",
  "Emenda parlamentar": "#7c3aed",
  "Doação": "#16a34a",
  "Nota Fiscal Gaúcha": "#0891b2",
  "Evento / campanha": "#f59e0b",
  "Contribuição de sócios": "#db2777",
  "Outros": "#94a3b8",
}

export const TIPO_VERBA_LABEL: Record<TipoVerba, string> = {
  convenio: "Convênio",
  emenda: "Emenda parlamentar",
  doacao: "Doação",
  campanha: "Campanha",
  programa: "Programa",
}

export const FORMA_LABEL: Record<FormaPagamento, string> = {
  pix: "Pix",
  boleto: "Boleto",
  transferencia: "Transferência",
  cartao: "Cartão",
  dinheiro: "Dinheiro",
}

export const STATUS_COMPRA_LABEL: Record<StatusCompra, string> = {
  solicitada: "Aguardando aprovação",
  aprovada: "Aprovada — a comprar",
  recusada: "Recusada",
  comprada: "Comprada",
  cancelada: "Cancelada",
}

export const URGENCIA_LABEL: Record<Urgencia, string> = {
  baixa: "Pode esperar",
  normal: "Normal",
  alta: "Urgente",
}

export const DESTINO_LABEL: Record<DestinoItem, string> = {
  consumo: "Uso imediato",
  estoque: "Vai para o estoque",
  patrimonio: "Vira patrimônio",
}

export const CATEGORIAS_ESTOQUE = [
  "Alimentos",
  "Higiene",
  "Limpeza",
  "Material escolar",
  "Saúde",
  "Escritório",
] as const

export const UNIDADES = ["un", "cx", "pct", "kg", "L", "fardo", "resma", "par"] as const

export const CATEGORIAS_BEM = [
  "Veículos",
  "Informática",
  "Mobiliário",
  "Equipamentos terapêuticos",
  "Cozinha",
  "Eletrônicos",
  "Esportes",
] as const

export const ESTADO_BEM_LABEL: Record<EstadoBem, string> = {
  novo: "Novo",
  bom: "Bom",
  regular: "Regular",
  ruim: "Precisa de reparo",
}

export const ORIGEM_BEM_LABEL: Record<OrigemBem, string> = {
  compra: "Compra",
  doacao: "Doação",
  verba: "Adquirido com verba",
}

export const TIPO_PRESTADOR_LABEL: Record<TipoPrestador, string> = {
  contrato: "Contratado",
  voluntario: "Voluntário",
  cedido: "Cedido pela prefeitura",
}

export const AREAS_PRESTADOR = [
  "Fonoaudiologia",
  "Fisioterapia",
  "Psicologia",
  "Terapia ocupacional",
  "Neuropediatria",
  "Nutrição",
  "Educação física",
  "Música",
  "Contabilidade",
  "Manutenção elétrica",
  "Manutenção predial",
] as const

export const DIAS_SEMANA = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"]
export const DIAS_SEMANA_LONGO = [
  "Domingo",
  "Segunda",
  "Terça",
  "Quarta",
  "Quinta",
  "Sexta",
  "Sábado",
]
