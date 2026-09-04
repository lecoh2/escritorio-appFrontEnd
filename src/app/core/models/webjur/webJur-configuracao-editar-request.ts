// webjur-configuracao-editar-request.ts

export interface WebJurConfiguracaoEditarRequest {

  usuario: string;

  senha?: string | null;

  codGrupo: number;

  oab?: string | null;

  uf?: string | null;

  ativo: boolean;

  sincronizacaoAutomatica: boolean;
}