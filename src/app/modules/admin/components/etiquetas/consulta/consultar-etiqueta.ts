declare var $: any;
declare var bootstrap: any;

import {
  ChangeDetectorRef,
  Component,
  inject,
  OnInit
} from '@angular/core';

import { Router } from '@angular/router';

import { MatTableDataSource } from '@angular/material/table';

import {
  trigger,
  transition,
  style,
  animate
} from '@angular/animations';

import { EtiquetaService } from '../../../../../core/services/etiqueta.service';

import { ConsultarEtiquetaResponse } from '../../../../../core/models/etiqueta/consultar-etiqueta-response';


@Component({
  selector: 'app-consultar-etiquetas',
  standalone: false,
  templateUrl: './consultar-etiqueta.html',
  styleUrl: './consultar-etiqueta.css',

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
export class ConsultarEtiquetas implements OnInit {

  // =========================
  // TABELA
  // =========================

  displayedColumns: string[] = [
    'nome',
    'cor',
    'acoes'
  ];

  dataSource =
    new MatTableDataSource<ConsultarEtiquetaResponse>([]);

  consulta:
    ConsultarEtiquetaResponse[] = [];


  // =========================
  // PAGINAÇÃO
  // =========================

  totalRegistros =
    0;

  paginaAtual =
    1;

  tamanhoPagina =
    10;

  totalPaginas =
    1;

  paginasVisiveis:
    number[] = [];


  // =========================
  // UI
  // =========================

  carregando =
    false;

  filtro =
    '';

  mensagemErro:
    string[] = [];

  mensagemSucesso:
    string[] = [];


  // =========================
  // INJEÇÕES
  // =========================

  private etiquetaService =
    inject(EtiquetaService);

  private router =
    inject(Router);

  private cdr =
    inject(ChangeDetectorRef);


  // =========================
  // INIT
  // =========================

  ngOnInit(): void {

    this.carregarEtiquetas();

  }


  // =========================
  // FILTRO
  // =========================

  aplicarFiltro(): void {

    this.paginaAtual =
      1;

    this.carregarEtiquetas();

  }


  // =========================
  // CARREGAR DADOS
  // =========================

  carregarEtiquetas(): void {

    this.carregando =
      true;

    this.mensagemErro =
      [];

    this.mensagemSucesso =
      [];


    this.etiquetaService
      .consultarEtiquetaPaginado(
        this.paginaAtual,
        this.tamanhoPagina,
        this.filtro
      )
      .subscribe({

        next: (response: any) => {

          const items =
            response.items || [];

          this.consulta =
            items;

          this.dataSource.data =
            items;

          this.totalRegistros =
            response.totalCount || 0;

          this.totalPaginas =
            Math.max(
              1,
              Math.ceil(
                this.totalRegistros /
                this.tamanhoPagina
              )
            );

          this.atualizarPaginasVisiveis();

          this.carregando =
            false;

          this.cdr.detectChanges();

        },


        error: () => {

          this.mensagemErro = [
            'Erro ao consultar etiquetas.'
          ];

          this.carregando =
            false;

        }

      });

  }


  // =========================
  // PAGINAÇÃO
  // =========================

  irParaPagina(
    pagina: number
  ): void {

    if (
      pagina < 1 ||
      pagina > this.totalPaginas
    ) {
      return;
    }

    this.paginaAtual =
      pagina;

    this.carregarEtiquetas();

  }


  atualizarPaginasVisiveis(): void {

    const maxVisiveis =
      5;

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
            fim - inicio + 1
        },
        (_, i) =>
          inicio + i
      );

  }


  // =========================
  // EDITAR
  // =========================

  editar(
    item: ConsultarEtiquetaResponse
  ): void {

    this.router.navigate([
      '/admin/editar-etiqueta',
      item.id
    ]);

  }


  // =========================
  // EXCLUIR
  // =========================

  excluir(
    item: ConsultarEtiquetaResponse
  ): void {

    const confirmar =
      window.confirm(
        `Deseja realmente excluir a etiqueta "${item.nome}"?`
      );

    if (!confirmar) {
      return;
    }


    this.carregando =
      true;

    this.mensagemErro =
      [];

    this.mensagemSucesso =
      [];


    this.etiquetaService
      .excluirEtiqueta(
        item.id
      )
      .subscribe({

        next: (response) => {

          this.mensagemSucesso = [
            response.message ??
            'Etiqueta excluída com sucesso.'
          ];

          /*
           * Se excluiu o último item
           * da página e não está na
           * primeira página, volta uma.
           */
          if (
            this.dataSource.data.length === 1 &&
            this.paginaAtual > 1
          ) {

            this.paginaAtual--;

          }

          this.carregarEtiquetas();

        },


        error: (err: any) => {

          this.carregando =
            false;

          this.mensagemErro = [

            err?.error?.message
            ??
            err?.error?.mensagem
            ??
            'Erro ao excluir etiqueta.'

          ];

        }

      });

  }


  // =========================
  // NOVA ETIQUETA
  // =========================

  novaEtiqueta(): void {

    this.router.navigate([
      '/admin/cadastrar-etiqueta'
    ]);

  }
}