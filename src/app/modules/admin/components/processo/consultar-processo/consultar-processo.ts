import {
  ChangeDetectorRef,
  Component,
  inject,
  NgZone,
  OnInit
} from '@angular/core';

import {
  Router
} from '@angular/router';

import {
  MatTableDataSource
} from '@angular/material/table';

import {
  ProcessoService
} from '../../../../../core/services/processo.service';


@Component({
  selector: 'app-consultar-processo',
  standalone: false,
  templateUrl: './consultar-processo.html',
  styleUrl: './consultar-processo.css',
})
export class ConsultarProcesso implements OnInit {

  // =========================
  // TABELA
  // =========================

  displayedColumns: string[] = [
    'pasta',
    'numeroProcesso',
    'titulo',
    'acoes'
  ];

  dataSource =
    new MatTableDataSource<any>([]);

  consulta: any[] = [];


  // =========================
  // PAGINAÇÃO
  // =========================

  totalRegistros = 0;

  paginaAtual = 1;

  tamanhoPagina = 10;

  totalPaginas = 1;

  paginasVisiveis: number[] = [];


  // =========================
  // FILTRO
  // =========================

  filtro = '';


  // =========================
  // ESTADO
  // =========================

  carregando = false;

  mensagemErro: string[] = [];

  mensagemSucesso: string[] = [];


  // =========================
  // INJEÇÕES
  // =========================

  private processoService =
    inject(ProcessoService);

  private router =
    inject(Router);

  private cdr =
    inject(ChangeDetectorRef);

  private zone =
    inject(NgZone);


  // =====================================================
  // ON INIT
  // =====================================================

  ngOnInit(): void {

    this.carregarProcessos();

  }


  // =====================================================
  // FILTRO
  // =====================================================

  aplicarFiltro(): void {

    this.zone.run(() => {

      this.paginaAtual = 1;

      this.carregarProcessos();

    });

  }


  // =====================================================
  // CARREGAR PROCESSOS
  // =====================================================

  carregarProcessos(): void {

    this.zone.run(() => {

      this.carregando = true;

      this.mensagemErro = [];

      this.mensagemSucesso = [];

      this.cdr.detectChanges();

    });


    this.processoService
      .consultarProcessoPaginado(
        this.paginaAtual,
        this.tamanhoPagina,
        this.filtro
      )
      .subscribe({

        // =========================
        // SUCESSO
        // =========================

        next: (response: any) => {

          this.zone.run(() => {

            const items =
              response?.items ?? [];

            // =========================
            // DADOS
            // =========================

            this.consulta =
              [...items];

            this.dataSource.data =
              [...items];


            // =========================
            // PAGINAÇÃO
            // =========================

            this.totalRegistros =
              response?.totalCount ?? 0;

            this.totalPaginas =
              Math.max(
                1,
                Math.ceil(
                  this.totalRegistros /
                  this.tamanhoPagina
                )
              );

            this.atualizarPaginasVisiveis();


            // =========================
            // FINALIZA
            // =========================

            this.carregando = false;

            console.log(
              'PROCESSOS:',
              items
            );

            console.log(
              'TOTAL:',
              this.totalRegistros
            );

            console.log(
              'PÁGINA:',
              this.paginaAtual,
              '/',
              this.totalPaginas
            );

            this.cdr.detectChanges();

          });

        },


        // =========================
        // ERRO
        // =========================

        error: (err) => {

          this.zone.run(() => {

            console.error(
              'Erro ao consultar processos:',
              err
            );

            this.mensagemErro = [
              'Erro ao consultar processos.'
            ];

            this.consulta = [];

            this.dataSource.data = [];

            this.carregando = false;

            this.cdr.detectChanges();

          });

        }

      });

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

    this.zone.run(() => {

      this.paginaAtual =
        pagina;

      this.carregarProcessos();

    });

  }


  // =====================================================
  // PÁGINAS VISÍVEIS
  // =====================================================

  atualizarPaginasVisiveis(): void {

    const maxVisiveis = 5;


    let inicio =
      Math.max(
        1,
        this.paginaAtual - 2
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
            fim -
            inicio +
            1
        },
        (_, index) =>
          inicio +
          index
      );

  }


  // =====================================================
  // FORMATAÇÃO NÚMERO CNJ
  // =====================================================

  formatarNumeroCNJ(
    numero?: string | null
  ): string {

    if (!numero) {

      return '';

    }

    // Remove qualquer caractere
    // que não seja número

    const valor =
      numero.replace(
        /\D/g,
        ''
      );


    // Número CNJ possui
    // exatamente 20 dígitos

    if (valor.length !== 20) {

      return numero;

    }


    // NNNNNNN-DD.AAAA.J.TR.OOOO

    return valor.replace(
      /^(\d{7})(\d{2})(\d{4})(\d)(\d{2})(\d{4})$/,
      '$1-$2.$3.$4.$5.$6'
    );

  }

}