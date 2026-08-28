import { inject, Injectable } from "@angular/core";
import { environment } from "../../../environments/environment.development";
import { HttpClient } from "@angular/common/http";
import { ConsultarSexoResponse } from "../models/sexo/consutar-sexo-response";
import { Observable } from "rxjs";
import { ConsultarVaraResponse } from "../models/vara/consultar-vara-response";
import { ConsultarAcaoResponse } from "../models/acao/consultar-acao-response";
import { KanbanColuna } from "../models/kanban/kanban-coluna";

@Injectable({
    providedIn: 'root' // Isso registra o serviço automaticamente no app
})
export class KanbanService {
    private url = environment.apiDeslandes;
    private http = inject(HttpClient);

 consultar(): Observable<KanbanColuna[]> {

  const token =
    localStorage.getItem('token');

  return this.http.get<KanbanColuna[]>(
    `${this.url}/api/v1/kanban/consultar-kanban`,
    {
      headers: token
        ? {
            Authorization: `Bearer ${token}`
          }
        : {}
    }
  );
}
    obterDetalhes(
  id: string,
  tipo: string
): Observable<any> {

  const token =
    localStorage.getItem('token');

  return this.http.get<any>(
    `${this.url}/api/v1/atividade/${id}/detalhes/${tipo}`,
    {
      headers: token
        ? {
            Authorization: `Bearer ${token}`
          }
        : {}
    }
  );
}
atualizarStatus(
  id: string,
  status: number
): Observable<void> {

  const token =
    localStorage.getItem('token');

  return this.http.put<void>(
    `${this.url}/api/v1/kanban/kanban/${id}/status`,
    status,
    {
      headers: token
        ? {
            Authorization: `Bearer ${token}`
          }
        : {}
    }
  );
}
}