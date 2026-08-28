export interface RenovarLicencaRequest {
  licencaId: string;
  novaDataVencimento: string;
  novoLimiteUsuarios?: number;
}