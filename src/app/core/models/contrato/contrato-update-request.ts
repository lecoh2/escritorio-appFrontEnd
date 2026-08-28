export interface ContratoUpdateRequest {
  id: string;

  numero: string;

  pessoaId: string;

  dataInicio: Date;

  dataFim?: Date;

  status: number;

  processosIds: string[];

  observacao?: string;
}