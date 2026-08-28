import { ContaBancariaRequest } from '../conta-bancaria/conta-bancaria-request';
import { EnderecoRequest } from '../endereco/endereco-request';
import { InformacoesComplementaresJuridicaRequest } from
  '../informacoes-complementares/informacoes-complementares-juridica-request';
export interface PessoaJuridicaUpdateRequest {
  nome?: string;
  apelido?: string;
  telefone?: string;
  email?: string;
  site?: string;

  cnpj?: string;
  inscricaoEstadual?: string;
  inscricaoMunicipal?: string;
  simplesNacional?: number;
atividadeEconomica?: string;
  idUsuario?: string;
  observacoes?: string;

  endereco?: EnderecoRequest;
   informacoesComplementares?:
    InformacoesComplementaresJuridicaRequest | null;
    contaBancaria?: ContaBancariaRequest;
}