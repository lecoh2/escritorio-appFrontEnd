export interface ProcessoPublicacaoWebJurResponse {

  id: string;

  codPublicacao: number;

  numeroProcesso: string;

  dataPublicacao: Date;

  dataDivulgacao?: Date | null;

  dataCadastroWebJur?: Date | null;

  anoPublicacao: number;

  edicaoDiario: number;

  descricaoDiario?: string | null;

  paginaInicial: number;

  paginaFinal: number;

  ufPublicacao?: string | null;

  cidadePublicacao?: string | null;

  varaDescricao?: string | null;

  orgaoDescricao?: string | null;

  despachoPublicacao?: string | null;

  processoPublicacao?: string | null;

  publicacaoCorrigida: boolean;

  codVinculo: number;

  nomeVinculo?: string | null;

  oabNumero: number;

  oabEstado?: string | null;

  codIntegracao?: string | null;

  publicacaoExportada: boolean;

  codGrupo: number;
}