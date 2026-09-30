/**
 * Tipos do domínio do MVP. Tudo vive no `demo-store` (zustand + localStorage);
 * não existe API. Dinheiro em CENTAVOS, datas `YYYY-MM-DD` (string), e
 * instantes (auditoria, notificação) em ISO completo.
 */

export type Perfil = "admin" | "financeiro" | "compras" | "funcionario"

export interface Usuario {
  perfil: Perfil
  nome: string
  cargo: string
  email: string
  setor: string
}

export interface Apoiador {
  id: string
  nome: string
  criadoEm: string
}

export type TipoVerba = "convenio" | "emenda" | "doacao" | "campanha" | "programa"

export interface Verba {
  id: string
  nome: string
  descricao: string
  apoiadorId: string
  tipo: TipoVerba
  valorCents: number
  inicio: string
  fim: string
}

export type FormaPagamento = "pix" | "boleto" | "transferencia" | "cartao" | "dinheiro"

export interface ContaPagar {
  id: string
  descricao: string
  valorCents: number
  vencimento: string
  categoria: string
  fornecedor: string
  prestadorId?: string
  usaVerba: boolean
  verbaId?: string
  pagoEm?: string
  forma?: FormaPagamento
  compraId?: string
  observacoes: string
  criadoEm: string
}

export interface ContaReceber {
  id: string
  descricao: string
  valorCents: number
  vencimento: string
  origem: string
  pagador: string
  usaVerba: boolean
  verbaId?: string
  apoiadorId?: string
  recebidoEm?: string
  forma?: FormaPagamento
  observacoes: string
  criadoEm: string
}

export type StatusCompra = "solicitada" | "aprovada" | "recusada" | "comprada" | "cancelada"
export type DestinoItem = "consumo" | "estoque" | "patrimonio"
export type Urgencia = "baixa" | "normal" | "alta"

export interface ItemCompra {
  id: string
  descricao: string
  quantidade: number
  unidade: string
  estimadoCents: number
  destino: DestinoItem
  itemEstoqueId?: string
  bemId?: string
}

export interface Compra {
  id: string
  codigo: string
  solicitante: Perfil
  solicitanteNome: string
  setor: string
  itens: ItemCompra[]
  justificativa: string
  urgencia: Urgencia
  status: StatusCompra
  criadoEm: string
  verbaId?: string
  aprovadoPor?: string
  aprovadoEm?: string
  motivoRecusa?: string
  compradoPor?: string
  compradoEm?: string
  fornecedor?: string
  valorRealCents?: number
  vencimento?: string
  forma?: FormaPagamento
  contaPagarId?: string
}

export interface ItemEstoque {
  id: string
  nome: string
  categoria: string
  unidade: string
  quantidade: number
  minimo: number
  local: string
}

export interface MovEstoque {
  id: string
  itemId: string
  tipo: "entrada" | "saida"
  quantidade: number
  setor?: string
  responsavel: string
  motivo: string
  compraId?: string
  data: string
}

export type EstadoBem = "novo" | "bom" | "regular" | "ruim"
export type OrigemBem = "compra" | "doacao" | "verba"

export interface MovBem {
  id: string
  data: string
  deSetor: string
  paraSetor: string
  deResponsavel: string
  paraResponsavel: string
  motivo: string
  por: string
}

export interface Bem {
  id: string
  plaqueta: string
  nome: string
  categoria: string
  descricao: string
  setor: string
  responsavel: string
  estado: EstadoBem
  valorCents: number
  aquisicao: string
  origem: OrigemBem
  verbaId?: string
  apoiadorId?: string
  compraId?: string
  notaFiscal: string
  movimentacoes: MovBem[]
}

export type TipoPrestador = "contrato" | "voluntario" | "cedido"

export interface DiaNaCasa {
  dia: number // 0 domingo … 6 sábado
  inicio: string // "08:00"
  fim: string
  setor: string
}

export interface Prestador {
  id: string
  nome: string
  area: string
  descricao: string
  documento: string
  telefone: string
  email: string
  tipo: TipoPrestador
  valorMensalCents: number
  vigenciaInicio: string
  vigenciaFim: string
  verbaId?: string
  dias: DiaNaCasa[]
}

export type Entidade =
  | "conta_pagar"
  | "conta_receber"
  | "verba"
  | "apoiador"
  | "compra"
  | "estoque"
  | "bem"
  | "prestador"

export type AcaoAuditoria =
  | "CREATE"
  | "UPDATE"
  | "DELETE"
  | "APROVAR"
  | "RECUSAR"
  | "COMPRAR"
  | "CANCELAR"
  | "PAGAR"
  | "RECEBER"
  | "ENTRADA"
  | "SAIDA"
  | "TRANSFERIR"

export interface Mudanca {
  campo: string
  de: string
  para: string
}

export interface Auditoria {
  id: string
  entidade: Entidade
  entidadeId: string
  acao: AcaoAuditoria
  rotulo: string
  mudancas?: Mudanca[]
  usuario: string
  perfil: Perfil
  data: string
}

export type TomNotificacao = "info" | "sucesso" | "alerta" | "perigo"

export interface Notificacao {
  id: string
  tom: TomNotificacao
  entidade: Entidade
  titulo: string
  corpo: string
  href: string
  para: Perfil[]
  ator?: string
  data: string
}
