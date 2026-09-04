import {
  ChangeDetectorRef,
  Component,
  inject,
  NgZone,
  OnInit
} from '@angular/core';

import {
  ActivatedRoute,
  Router
} from '@angular/router';

import {
  finalize
} from 'rxjs';

import {
  WebJurService
} from '../../../../../core/services/webjur.service';

import {
  WebJurPublicacaoDetalhe
} from '../../../../../core/models/webjur/webjur-publicacao-detalhe';

import {
  ProcessoResumoResponse
} from '../../../../../core/models/processo-resumo/processo-resumo-response';

import {
  ProcessoService
} from '../../../../../core/services/processo.service';

@Component({
  selector: 'app-detalhe-publicacao',
  templateUrl: './detalhe-publicacao.html',
  standalone: false,
  styleUrls: ['./detalhe-publicacao.css'],
})
export class DetalhePublicacao
  implements OnInit {

  // =====================================================
  // INJEÇÕES
  // =====================================================

  private readonly route =
    inject(ActivatedRoute);

  private readonly router =
    inject(Router);

  private readonly service =
    inject(WebJurService);

  private readonly processoService =
    inject(ProcessoService);

  private readonly cdr =
    inject(ChangeDetectorRef);

  private readonly zone =
    inject(NgZone);

  // =====================================================
  // ESTADO
  // =====================================================

  carregando = false;

  detalhe:
    WebJurPublicacaoDetalhe | null = null;

  mensagemErro: string[] = [];
  mensagemSucesso: string[] = [];

  processo:
    ProcessoResumoResponse | null = null;

  carregandoProcesso = false;

  andamentosProcesso: any[] = [];

  carregandoAndamentosProcesso =
    false;

  comentario =
    '';

  // =====================================================
  // MODAIS
  // =====================================================

  mostrarModalDadosWebJur =
    false;

  mostrarModalComentarios =
    false;

  mostrarModalVisualizacoes =
    false;

  // =====================================================
  // COMENTÁRIOS
  // =====================================================

  comentarios: any[] =
    [];

  carregandoComentarios =
    false;

  paginaComentario =
    1;

  pageSizeComentario =
    10;

  totalComentarios =
    0;

  // =====================================================
  // VISUALIZAÇÕES
  // =====================================================

  carregandoVisualizacoes =
    false;

  visualizacoes: any[] =
    [];

  paginaVisualizacao =
    1;

  pageSizeVisualizacao =
    10;

  totalVisualizacoes =
    0;

  // =====================================================
  // INIT
  // =====================================================

  ngOnInit(): void {

    this.route.paramMap
      .subscribe(params => {

        const id =
          params.get('id');

        if (!id) {
          return;
        }

        this.zone.run(() => {

          this.carregar(id);

          /*
           * Registra uma visualização ao entrar
           * na publicação.
           */
          this.service
            .registrarVisualizacao(id)
            .subscribe({
              error: () => {
                /*
                 * Uma falha de auditoria não deve
                 * impedir a abertura da publicação.
                 */
              }
            });
        });
      });
  }

  // =====================================================
  // CARREGAR PUBLICAÇÃO
  // =====================================================

  carregar(
    id: string
  ): void {

    this.carregando =
      true;

    this.detalhe =
      null;

    this.mensagemErro =
      [];

    this.service
      .obterDetalhe(id)
      .pipe(
        finalize(() => {

          this.carregando =
            false;

          this.cdr.detectChanges();
        })
      )
      .subscribe({

        next: res => {

          this.detalhe =
            res;

          if (
            this.detalhe?.processoId
          ) {

            this.carregarProcesso();

            this.carregarAndamentosProcesso();
          } else {

            this.processo =
              null;

            this.andamentosProcesso =
              [];
          }

          /*
           * Atualiza os indicadores.
           */
          this.carregarVisualizacoes(1);

          this.carregarComentarios(
            1
          );
        },

        error: err => {

          this.mensagemErro = [
            err?.error?.message ??
            err?.error?.mensagem ??
            'Erro ao carregar publicação.'
          ];
        }
      });
  }

  // =====================================================
  // PROCESSO
  // =====================================================

  private carregarProcesso(): void {

    if (!this.detalhe?.processoId) {

      this.processo =
        null;

      return;
    }

    this.carregandoProcesso =
      true;

    this.processoService
      .obterResumoProcesso(
        this.detalhe.processoId
      )
      .pipe(
        finalize(() => {

          this.carregandoProcesso =
            false;

          this.cdr.detectChanges();
        })
      )
      .subscribe({

        next: processo => {

          this.processo =
            processo;
        },

        error: () => {

          this.processo =
            null;
        }
      });
  }

  // =====================================================
  // ANDAMENTOS DO PROCESSO
  // =====================================================

  carregarAndamentosProcesso(): void {

    if (!this.detalhe?.processoId) {

      this.andamentosProcesso =
        [];

      return;
    }

    this.carregandoAndamentosProcesso =
      true;

    this.processoService
      .obterAndamentosWebJur(
        this.detalhe.processoId
      )
      .pipe(
        finalize(() => {

          this.carregandoAndamentosProcesso =
            false;

          this.cdr.detectChanges();
        })
      )
      .subscribe({

        next: res => {

          this.andamentosProcesso =
            res ?? [];
        },

        error: () => {

          this.andamentosProcesso =
            [];
        }
      });
  }

  // =====================================================
  // COMENTÁRIOS
  // =====================================================

  carregarComentarios(
    page: number = 1
  ): void {

    if (
      !this.detalhe ||
      this.carregandoComentarios
    ) {
      return;
    }

    this.paginaComentario =
      page;

    this.carregandoComentarios =
      true;

    this.service
      .getComentarios(
        this.detalhe.id,
        page,
        this.pageSizeComentario
      )
      .pipe(
        finalize(() => {

          this.carregandoComentarios =
            false;

          this.cdr.detectChanges();
        })
      )
      .subscribe({

        next: res => {

          this.comentarios =
            res?.items ?? [];

          this.totalComentarios =
            res?.totalCount ?? 0;
        },

        error: () => {

          this.comentarios =
            [];

          this.totalComentarios =
            0;
        }
      });
  }

  abrirComentarios(): void {

    if (!this.detalhe) {
      return;
    }

    this.mostrarModalComentarios =
      true;

    this.carregarComentarios(1);
  }

  fecharComentarios(): void {

    this.mostrarModalComentarios =
      false;
  }

  adicionarComentario(): void {

    if (!this.detalhe) {
      return;
    }

    const texto =
      this.comentario.trim();

    if (!texto) {
      return;
    }

    const id =
      this.detalhe.id;

    this.service
      .adicionarComentario(
        id,
        texto
      )
      .subscribe({

        next: () => {

          this.comentario =
            '';

          this.mensagemSucesso = [
            'Comentário adicionado com sucesso.'
          ];

          this.carregarComentarios(1);
        },

        error: err => {

          this.mensagemErro = [
            err?.error?.message ??
            err?.error?.mensagem ??
            'Erro ao adicionar comentário.'
          ];
        }
      });
  }

  // =====================================================
  // VISUALIZAÇÕES
  // =====================================================

  carregarVisualizacoes(
    page: number = 1
  ): void {

    if (
      !this.detalhe ||
      this.carregandoVisualizacoes
    ) {
      return;
    }

    this.paginaVisualizacao =
      page;

    this.carregandoVisualizacoes =
      true;

    this.service
      .getVisualizacoes(
        this.detalhe.id,
        page,
        this.pageSizeVisualizacao
      )
      .pipe(
        finalize(() => {

          this.carregandoVisualizacoes =
            false;

          this.cdr.detectChanges();
        })
      )
      .subscribe({

        next: res => {

          this.visualizacoes =
            res?.items ?? [];

          this.totalVisualizacoes =
            res?.totalCount ?? 0;
        },

        error: () => {

          this.visualizacoes =
            [];

          this.totalVisualizacoes =
            0;
        }
      });
  }

  abrirModalVisualizacoes(): void {

    if (!this.detalhe) {
      return;
    }

    this.mostrarModalVisualizacoes =
      true;

    this.carregarVisualizacoes(1);
  }

  fecharVisualizacoes(): void {

    this.mostrarModalVisualizacoes =
      false;
  }

  // =====================================================
  // DADOS WEBJUR
  // =====================================================

  abrirModalDadosWebJur(): void {

    this.mostrarModalDadosWebJur =
      true;
  }

  fecharModalDadosWebJur(): void {

    this.mostrarModalDadosWebJur =
      false;
  }

  // =====================================================
  // SINCRONIZAÇÃO
  // =====================================================

  sincronizar(): void {

    if (!this.detalhe) {
      return;
    }

    const id =
      this.detalhe.id;

    this.carregando =
      true;

    this.mensagemErro =
      [];

    this.service
      .sincronizarPublicacao(id)
      .subscribe({

        next: () => {

          this.mensagemSucesso = [
            'Publicação sincronizada com sucesso.'
          ];

          this.carregar(id);
        },

        error: err => {

          this.carregando =
            false;

          this.mensagemErro = [
            err?.error?.message ??
            err?.error?.mensagem ??
            'Erro ao sincronizar publicação.'
          ];
        }
      });
  }

  // =====================================================
  // PDF
  // =====================================================

  baixarPdf(): void {

    if (!this.detalhe) {
      return;
    }

    this.service
      .baixarPdf(
        this.detalhe.id
      )
      .subscribe({

        next: blob => {

          const url =
            window.URL
              .createObjectURL(blob);

          window.open(
            url,
            '_blank'
          );

          setTimeout(() => {

            window.URL
              .revokeObjectURL(url);

          }, 10000);
        },

        error: err => {

          this.mensagemErro = [
            err?.error?.message ??
            'Não foi possível gerar o PDF.'
          ];
        }
      });
  }

  // =====================================================
  // VOLTAR
  // =====================================================

  voltar(): void {

    /*
     * Pela sua listagem os detalhes estão
     * dentro de /admin.
     */
    this.router.navigate([
      '/admin/webjur'
    ]);
  }

  // =====================================================
  // SITUAÇÃO PROCESSO
  // =====================================================

  getSituacao(
    status: number
  ): string {

    switch (status) {

      case 1:
        return 'Ativo';

      case 2:
        return 'Suspenso';

      case 3:
        return 'Arquivado';

      case 4:
        return 'Encerrado';

      default:
        return '-';
    }
  }

  getSituacaoClass(
    status: number
  ): string {

    switch (status) {

      case 1:
        return 'bg-success';

      case 2:
        return 'bg-warning text-dark';

      case 3:
        return 'bg-secondary';

      case 4:
        return 'bg-dark';

      default:
        return 'bg-light text-dark';
    }
  }
  get totalPaginasComentario(): number {

  if (
    this.totalComentarios === 0
  ) {
    return 1;
  }

  return Math.ceil(
    this.totalComentarios /
    this.pageSizeComentario
  );
}
get totalPaginasVisualizacao(): number {

  if (
    this.totalVisualizacoes === 0
  ) {
    return 1;
  }

  return Math.ceil(
    this.totalVisualizacoes /
    this.pageSizeVisualizacao
  );
}
}