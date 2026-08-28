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

import { WebJurPublicacaoDetalhe } from '../models/webjur/webjur-publicacao-detalhe';

@Injectable({
  providedIn: 'root'
})
export class WebJurService {

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
  // CONSULTAR PUBLICAÇÕES PAGINADO
  // =====================================================

  consultarPublicacoesPaginado(
    pageNumber: number,
    pageSize: number,
    searchTerm?: string
  ): Observable<any> {

    const params: any = {
      pageNumber: pageNumber.toString(),
      pageSize: pageSize.toString()
    };

    if (searchTerm) {
      params.searchTerm = searchTerm;
    }

    return this.http.get<any>(
      `${this.url}/api/v1/webjur/publicacoes/paginacao`,
      {
        params,
        headers: this.getHeaders()
      }
    );
  }


  // =====================================================
  // IMPORTAR PUBLICAÇÕES
  // =====================================================

  importarPublicacoes(): Observable<any> {

    return this.http.post<any>(
      `${this.url}/api/v1/webjur/publicacoes/importar`,
      {},
      {
        headers: this.getHeaders()
      }
    );
  }


  // =====================================================
  // SINCRONIZAR TUDO
  // =====================================================

  sincronizarTudo(): Observable<any> {

    return this.http.post<any>(
      `${this.url}/api/v1/webjur/sincronizar`,
      {},
      {
        headers: this.getHeaders()
      }
    );
  }


  // =====================================================
  // VERIFICAR PROCESSO
  // =====================================================

  verificarProcesso(
    numeroProcesso: string
  ): Observable<any> {

    return this.http.get<any>(
      `${this.url}/api/v1/webjur/verificar/${numeroProcesso}`,
      {
        headers: this.getHeaders()
      }
    );
  }


  // =====================================================
  // CONSULTAR ANDAMENTOS
  // =====================================================

  consultarAndamentos(
    processoId: string
  ): Observable<any> {

    return this.http.get<any>(
      `${this.url}/api/v1/webjur/andamentos/${processoId}`,
      {
        headers: this.getHeaders()
      }
    );
  }


  // =====================================================
  // OBTER DETALHE DA PUBLICAÇÃO
  // =====================================================

  obterDetalhe(
    id: string
  ): Observable<WebJurPublicacaoDetalhe> {

    return this.http.get<WebJurPublicacaoDetalhe>(
      `${this.url}/api/v1/webjur/publicacoes/${id}`,
      {
        headers: this.getHeaders()
      }
    );
  }


  // =====================================================
  // REGISTRAR VISUALIZAÇÃO
  // =====================================================

  registrarVisualizacao(
    id: string
  ): Observable<any> {

    return this.http.post<any>(
      `${this.url}/api/v1/webjur/publicacoes/${id}/visualizar`,
      {},
      {
        headers: this.getHeaders()
      }
    );
  }


  // =====================================================
  // SINCRONIZAR PUBLICAÇÃO
  // =====================================================

  sincronizarPublicacao(
    id: string
  ): Observable<any> {

    return this.http.post<any>(
      `${this.url}/api/v1/webjur/publicacoes/${id}/sincronizar`,
      {},
      {
        headers: this.getHeaders()
      }
    );
  }


  // =====================================================
  // ADICIONAR COMENTÁRIO
  // =====================================================

  adicionarComentario(
    id: string,
    comentario: string
  ): Observable<any> {

    return this.http.post<any>(
      `${this.url}/api/v1/webjur/publicacoes/${id}/comentarios`,
      {
        comentario
      },
      {
        headers: this.getHeaders()
      }
    );
  }


  // =====================================================
  // BAIXAR PDF
  // =====================================================

  baixarPdf(
    id: string
  ): Observable<Blob> {

    return this.http.get(
      `${this.url}/api/v1/webjur/publicacoes/${id}/pdf`,
      {
        headers: this.getHeaders(),
        responseType: 'blob'
      }
    );
  }


  // =====================================================
  // CONSULTAR COMENTÁRIOS
  // =====================================================

  getComentarios(
    id: string
  ): Observable<any> {

    return this.http.get<any>(
      `${this.url}/api/v1/webjur/publicacoes/${id}/comentarios`,
      {
        headers: this.getHeaders()
      }
    );
  }


  // =====================================================
  // CONSULTAR VISUALIZAÇÕES
  // =====================================================

  getVisualizacoes(
    id: string,
    pageNumber: number,
    pageSize: number
  ): Observable<any> {

    return this.http.get<any>(
      `${this.url}/api/v1/webjur/publicacoes/${id}/visualizacoes`,
      {
        params: {
          pageNumber: pageNumber.toString(),
          pageSize: pageSize.toString()
        },
        headers: this.getHeaders()
      }
    );
  }
}