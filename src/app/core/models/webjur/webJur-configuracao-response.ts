// webjur-configuracao-response.ts

export interface WebJurConfiguracaoResponse {

  id: string;

  usuario: string;

  codGrupo: number;

  oab?: string | null;

  uf?: string | null;

  ativo: boolean;

  sincronizacaoAutomatica: boolean;

  senhaConfigurada: boolean;

  ultimaSincronizacao?: string | null;

  ultimaSincronizacaoSucesso?: string | null;

  ultimoErro?: string | null;
}