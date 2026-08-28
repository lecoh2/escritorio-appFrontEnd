export interface NivelUsuario {
  id: string;
  nomeNivel: string;
}

export interface AutenticarUsuarioResponse {
  idUsuario: string;
  login: string;
  nomeUsuario: string;

  nivel: NivelUsuario[];

  dataHoraAcesso: string;
  accessToken: string;
  dataHoraExpiracao: string;

  foto: string;
  ipAcesso: string;

  escritorioId?: string;
  escritorioNome?: string;
}