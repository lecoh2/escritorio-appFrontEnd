export interface EscritorioPaginacaoResponse {
  id: string;
  nome: string;
  documento: string;
  dataCadastro?: string;

  quantidadeUsuarios: number;
  quantidadeLicencas: number;
}