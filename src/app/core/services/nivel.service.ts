import { inject, Injectable } from '@angular/core';
import {
  HttpClient,
  HttpHeaders
} from '@angular/common/http';
import { Observable } from 'rxjs';

import { environment } from '../../../environments/environment.development';

import { ConsultarNiveisResponse } from '../models/nivel/consultar-niveis-response';

@Injectable({
  providedIn: 'root'
})
export class NivelService {

  private url = environment.apiDeslandes;
  private http = inject(HttpClient);


  // =====================================================
  // HEADERS
  // =====================================================

  private getHeaders(): HttpHeaders {

    const token =
      localStorage.getItem('token');

    return new HttpHeaders(
      token
        ? {
            Authorization: `Bearer ${token}`
          }
        : {}
    );
  }


  // =====================================================
  // BUSCAR NÍVEL POR NOME
  // =====================================================

  buscarPorNomeNivel(
    nome: string
  ): Observable<ConsultarNiveisResponse[]> {

    return this.http.get<ConsultarNiveisResponse[]>(
      `${this.url}/api/v1/nivel/consultar-nivel-por-nome/${encodeURIComponent(nome)}`,
      {
        headers: this.getHeaders()
      }
    );
  }


  // =====================================================
  // CONSULTAR NÍVEIS
  // =====================================================

  ConsultarNivel(): Observable<ConsultarNiveisResponse[]> {

    return this.http.get<ConsultarNiveisResponse[]>(
      `${this.url}/api/nivel/consultar-nivel`,
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
}