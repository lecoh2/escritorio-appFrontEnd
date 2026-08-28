export interface ContratoRequest {

  numero: string;

  pessoaId: string;

  dataInicio: Date;

  dataFim?: Date;

  processosIds: string[];

  observacao?: string;
}