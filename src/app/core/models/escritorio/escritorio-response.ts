export interface EscritorioResponse {
  id: string;
  nome: string;
  documento: string;

  quantidadeUsuarios?: number;
  quantidadeLicencas?: number;

  dataCadastro?: string;
  dataAtualizacao?: string;
}