export interface InformacoesComplementaresJuridicaRequest {
  codigo?: string | null;
  comentario?: string | null;
  contato?: string | null;
  cargo?: string | null;
  atividadeEconomica?: string;
  nomeBanco?: string | null;
  agencia?: string | null;
  numeroConta?: string | null;
  pix?: string | null;
  tipoConta?: number | null;
}