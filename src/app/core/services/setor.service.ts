import { inject, Injectable } from '@angular/core';
import {
  HttpClient,
  HttpHeaders
} from '@angular/common/http';
import { Observable } from 'rxjs';

import { environment } from '../../../environments/environment.development';

import { ConsultarSetoresResponse } from '../models/setores/consultar-setores-response';

@Injectable({
  providedIn: 'root'
})
export class SetorService {

  private http = inject(HttpClient);
  private url = environment.apiDeslandes;


  // =====================================================
  // HEADERS
  // =====================================================

  private getHeaders(): HttpHeaders {

    const token = localStorage.getItem('token');

    return new HttpHeaders(
      token
        ? {
            Authorization: `Bearer ${token}`
          }
        : {}
    );
  }


  // =====================================================
  // BUSCAR SETOR POR NOME
  // =====================================================

  buscarPorNomeSetor(
    nome: string
  ): Observable<ConsultarSetoresResponse[]> {

    return this.http.get<ConsultarSetoresResponse[]>(
      `${this.url}/api/v1/setor/consultar-setores-por-nome/${encodeURIComponent(nome)}`,
      {
        headers: this.getHeaders()
      }
    );
  }


  // =====================================================
  // CONSULTAR SETORES
  // =====================================================

  consultarSetores():
    Observable<ConsultarSetoresResponse[]> {

    return this.http.get<ConsultarSetoresResponse[]>(
      `${this.url}/api/setores/consultar-setores`,
      {
        headers: this.getHeaders()
      }
    );
  }


  // =====================================================
  // REMOVER SETOR DO USUÁRIO
  // =====================================================

  removerUsuarioSetor(
    idUsuario: string,
    idSetor: string
  ): Observable<{ mensagem: string }> {

    return this.http.delete<{ mensagem: string }>(
      `${this.url}/api/setores/remover-grupo-setor/${idUsuario}/${idSetor}`,
      {
        headers: this.getHeaders()
      }
    );
  }


  // =====================================================
  // ADICIONAR SETOR AO USUÁRIO
  // =====================================================

  adicionarUsuarioSetor(
    idUsuario: string,
    idSetor: string
  ): Observable<{ mensagem: string }> {

    return this.http.post<{ mensagem: string }>(
      `${this.url}/api/setores/adicionar-grupo-setor/${idUsuario}/${idSetor}`,
      null,
      {
        headers: this.getHeaders()
      }
    );
  }
}