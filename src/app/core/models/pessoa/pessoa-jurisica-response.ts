import { ContaBancariaResponse } from '../conta-bancaria/conta-bancaria-response';
import { EnderecoResponse } from '../endereco/endereco-response';
import { InformacoesComplementaresJuridicaRequest } from
  '../informacoes-complementares/informacoes-complementares-juridica-request';

export interface PessoaJuridicaResponse {
  id: string;

  nome?: string | null;
  apelido?: string | null;
  telefone?: string | null;
  email?: string | null;
  site?: string | null;

  cnpj?: string | null;
  inscricaoEstadual?: string | null;
  inscricaoMunicipal?: string | null;
  simplesNacional?: number | null;
  atividadeEconomica?: string | null,

  endereco?: EnderecoResponse | null;

  informacoesComplementares?:
    InformacoesComplementaresJuridicaRequest | null;
    contaBancaria?: ContaBancariaResponse | null;
}