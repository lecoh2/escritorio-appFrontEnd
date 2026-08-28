import { EstadoCivilEnum } from "../enums/estado-civil/EstadoCivilEnum";

export interface InformacoesComplementaresRequest {
  // Pessoa física
  dataNascimento?: string;
  nomeEmpresa?: string;
  profissao?: string;
  atividadeEconomica?: string;
  estadoCivil?: EstadoCivilEnum;
  nomePai?: string;
  nomeMae?: string;
  naturalidade?: string;
  nacionalidade?: string;

  // Pessoa jurídica
  contato?: string;
  cargo?: string;

  // Comuns
  codigo?: string;
    ufNaturalidade?: string;
  paisNaturalidade?: string;
  comentario?: string;
}