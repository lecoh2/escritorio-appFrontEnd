export interface ContaPagarUpdateRequest {
  descricao: string;
  valor: number;
  dataVencimento: Date;

  pessoaId: string;

  categoriaFinanceiraId?: string | null;
  centroCustoId?: string | null;
  contratoId?: string | null;
}