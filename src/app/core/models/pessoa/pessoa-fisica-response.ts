import { ContaBancariaResponse } from '../conta-bancaria/conta-bancaria-response';
import { EnderecoResponse } from '../endereco/endereco-response';
import { InformacoesComplementaresRequest } from
  '../informacoes-complementares/informacoes-complementares-request';

export interface PessoaFisicaResponse {
  id: string;

  nome?: string | null;
  apelido?: string | null;
  telefone?: string | null;
  email?: string | null;
  site?: string | null;

  idPerfil?: number | null;
  idEtiqueta?: number | null;

  rg?: string | null;
  cpf?: string | null;
  tituloEleitor?: string | null;
  carteiraTrabalho?: string | null;
  pisPasep?: string | null;
  cnh?: string | null;
  passaporte?: string | null;
  certidaoReservista?: string | null;

  endereco?: EnderecoResponse | null;

  informacoesComplementares?:
    InformacoesComplementaresRequest | null;
      contaBancaria?: ContaBancariaResponse | null;
}