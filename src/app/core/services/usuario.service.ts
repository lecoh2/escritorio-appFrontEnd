import {
  HttpClient,
  HttpHeaders
} from '@angular/common/http';

import {
  inject,
  Injectable
} from '@angular/core';

import { Observable } from 'rxjs';

import { environment } from '../../../environments/environment.development';

import { AutenticarUsuarioRequest } from '../models/usuario/autenticar-usuario.request';

import { CriarUsuarioRequest } from '../models/usuario/criar-usuario.request';
import { CriarUsuarioResponse } from '../models/usuario/criar-usuario.response';

import { ConsultarUsuarioResponse } from '../models/usuario/consultar-usuarios.response';

import { EditarUsuarioRequest } from '../models/usuario/editar-usuario-request';
import { EditarUsuarioResponse } from '../models/usuario/editar-usuario-response';

import { ApiResponse } from '../models/respostas/api-response';

import { PerfilUsuarioResponse } from '../models/perfil/perfil-usuario-response';


@Injectable({
  providedIn: 'root'
})
export class UsuarioService {

  // =====================================================
  // ATRIBUTOS
  // =====================================================

  private url =
    environment.apiDeslandes;

  private http =
    inject(HttpClient);


  // =====================================================
  // HEADERS
  // =====================================================

  private getHeaders(): HttpHeaders {

    const token =
      localStorage.getItem('token');

    return new HttpHeaders(
      token
        ? {
            Authorization:
              `Bearer ${token}`
          }
        : {}
    );
  }


  // =====================================================
  // AUTENTICAR
  // NÃO ENVIA TOKEN
  // =====================================================

  autenticar(
    request: AutenticarUsuarioRequest
  ): Observable<any> {

    return this.http.post<any>(
      `${this.url}/api/v1/usuarios/autenticar-usuario`,
      request
    );
  }


  // =====================================================
  // CADASTRAR USUÁRIO
  // =====================================================

  cadastrar(
    request: CriarUsuarioRequest
  ): Observable<CriarUsuarioResponse> {

    return this.http.post<CriarUsuarioResponse>(
      `${this.url}/api/v1/usuarios/cadastrar-usuario`,
      request,
      {
        headers: this.getHeaders()
      }
    );
  }


  // =====================================================
  // CONSULTAR RESPONSÁVEIS
  // =====================================================

  consultarUsuarioResponsavel():
    Observable<ConsultarUsuarioResponse[]> {

    return this.http.get<ConsultarUsuarioResponse[]>(
      `${this.url}/api/v1/usuarios/consultar-usuario-responsavel`,
      {
        headers: this.getHeaders()
      }
    );
  }


  // =====================================================
  // CONSULTAR USUÁRIOS PAGINADO
  // =====================================================

  consultarUsuariosPaginado(
    pageNumber: number,
    pageSize: number,
    searchTerm?: string
  ): Observable<any> {

    const params: any = {
      pageNumber:
        pageNumber.toString(),

      pageSize:
        pageSize.toString()
    };

    if (searchTerm) {
      params.searchTerm =
        searchTerm;
    }

    return this.http.get<any>(
      `${this.url}/api/v1/usuarios/consultar-usuarios-paginacao`,
      {
        params,
        headers: this.getHeaders()
      }
    );
  }


  // =====================================================
  // CONSULTAR USUÁRIO POR ID
  // =====================================================

  consultarUsuarioPorId(
    id: string
  ): Observable<ConsultarUsuarioResponse[]> {

    return this.http.get<ConsultarUsuarioResponse[]>(
      `${this.url}/api/v1/usuarios/consultar-usuarios-por-id/${id}`,
      {
        headers: this.getHeaders()
      }
    );
  }


  // =====================================================
  // CONSULTAR PERFIL DO USUÁRIO
  // =====================================================

  consultarPerfilUsuarioPorId(
    id: string
  ): Observable<PerfilUsuarioResponse> {

    return this.http.get<PerfilUsuarioResponse>(
      `${this.url}/api/v1/usuarios/consultar-usuarios-por-id-perfil/${id}`,
      {
        headers: this.getHeaders()
      }
    );
  }


  // =====================================================
  // EDITAR USUÁRIO
  // =====================================================

  editarPorId(
    dto: EditarUsuarioRequest
  ): Observable<
    ApiResponse<EditarUsuarioResponse>
  > {

    return this.http.put<
      ApiResponse<EditarUsuarioResponse>
    >(
      `${this.url}/api/v1/usuarios/atualizar-usuario/${dto.id}`,
      dto,
      {
        headers: this.getHeaders()
      }
    );
  }


  // =====================================================
  // DESBLOQUEAR USUÁRIO
  // =====================================================

  desbloquearUsuarioPorId(
    id: string
  ): Observable<void> {

    return this.http.put<void>(
      `${this.url}/api/v1/usuarios/desbloquear-usuario/${id}`,
      null,
      {
        headers: this.getHeaders()
      }
    );
  }


  // =====================================================
  // REMOVER NÍVEL DO USUÁRIO
  // =====================================================

  removerUsuarioNivel(
    idUsuario: string,
    idNivel: string
  ): Observable<any> {

    return this.http.delete<any>(
      `${this.url}/api/nivel/remover-grupo-nivel/${idUsuario}/${idNivel}`,
      {
        headers: this.getHeaders()
      }
    );
  }


  // =====================================================
  // ADICIONAR NÍVEL AO USUÁRIO
  // =====================================================

  adicionarUsuarioNivel(
    idUsuario: string,
    idNivel: string
  ): Observable<any> {

    return this.http.post<any>(
      `${this.url}/api/nivel/adicionar-grupo-nivel/${idUsuario}/${idNivel}`,
      null,
      {
        headers: this.getHeaders()
      }
    );
  }


  // =====================================================
  // UPLOAD DE FOTO
  // =====================================================

  uploadFoto(
    formData: FormData
  ): Observable<{ fileUrl: string }> {

    return this.http.post<{
      fileUrl: string
    }>(
      `${this.url}/api/fotos/upload`,
      formData,
      {
        headers: this.getHeaders()
      }
    );
  }


  // =====================================================
  // CADASTRAR / ATUALIZAR FOTO
  // =====================================================

  cadastrarFoto(
    id: string,
    file: File
  ): Observable<any> {

    const formData =
      new FormData();

    formData.append(
      'id',
      id
    );

    formData.append(
      'Foto',
      file.name
    );

    formData.append(
      'file',
      file
    );

    return this.http.post<any>(
      `${this.url}/api/v1/foto/cadastrar-ou-atualizar`,
      formData,
      {
        headers: this.getHeaders()
      }
    );
  }
// =====================================================
// LOGOUT
// =====================================================

logout(): Observable<any> {

  return this.http.post<any>(
    `${this.url}/api/v1/usuarios/logout`,
    {},
    {
      headers: this.getHeaders()
    }
  );

}
}