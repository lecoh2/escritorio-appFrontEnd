// webjur-configuracao-request.ts

export interface WebJurConfiguracaoRequest {

  usuario: string;

  senha: string;

  codGrupo: number;

  oab?: string | null;

  uf?: string | null;

  sincronizacaoAutomatica: boolean;
}