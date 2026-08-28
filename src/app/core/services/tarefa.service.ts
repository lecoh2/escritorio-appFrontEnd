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
  ApiResponse
} from '../models/respostas/api-response';

import {
  CadastrarTarefaRequest
} from '../models/tarefa/cadastrar-tarefa.resquest';

import {
  CadastrarTareResponse
} from '../models/tarefa/cadastrar-tarefa-response';

import {
  ListaTarefasResponse
} from '../models/tarefa/lista-tarefas-response';

import {
  ObterTarefaResponse
} from '../models/tarefa/obter-tarefa-response';


@Injectable({
  providedIn: 'root'
})
export class TarefaService {

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
  // CADASTRAR
  // =====================================================

  cadastrarTarefa(
    request: CadastrarTarefaRequest
  ): Observable<ApiResponse<CadastrarTareResponse>> {

    return this.http.post<
      ApiResponse<CadastrarTareResponse>
    >(
      `${this.url}/api/v1/tarefa/cadastrar-tarefa`,
      request,
      {
        headers:
          this.getHeaders()
      }
    );
  }


  // =====================================================
  // AUTOCOMPLETE LISTA DE TAREFAS
  // =====================================================

  consultarListaTarefaAutoComplete(
    termo?: string
  ): Observable<ListaTarefasResponse[]> {

    const params: any = {};

    if (termo) {

      params.termo =
        termo;
    }

    return this.http.get<
      ListaTarefasResponse[]
    >(
      `${this.url}/api/v1/tarefa/consultar-lista-tarefa-autocomplete`,
      {
        params,
        headers:
          this.getHeaders()
      }
    );
  }


  // =====================================================
  // OBTER POR ID
  // =====================================================

  ObterTarefaPorId(
    id: string
  ): Observable<ObterTarefaResponse> {

    return this.http.get<
      ObterTarefaResponse
    >(
      `${this.url}/api/v1/tarefa/obter-tarefa-por-id/${id}`,
      {
        headers:
          this.getHeaders()
      }
    );
  }


  // =====================================================
  // EDITAR
  // =====================================================

  editarTarefa(
    id: string,
    request: any
  ): Observable<any> {

    return this.http.put<any>(
      `${this.url}/api/v1/tarefa/atualizar-tarefa/${id}`,
      request,
      {
        headers:
          this.getHeaders()
      }
    );
  }


  // =====================================================
  // PAGINAÇÃO
  // =====================================================

  consultarTarefaPaginado(
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
      `${this.url}/api/v1/tarefa/consultar-tarefa-paginacao`,
      {
        params,
        headers:
          this.getHeaders()
      }
    );
  }
}