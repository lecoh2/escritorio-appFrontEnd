import {
  CategoriaFinanceiraResponse
} from './categoria-financeira-response';

export interface CategoriaFinanceiraPaginacaoResponse {

  items: CategoriaFinanceiraResponse[];

  totalCount: number;

  pageNumber: number;

  pageSize: number;
}