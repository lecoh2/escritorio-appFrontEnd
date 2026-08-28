import {
  HttpClient,
  HttpHeaders
} from '@angular/common/http';

import {
  inject,
  Injectable
} from '@angular/core';

import {
  Observable
} from 'rxjs';

import {
  environment
} from '../../../environments/environment.development';

import {
  CriarComentarioRequest
} from '../models/comentario/criar-comentario-request';

import {
  CriarComentarioResponse
} from '../models/comentario/criar-comentario-response';

import {
  ApiResponse
} from '../models/respostas/api-response';


@Injectable({
  providedIn: 'root'
})
export class ComentarioService {

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

    let headers =
      new HttpHeaders();

    if (token) {

      headers =
        headers.set(
          'Authorization',
          `Bearer ${token}`
        );
    }

    return headers;
  }


  // =====================================================
  // CRIAR COMENTÁRIO
  // =====================================================

  criarComentario(
    request: CriarComentarioRequest
  ): Observable<ApiResponse<CriarComentarioResponse>> {

    return this.http.post<
      ApiResponse<CriarComentarioResponse>
    >(
      `${this.url}/api/v1/comentarios/cadastar-comentario`,
      request,
      {
        headers:
          this.getHeaders()
      }
    );
  }


  // =====================================================
  // CONSULTAR COMENTÁRIOS
  // =====================================================

  obterComentario(
    params: any
  ): Observable<CriarComentarioResponse[]> {

    return this.http.get<
      CriarComentarioResponse[]
    >(
      `${this.url}/api/v1/comentarios/consultar-comentarios`,
      {
        params,
        headers:
          this.getHeaders()
      }
    );
  }
}