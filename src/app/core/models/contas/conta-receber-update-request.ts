export interface ContaReceberUpdateRequest {
  descricao?: string;

  valor?: number;

  dataVencimento?: Date;

  pessoaId?: string;

  contratoId?: string | null;

  categoriaFinanceiraId?: string | null;

  centroCustoId?: string | null;

  tipoConta?: number;

  formaRecebimento?: number;
}