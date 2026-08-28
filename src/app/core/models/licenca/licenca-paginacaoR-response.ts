import { StatusLicencaEnum } from "../enums/licenca/status-licenca-enum";
import { TipoPlanoEnum } from "../enums/plano/tipo-plano-rnum";

export interface LicencaPaginacaoResponse {
  id: string;

  escritorioId: string;
  nomeEscritorio: string;
  documentoEscritorio: string;

  chave: string;

  dataInicio: string;
  dataVencimento: string;

  status: StatusLicencaEnum;
  tipoPlano: TipoPlanoEnum;

  limiteUsuarios: number;
  quantidadeUsuarios: number;

  diasRestantes: number;
}