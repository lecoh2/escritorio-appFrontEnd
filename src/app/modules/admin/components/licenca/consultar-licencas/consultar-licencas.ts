import {
  ChangeDetectorRef,
  Component,
  inject,
  OnInit
} from '@angular/core';

import {
  animate,
  style,
  transition,
  trigger
} from '@angular/animations';

import { MatTableDataSource } from '@angular/material/table';

import { Router } from '@angular/router';

import { finalize } from 'rxjs';

import { LicencaService } from '../../../../../core/services/licenca.service';
import { LicencaPaginacaoResponse } from '../../../../../core/models/licenca/licenca-paginacaoR-response';
import { StatusLicencaEnum } from '../../../../../core/models/enums/licenca/status-licenca-enum';
import { TipoPlanoEnum } from '../../../../../core/models/enums/plano/tipo-plano-rnum';



@Component({
  selector: 'app-consultar-licencas',
  standalone: false,
  templateUrl: './consultar-licencas.html',
  styleUrl: './consultar-licencas.css',
  animations: [
    trigger('fadeAnimation', [
      transition(':enter', [
        style({ opacity: 0 }),
        animate(
          '300ms ease-in',
          style({ opacity: 1 })
        )
      ]),

      transition(':leave', [
        animate(
          '300ms ease-out',
          style({ opacity: 0 })
        )
      ])
    ])
  ]
})
export class ConsultarLicencas implements OnInit {

  // =========================
  // SERVICES
  // =========================

  private licencaService =
    inject(LicencaService);

  private router =
    inject(Router);

  private cdr =
    inject(ChangeDetectorRef);

  // =========================
  // TABELA
  // =========================

  displayedColumns: string[] = [
    'escritorio',
    'documento',
    'chave',
    'plano',
    'periodo',
    'usuarios',
    'diasRestantes',
    'status',
    'acoes'
  ];

  dataSource =
    new MatTableDataSource<LicencaPaginacaoResponse>([]);

  consulta: LicencaPaginacaoResponse[] = [];

  // =========================
  // PAGINAÇÃO
  // =========================

  totalRegistros = 0;

  paginaAtual = 1;

  tamanhoPagina = 10;

  totalPaginas = 1;

  paginasVisiveis: number[] = [];

  // =========================
  // ESTADOS
  // =========================

  carregando = false;

  filtro = '';

  mensagemErro: string[] = [];

  mensagemSucesso: string[] = [];

  // =========================
  // ENUMS
  // =========================

  statusLicencaEnum =
    StatusLicencaEnum;

  tipoPlanoEnum =
    TipoPlanoEnum;

  // =========================
  // INIT
  // =========================

  ngOnInit(): void {
    this.buscarLicencas();
  }

  // =========================
  // FILTRO
  // =========================

  aplicarFiltro(): void {
    this.paginaAtual = 1;

    this.buscarLicencas();
  }

  limparFiltro(): void {
    this.filtro = '';

    this.paginaAtual = 1;

    this.buscarLicencas();
  }

  // =========================
  // CONSULTAR
  // =========================

  buscarLicencas(): void {
    this.carregando = true;

    this.mensagemErro = [];

    this.licencaService
      .consultarLicencasPaginacao(
        this.paginaAtual,
        this.tamanhoPagina,
        this.filtro
      )
      .pipe(
        finalize(() => {
          this.carregando = false;

          this.cdr.detectChanges();
        })
      )
      .subscribe({
        next: (response: any) => {
          this.dataSource.data =
            response.items ?? [];

          this.consulta =
            response.items ?? [];

          this.totalRegistros =
            response.totalCount ?? 0;

          this.totalPaginas =
            Math.max(
              1,
              Math.ceil(
                this.totalRegistros /
                this.tamanhoPagina
              )
            );

          this.atualizarPaginasVisiveis();

          this.cdr.detectChanges();
        },

        error: (e) => {
          this.tratarErro(e);
        }
      });
  }

  // =========================
  // ATIVAR
  // =========================

  ativarLicenca(
    licenca: LicencaPaginacaoResponse
  ): void {
    if (
      !licenca?.id ||
      !licenca?.escritorioId ||
      !licenca?.chave
    ) {
      return;
    }

    const confirmar = confirm(
      `Deseja realmente ativar a licença ${licenca.chave}?`
    );

    if (!confirmar) {
      return;
    }

    this.carregando = true;

    this.mensagemErro = [];

    this.mensagemSucesso = [];

    this.licencaService
      .ativarLicenca({
        escritorioId:
          licenca.escritorioId,

        chave:
          licenca.chave
      })
      .pipe(
        finalize(() => {
          this.carregando = false;

          this.cdr.detectChanges();
        })
      )
      .subscribe({
        next: (response) => {
          this.mensagemSucesso = [
            response.message ??
            'Licença ativada com sucesso.'
          ];

          this.buscarLicencas();
        },

        error: (e) => {
          this.tratarErro(e);
        }
      });
  }

  // =========================
  // SUSPENDER
  // =========================

  suspenderLicenca(
    licenca: LicencaPaginacaoResponse
  ): void {
    if (!licenca?.id) {
      return;
    }

    const confirmar = confirm(
      `Deseja realmente suspender a licença ${licenca.chave}?`
    );

    if (!confirmar) {
      return;
    }

    this.carregando = true;

    this.mensagemErro = [];

    this.mensagemSucesso = [];

    this.licencaService
      .suspenderLicencaPorId(
        licenca.id
      )
      .pipe(
        finalize(() => {
          this.carregando = false;

          this.cdr.detectChanges();
        })
      )
      .subscribe({
        next: (response) => {
          this.mensagemSucesso = [
            response.message ??
            'Licença suspensa com sucesso.'
          ];

          this.buscarLicencas();
        },

        error: (e) => {
          this.tratarErro(e);
        }
      });
  }

  // =========================
  // CANCELAR
  // =========================

  cancelarLicenca(
    licenca: LicencaPaginacaoResponse
  ): void {
    if (!licenca?.id) {
      return;
    }

    const confirmar = confirm(
      `Deseja realmente cancelar a licença ${licenca.chave}? Essa operação não poderá ser desfeita.`
    );

    if (!confirmar) {
      return;
    }

    this.carregando = true;

    this.mensagemErro = [];

    this.mensagemSucesso = [];

    this.licencaService
      .cancelarLicencaPorId(
        licenca.id
      )
      .pipe(
        finalize(() => {
          this.carregando = false;

          this.cdr.detectChanges();
        })
      )
      .subscribe({
        next: (response) => {
          this.mensagemSucesso = [
            response.message ??
            'Licença cancelada com sucesso.'
          ];

          this.buscarLicencas();
        },

        error: (e) => {
          this.tratarErro(e);
        }
      });
  }

  // =========================
  // EXCLUIR
  // =========================

  excluirLicenca(
    licenca: LicencaPaginacaoResponse
  ): void {
    if (!licenca?.id) {
      return;
    }

    const confirmar = confirm(
      `Deseja realmente excluir a licença ${licenca.chave}?`
    );

    if (!confirmar) {
      return;
    }

    this.carregando = true;

    this.mensagemErro = [];

    this.mensagemSucesso = [];

    this.licencaService
      .excluirLicenca(
        licenca.id
      )
      .pipe(
        finalize(() => {
          this.carregando = false;

          this.cdr.detectChanges();
        })
      )
      .subscribe({
        next: (response) => {
          this.mensagemSucesso = [
            response.message ??
            'Licença excluída com sucesso.'
          ];

          if (
            this.dataSource.data.length === 1 &&
            this.paginaAtual > 1
          ) {
            this.paginaAtual--;
          }

          this.buscarLicencas();
        },

        error: (e) => {
          this.tratarErro(e);
        }
      });
  }

  // =========================
  // EDITAR
  // =========================

  editarLicenca(
    licencaId: string
  ): void {
    if (!licencaId) {
      return;
    }

    this.router.navigate([
      '/admin/editar-licenca',
      licencaId
    ]);
  }

  // =========================
  // PAGINAÇÃO
  // =========================

  atualizarPaginasVisiveis(): void {
    const maxVisiveis = 5;

    let inicio = Math.max(
      1,
      this.paginaAtual -
      Math.floor(maxVisiveis / 2)
    );

    let fim = Math.min(
      this.totalPaginas,
      inicio + maxVisiveis - 1
    );

    inicio = Math.max(
      1,
      fim - maxVisiveis + 1
    );

    this.paginasVisiveis =
      Array.from(
        {
          length:
            Math.max(
              0,
              fim - inicio + 1
            )
        },
        (_, indice) =>
          inicio + indice
      );
  }

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

    this.paginaAtual = pagina;

    this.buscarLicencas();
  }

  // =========================
  // STATUS
  // =========================

  obterNomeStatus(
    status: StatusLicencaEnum
  ): string {
    switch (status) {
      case StatusLicencaEnum.Pendente:
        return 'Pendente';

      case StatusLicencaEnum.Ativa:
        return 'Ativa';

      case StatusLicencaEnum.Suspensa:
        return 'Suspensa';

      case StatusLicencaEnum.Cancelada:
        return 'Cancelada';

      case StatusLicencaEnum.Expirada:
        return 'Expirada';

      default:
        return 'Não informado';
    }
  }

  obterClasseStatus(
    status: StatusLicencaEnum
  ): string {
    switch (status) {
      case StatusLicencaEnum.Pendente:
        return 'badge-subtle-warning';

      case StatusLicencaEnum.Ativa:
        return 'badge-subtle-success';

      case StatusLicencaEnum.Suspensa:
        return 'badge-subtle-secondary';

      case StatusLicencaEnum.Cancelada:
        return 'badge-subtle-danger';

      case StatusLicencaEnum.Expirada:
        return 'badge-subtle-danger';

      default:
        return 'badge-subtle-secondary';
    }
  }

  obterIconeStatus(
    status: StatusLicencaEnum
  ): string {
    switch (status) {
      case StatusLicencaEnum.Pendente:
        return 'fas fa-clock';

      case StatusLicencaEnum.Ativa:
        return 'fas fa-check-circle';

      case StatusLicencaEnum.Suspensa:
        return 'fas fa-pause-circle';

      case StatusLicencaEnum.Cancelada:
        return 'fas fa-times-circle';

      case StatusLicencaEnum.Expirada:
        return 'fas fa-calendar-times';

      default:
        return 'fas fa-question-circle';
    }
  }

  // =========================
  // PLANO
  // =========================

  obterNomePlano(
    tipoPlano: TipoPlanoEnum
  ): string {
    switch (tipoPlano) {
      case TipoPlanoEnum.Basico:
        return 'Básico';

      case TipoPlanoEnum.Profissional:
        return 'Profissional';

      case TipoPlanoEnum.Empresarial:
        return 'Empresarial';

      default:
        return 'Não informado';
    }
  }

  // =========================
  // DOCUMENTO
  // =========================

  formatarDocumento(
    documento?: string | null
  ): string {
    if (!documento) {
      return '';
    }

    const numeros =
      documento.replace(/\D/g, '');

    if (numeros.length === 11) {
      return numeros.replace(
        /(\d{3})(\d{3})(\d{3})(\d{2})/,
        '$1.$2.$3-$4'
      );
    }

    if (numeros.length === 14) {
      return numeros.replace(
        /(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/,
        '$1.$2.$3/$4-$5'
      );
    }

    return documento;
  }

  // =========================
  // AÇÕES PERMITIDAS
  // =========================

  podeAtivar(
    licenca: LicencaPaginacaoResponse
  ): boolean {
    return (
      licenca.status ===
        StatusLicencaEnum.Pendente ||
      licenca.status ===
        StatusLicencaEnum.Suspensa
    );
  }

  podeSuspender(
    licenca: LicencaPaginacaoResponse
  ): boolean {
    return (
      licenca.status ===
      StatusLicencaEnum.Ativa
    );
  }

  podeCancelar(
    licenca: LicencaPaginacaoResponse
  ): boolean {
    return (
      licenca.status !==
      StatusLicencaEnum.Cancelada
    );
  }

  // =========================
  // TRATAR ERRO
  // =========================

  private tratarErro(
    e: any
  ): void {
    const errorResponse =
      e?.error;

    this.mensagemErro = [];

    if (errorResponse?.errors) {
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
        'Ocorreu um erro inesperado ao consultar as licenças.'
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

    this.cdr.detectChanges();
  }
}