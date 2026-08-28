import {
  HttpClient
} from '@angular/common/http';

import {
  Injectable,
  inject
} from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class MunicipioService {

  private http = inject(HttpClient);

  buscarPorUf(uf: string) {

    return this.http.get<any[]>(
      `https://servicodados.ibge.gov.br/api/v1/localidades/estados/${uf}/municipios`
    );
  }
}