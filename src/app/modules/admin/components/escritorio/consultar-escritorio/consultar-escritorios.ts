import {
  ChangeDetectorRef,
  Component,
  inject,
  OnInit
} from '@angular/core';

import {
  HttpErrorResponse
} from '@angular/common/http';

import { Router } from '@angular/router';

import { MatTableDataSource } from '@angular/material/table';

import {
  animate,
  style,
  transition,
  trigger
} from '@angular/animations';

import { environment } from '../../../../../../environments/environment.development';

import { EscritorioPaginacaoResponse } from '../../../../../core/models/escritorio/escritorio-paginacao-response';
import { EscritorioService } from '../../../../../core/services/escritorio.service';


interface EscritorioPaginadoApiResponse {
  items: EscritorioPaginacaoResponse[];
  totalCount: number;
  totalPages?: number;
  pageNumber?: number;
  pageSize?: number;
}


@Component({
  selector: 'app-consultar-escritorios',
  standalone: false,
  templateUrl: './consultar-escritorios.html',
  styleUrl: './consultar-escritorios.css',

  animations: [

    trigger('fadeAnimation', [

      transition(':enter', [

        style({
          opacity: 0
        }),

        animate(
          '300ms ease-in',
          style({
            opacity: 1
          })
        )

      ]),

      transition(':leave', [

        animate(
          '300ms ease-out',
          style({
            opacity: 0
          })
        )

      ])

    ])

  ]
})
export class ConsultarEscritorios implements OnInit {


  // =====================================================
  // TABELA
  // =====================================================

  displayedColumns: string[] = [
    'nome',
    'documento',
    'usuarios',
    'licencas',
    'dataCadastro',
    'acoes'
  ];

  dataSource =
    new MatTableDataSource<EscritorioPaginacaoResponse>([]);


  // =====================================================
  // PAGINAÇÃO
  // =====================================================

  totalRegistros = 0;

  paginaAtual = 1;

  tamanhoPagina = 10;

  totalPaginas = 1;

  paginasVisiveis: number[] = [];


  // =====================================================
  // ESTADO
  // =====================================================

  carregando = false;

  filtro = '';

  consulta: EscritorioPaginacaoResponse[] = [];

  mensagemErro: string[] = [];

  mensagemSucesso: string[] = [];

  urlBase = environment.apiDeslandes;


  // =====================================================
  // SERVICES
  // =====================================================

  private escritorioService =
    inject(EscritorioService);

  private router =
    inject(Router);

  private cdr =
    inject(ChangeDetectorRef);


  // =====================================================
  // INIT
  // =====================================================

  ngOnInit(): void {

    this.buscarEscritorios();
  }


  // =====================================================
  // FILTRO
  // =====================================================

  aplicarFiltro(): void {

    this.paginaAtual = 1;

    this.buscarEscritorios();
  }


  // =====================================================
  // CONSULTAR
  // =====================================================

  buscarEscritorios(): void {

    this.carregando = true;

    this.mensagemErro = [];

    this.mensagemSucesso = [];

    this.escritorioService
  .consultarEscritoriosPaginado(
    this.paginaAtual,
    this.tamanhoPagina,
    this.filtro
  )
  .subscribe({

        next: (
          response: EscritorioPaginadoApiResponse
        ) => {

          const items =
            response.items ?? [];

          this.dataSource.data =
            items;

          this.consulta =
            items;

          this.totalRegistros =
            response.totalCount ?? 0;

          this.totalPaginas =
            response.totalPages ??
            Math.max(
              1,
              Math.ceil(
                this.totalRegistros /
                this.tamanhoPagina
              )
            );

          if (this.totalPaginas < 1) {
            this.totalPaginas = 1;
          }

          this.atualizarPaginasVisiveis();

          this.carregando = false;

          this.cdr.detectChanges();
        },


        error: (
          e: HttpErrorResponse
        ) => {

          this.tratarErro(e);

          this.carregando = false;

          this.cdr.detectChanges();
        }

      });
  }


  // =====================================================
  // EXCLUIR
  // =====================================================

  excluirEscritorio(
    escritorio: EscritorioPaginacaoResponse
  ): void {

    if (!escritorio?.id) {
      return;
    }

    const confirmar =
      confirm(
        `Deseja realmente excluir o escritório ${escritorio.nome}?`
      );

    if (!confirmar) {
      return;
    }

    this.carregando = true;

    this.mensagemErro = [];

    this.mensagemSucesso = [];

    this.escritorioService
      .excluirEscritorio(
        escritorio.id
      )
      .subscribe({

        next: (response) => {

          this.mensagemSucesso = [

            response.message ??
            'Escritório excluído com sucesso.'

          ];

          if (
            this.dataSource.data.length === 1 &&
            this.paginaAtual > 1
          ) {

            this.paginaAtual--;
          }

          this.buscarEscritorios();
        },


        error: (
          e: HttpErrorResponse
        ) => {

          this.tratarErro(e);

          this.carregando = false;

          this.cdr.detectChanges();
        }

      });
  }


  // =====================================================
  // PAGINAÇÃO
  // =====================================================

  atualizarPaginasVisiveis(): void {

    const maxVisiveis = 5;

    let inicio =
      Math.max(
        1,
        this.paginaAtual -
        Math.floor(
          maxVisiveis / 2
        )
      );

    let fim =
      Math.min(
        this.totalPaginas,
        inicio +
        maxVisiveis -
        1
      );

    inicio =
      Math.max(
        1,
        fim -
        maxVisiveis +
        1
      );

    this.paginasVisiveis =
      Array.from(
        {
          length:
            Math.max(
              0,
              fim -
              inicio +
              1
            )
        },

        (_, indice) =>
          inicio + indice
      );
  }


  // =====================================================
  // IR PARA PÁGINA
  // =====================================================

  irParaPagina(
    pagina: number
  ): void {

    if (
      pagina < 1 ||
      pagina > this.totalPaginas ||
      pagina === this.paginaAtual
    ) {
      return;
    }

    this.paginaAtual =
      pagina;

    this.buscarEscritorios();
  }


  // =====================================================
  // FORMATAR DOCUMENTO
  // =====================================================

  formatarDocumento(
    documento?: string | null
  ): string {

    if (!documento) {
      return '';
    }

    const numeros =
      documento.replace(
        /\D/g,
        ''
      );

    if (
      numeros.length === 11
    ) {

      return numeros.replace(
        /(\d{3})(\d{3})(\d{3})(\d{2})/,
        '$1.$2.$3-$4'
      );
    }

    if (
      numeros.length === 14
    ) {

      return numeros.replace(
        /(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/,
        '$1.$2.$3/$4-$5'
      );
    }

    return documento;
  }


  // =====================================================
  // TRATAR ERRO
  // =====================================================

  private tratarErro(
    e: HttpErrorResponse
  ): void {

    const errorResponse =
      e?.error;

    this.mensagemErro = [];

    if (
      errorResponse?.errors
    ) {

      for (
        const key in
        errorResponse.errors
      ) {

        if (
          Array.isArray(
            errorResponse.errors[key]
          )
        ) {

          this.mensagemErro.push(
            ...errorResponse.errors[key]
          );
        }
      }
    }

    else if (
      errorResponse?.mensagem
    ) {

      this.mensagemErro.push(
        errorResponse.mensagem
      );

      if (
        errorResponse.detalhes
      ) {

        this.mensagemErro.push(
          errorResponse.detalhes
        );
      }

      else if (
        errorResponse.Detalhes
      ) {

        this.mensagemErro.push(
          errorResponse.Detalhes
        );
      }
    }

    else if (
      errorResponse?.message
    ) {

      this.mensagemErro.push(
        errorResponse.message
      );
    }

    else if (
      errorResponse?.Message
    ) {

      this.mensagemErro.push(
        errorResponse.Message
      );
    }

    else {

      this.mensagemErro.push(
        'Ocorreu um erro inesperado ao consultar os escritórios.'
      );
    }

    this.mensagemErro = [
      ...new Set(
        this.mensagemErro
      )
    ];

    console.error(
      'Erro recebido do backend:',
      e
    );
  }
}