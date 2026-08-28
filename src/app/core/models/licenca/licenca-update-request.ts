import { StatusLicencaEnum } from "../enums/licenca/status-licenca-enum";
import { TipoPlanoEnum } from "../enums/plano/tipo-plano-rnum";


export interface LicencaUpdateRequest {
  escritorioId: string;
  dataInicio: string;
  dataVencimento: string;
  status: StatusLicencaEnum;
  tipoPlano: TipoPlanoEnum;
  limiteUsuarios: number;
}