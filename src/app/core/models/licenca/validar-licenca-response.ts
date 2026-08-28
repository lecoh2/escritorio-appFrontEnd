import { StatusLicencaEnum } from "../enums/licenca/status-licenca-enum";
import { TipoPlanoEnum } from "../enums/plano/tipo-plano-rnum";


export interface ValidarLicencaResponse {
  valida: boolean;
  expirada?: boolean;
  mensagem: string;

  licencaId?: string;
  dataVencimento?: string;
  diasRestantes?: number;

  limiteUsuarios?: number;
  quantidadeUsuarios?: number;
  limiteUsuariosAtingido?: boolean;

  tipoPlano?: TipoPlanoEnum;
  status?: StatusLicencaEnum;
}