export interface ContaPagarBaixaRequest {
  valorPago: number;

  dataBaixa: Date;

  formaRecebimento: number;

  contaBancariaEmpresaId?: string;

  observacao?: string;
}