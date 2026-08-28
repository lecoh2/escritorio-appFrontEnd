import { TipoPlanoEnum } from "../enums/plano/tipo-plano-rnum";


export interface LicencaRequest {
  escritorioId: string;
  dataInicio: string;
  dataVencimento: string;
  tipoPlano: TipoPlanoEnum;
  limiteUsuarios: number;
}