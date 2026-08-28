import { ChangeDetectorRef, Component, inject, NgZone, OnInit } from '@angular/core';

import { Router } from '@angular/router';
import { KanbanColuna } from '../../../../../core/models/kanban/kanban-coluna';
import { KanbanService } from '../../../../../core/services/kanban.service';
import { ComentarioService } from '../../../../../core/services/comenario.service';
import { HistoricoService } from '../../../../../core/services/historico.service';
import { CriarComentarioResponse } from '../../../../../core/models/comentario/criar-comentario-response';
import { TipoEntidadeEnum } from '../../../../../core/models/enums/tipo-entidade/tipo-entidadeEnum';
import { CdkDragDrop, moveItemInArray, transferArrayItem } from '@angular/cdk/drag-drop';
declare var bootstrap: any;

@Component({
  selector: 'app-gestao-atividades',
  standalone: false,
  templateUrl: './gestao-atividades.html',
  styleUrl: './gestao-atividades.css'
})
export class GestaoAtividades implements OnInit {

  colunas: KanbanColuna[] = [];
  private colunasOriginais: KanbanColuna[] = [];

  private kanbanService = inject(KanbanService);
  private comentarioService = inject(ComentarioService)
  private cdr = inject(ChangeDetectorRef);
  private historicoService = inject(HistoricoService);
  private router = inject(Router);


private zone =
  inject(NgZone);
  comentarios: CriarComentarioResponse[] = [];
  novoComentario: string = '';
  mensagemSucesso: string[] = [];
  mensagemErro: string[] = [];
  cardSelecionado: any = null;
  isLoadingDetalhe = false;
  cardIdSelecionado: string | null = null;
  mensagemSucessoAtual: string | null = null;
  mensagemErroAtual: string | null = null;
  carregando = false;
  historico: any[] = [];
  private modalInstance: any;
  filtro = {
    periodo: null as string | null,
    atribuicao: null as string | null,
    pessoaId: null as string | null,
    tipo: null as string | null,
    status: null as string | null
  };

  filtrarPorStatus(): void {

    if (!this.filtro.status) {
      this.colunas = structuredClone(this.colunasOriginais);
      return;
    }

    this.colunas = this.colunasOriginais.map(coluna => ({
      ...coluna,
      cards: coluna.cards.filter(c => Number(c.status) === Number(this.filtro.status))
    }));
  }
  prioridadeLabel: Record<number, string> = {
    1: 'Baixa',
    2: 'Média',
    3: 'Alta',
    4: 'Urgente'
  };

  prioridadeCor: Record<number, string> = {
    1: '#2ecc71',
    2: '#f1c40f',
    3: '#e67e22',
    4: '#e74c3c'
  };
  getPrioridadeLabel(p: number): string {
    return this.prioridadeLabel[p] ?? '---';
  }
  getCorColuna(status: number): string {
    switch (status) {
      case 1: return 'bg-info';   // A Fazer
      case 2: return 'bg-primary';     // Em Andamento
      case 3: return 'bg-success';     // Concluído
      // Cancelado
      default: return 'bg-dark';
    }
  }
  getPrioridadeCor(p: number): string {
    return this.prioridadeCor[p] ?? '#6c757d';
  }
  getPrioridade(p?: number | null): { label: string; cor: string } {
    if (!p) {
      return { label: 'Sem prioridade', cor: '#6c757d' };
    }

    switch (p) {
      case 1: return { label: 'Baixa', cor: '#2ecc71' };
      case 2: return { label: 'Média', cor: '#f1c40f' };
      case 3: return { label: 'Alta', cor: '#e67e22' };
      case 4: return { label: 'Urgente', cor: '#e74c3c' };
      default: return { label: '---', cor: '#6c757d' };
    }
  }
  limparFiltro(): void {

    this.filtro = {
      periodo: null,
      atribuicao: null,
      pessoaId: null,
      tipo: null,
      status: null
    };

    this.aplicarFiltro(); // 🔥 NÃO usa structuredClone direto
  }
  aplicarFiltro(): void {

  let dados = structuredClone(this.colunasOriginais);

  const statusFiltro = this.filtro.status
    ? Number(this.filtro.status)
    : null;

  const tipoFiltro = (this.filtro.tipo ?? '')
    .toString()
    .trim()
    .toLowerCase();

  dados = dados.map(coluna => {

    let cards = coluna.cards ?? [];

    if (statusFiltro != null) {
      cards = cards.filter(c => Number(c.status) === statusFiltro);
    }

    if (tipoFiltro) {
      cards = cards.filter(c =>
        (c.tipo ?? '').toString().trim().toLowerCase() === tipoFiltro
      );
    }

    return {
      ...coluna,
      cards
    };
  })
  // 🔥 ISSO AQUI RESOLVE O BUG VISUAL
  .filter(coluna => coluna.cards.length > 0);

  this.colunas = dados;
}
 mudarStatus(
  id: string,
  status: number
): void {

  this.zone.run(() => {

    this.carregando = true;

    this.mensagemErro = [];

    this.mensagemSucesso = [];

    this.cdr.detectChanges();

  });


  this.kanbanService
    .atualizarStatus(
      id,
      status
    )
    .subscribe({

      // =========================
      // SUCESSO
      // =========================

      next: (res: any) => {

        this.zone.run(() => {

          this.carregando = false;

          this.mensagemErro = [];

          this.mensagemSucesso = [
            res?.message ??
            'Status atualizado com sucesso.'
          ];

          // =========================
          // FECHA O MODAL
          // =========================

          if (this.modalInstance) {

            this.modalInstance.hide();

          }
          else {

            const modalElement =
              document.getElementById(
                'modalDetalhes'
              );

            if (modalElement) {

              const modal =
                bootstrap.Modal
                  .getOrCreateInstance(
                    modalElement
                  );

              modal.hide();
            }
          }

          // =========================
          // LIMPA CARD SELECIONADO
          // =========================

          this.cardSelecionado =
            null;

          this.cardIdSelecionado =
            null;

          // =========================
          // ATUALIZA KANBAN
          // =========================

          this.carregarKanban();

          // =========================
          // FORÇA ATUALIZAÇÃO
          // =========================

          this.cdr.markForCheck();

          setTimeout(() => {

            this.zone.run(() => {

              this.cdr.detectChanges();

            });

          }, 0);


          // =========================
          // REMOVE MENSAGEM
          // APÓS 3 SEGUNDOS
          // =========================

          setTimeout(() => {

            this.zone.run(() => {

              this.mensagemSucesso = [];

              this.cdr.detectChanges();

            });

          }, 3000);

        });

      },

      // =========================
      // ERRO
      // =========================

      error: (err: any) => {

        this.zone.run(() => {

          this.carregando = false;

          this.mensagemSucesso = [];

          this.mensagemErro = [
            err?.error?.message ??
            err?.error?.mensagem ??
            'Erro ao atualizar status.'
          ];

          this.cdr.markForCheck();

          setTimeout(() => {

            this.zone.run(() => {

              this.cdr.detectChanges();

            });

          }, 0);

        });

      }

    });
}
  ngOnInit(): void {

    this.filtro = {
      periodo: null,
      atribuicao: null,
      pessoaId: null,
      tipo: null,
      status: null
    };

    this.carregarKanban();
  }
  carregarKanban(): void {

    this.kanbanService.consultar().subscribe({
      next: (res) => {

        const colunas = res
          .filter(c => c.status !== 4)
          .map(card => ({
            ...card,
            prioridade: card.prioridade ?? null,

            // 🔥 NORMALIZA TIPO AQUI
            tipo: (card.tipo ?? '').toString().trim().toLowerCase()
          }))
          .filter(c => c.cards.length > 0);

        this.colunasOriginais = structuredClone(colunas);

        // 🔥 força microtask para garantir render Angular
        setTimeout(() => {
          this.aplicarFiltro();
          this.cdr.detectChanges();
        });

      }
    });
  }
  getStatusLabel(status: number): string {
    switch (status) {
      case 1: return 'A Fazer';
      case 2: return 'Em Andamento';
      case 3: return 'Concluído';
      case 4: return 'Cancelado';
      default: return '---';
    }
  }
  getModalidadeLabel(status: number): string {
    switch (status) {
      case 1: return 'Presencial';
      case 2: return 'Online';
      case 3: return 'Hibrido ';
      case 4: return 'Nao se aplica';
      default: return '---';
    }
  }
  getMudancas(h: any): { campo: string, antes: any, depois: any }[] {
    if (!h.antes || !h.depois) return [];

    const mudancas: any[] = [];

    Object.keys(h.depois).forEach(key => {
      const antes = h.antes[key];
      const depois = h.depois[key];

      if (JSON.stringify(antes) !== JSON.stringify(depois)) {
        mudancas.push({ campo: key, antes, depois });
      }
    });

    return mudancas;
  }

  formatarCampo(campo: string): string {
    const map: any = {
      Titulo: 'Título',
      DataInicial: 'Data Inicial',
      DataFinal: 'Data Final',
      HoraInicial: 'Hora Inicial',
      HoraFinal: 'Hora Final',
      DiaInteiro: 'Dia Inteiro',
      Endereco: 'Endereço',
      Observacao: 'Observação',
      Modalidade: 'Modalidade',
      StatusGeralKanban: 'Status',
      Responsaveis: 'Responsáveis'
    };

    return map[campo] || campo;
  }

  formatarValor(valor: any, campo: string): string {

    if (valor === null || valor === undefined) return '-';

    // ARRAY (Responsáveis)
    if (Array.isArray(valor)) {
      return valor.join(', ');
    }

    // BOOLEAN
    if (typeof valor === 'boolean') {
      return valor ? 'Sim' : 'Não';
    }

    // STATUS
    if (campo === 'StatusGeralKanban') {
      return this.getStatusLabel(valor);
    }
    // 🔥 MODALIDADE (AQUI)
    if (campo === 'Modalidade') {
      return this.getModalidadeLabel(valor);
    }
    // DATA
    if (campo.toLowerCase().includes('data')) {
      return new Date(valor).toLocaleDateString('pt-BR');
    }

    // HORA
    if (campo.toLowerCase().includes('hora')) {
      return valor;
    }

    return valor.toString();
  }
selecionarCard(
  card: any
): void {

  // =========================
  // LIMPA MENSAGENS
  // =========================

  this.mensagemSucessoAtual = null;
  this.mensagemErroAtual = null;

  this.comentarios = [];
  this.novoComentario = '';

  // =========================
  // CARD
  // =========================

  this.cardSelecionado = {
    ...card
  };

  this.cardIdSelecionado =
    card.id;

  // =========================
  // LOADING DO MODAL
  // =========================

  this.isLoadingDetalhe = true;

  this.cdr.detectChanges();

  // =========================
  // ABRIR MODAL
  // =========================

  const modalElement =
    document.getElementById(
      'modalDetalhes'
    );

  if (!modalElement) {

    console.error(
      'Modal modalDetalhes não encontrado.'
    );

    this.isLoadingDetalhe = false;

    return;
  }

  this.modalInstance =
    bootstrap.Modal
      .getOrCreateInstance(
        modalElement
      );

  // aguarda Angular renderizar
  // o estado de carregamento
  setTimeout(() => {

    this.modalInstance.show();

  }, 0);

  // =========================
  // NORMALIZA TIPO
  // =========================

  const tipo =
    (card.tipo ?? '')
      .toString()
      .trim()
      .toLowerCase();

  // =========================
  // HISTÓRICO
  // =========================

  this.carregarHistorico(
    card
  );

  // =========================
  // DETALHES
  // =========================

  this.kanbanService
    .obterDetalhes(
      card.id,
      tipo
    )
    .subscribe({

      // =========================
      // SUCESSO
      // =========================

      next: (res) => {

        this.zone.run(() => {

          this.cardSelecionado = {
            ...res,

            // mantém o tipo
            tipo:
              tipo,

            // mantém informações
            // recebidas pelo Kanban
            vinculoDescricao:
              res.vinculoDescricao ??
              card.vinculoDescricao,

            tipoVinculo:
              res.tipoVinculo ??
              card.tipoVinculo,

            responsaveis:
              res.responsaveis ??
              [],

            etiquetas:
              res.etiquetas ??
              []
          };

          this.isLoadingDetalhe =
            false;

          this.carregarComentarios();

          this.cdr.markForCheck();

          setTimeout(() => {

            this.cdr.detectChanges();

          }, 0);

        });

      },

      // =========================
      // ERRO
      // =========================

      error: (err) => {

        this.zone.run(() => {

          console.error(
            'Erro ao carregar detalhes:',
            err
          );

          this.isLoadingDetalhe =
            false;

          this.mensagemErroAtual =
            err?.error?.message ??
            err?.error?.mensagem ??
            'Erro ao carregar os detalhes.';

          this.cdr.detectChanges();

        });

      }

    });
}
  carregarHistorico(card: any) {

    console.log('CARD RECEBIDO:', card);
    console.log('TIPO:', card.tipo);

    const entidade =
      card.tipo?.toLowerCase?.() === 'evento'
        ? TipoEntidadeEnum.Evento
        : TipoEntidadeEnum.Tarefa;

    console.log('ENTIDADE ENVIADA:', entidade);

    this.historicoService
      .ConsultarHistorico(entidade, card.id)
      .subscribe({
        next: (res) => {
          console.log('HISTÓRICO RECEBIDO:', res);
          this.historico = (res ?? []).map(h => ({
            ...h,
            antes: h.dadosAntes ? JSON.parse(h.dadosAntes) : null,
            depois: h.dadosDepois ? JSON.parse(h.dadosDepois) : null
          }));
          this.cdr.detectChanges();
        },
        error: (err) => {
          console.error('ERRO HISTÓRICO:', err);
        }
      });
  }
  adicionarComentario() {

    if (!this.novoComentario?.trim()) return;

const request = {

  tarefaId:
    this.cardSelecionado.tipo === 'tarefa'
      ? this.cardSelecionado.id
      : null,

  eventoId:
    this.cardSelecionado.tipo === 'evento'
      ? this.cardSelecionado.id
      : null,

  texto:
    this.novoComentario
};

    this.comentarioService.criarComentario(request).subscribe({
      next: (res) => {

        this.novoComentario = '';

        // 🔥 AQUI É O SEGREDO
        this.mensagemSucessoAtual =
          res?.message ?? 'Comentário cadastrado com sucesso';

        this.mensagemErroAtual = null;

        this.carregarComentarios();

        this.cdr.detectChanges();

        // auto remove
        setTimeout(() => {
          this.mensagemSucessoAtual = null;
          this.cdr.detectChanges();
        }, 3000);
      },
      error: () => {
        this.mensagemErroAtual = 'Erro ao cadastrar comentário';
      }
    });
  }
 carregarComentarios(): void {

  if (!this.cardSelecionado) {
    return;
  }

  const params: any = {};

  const tipo =
    (this.cardSelecionado.tipo ?? '')
      .toString()
      .trim()
      .toLowerCase();

  if (tipo === 'tarefa') {

    params.tarefaId =
      this.cardSelecionado.id;
  }

  if (tipo === 'evento') {

    params.eventoId =
      this.cardSelecionado.id;
  }

  this.comentarioService
    .obterComentario(params)
    .subscribe({

      next: (res) => {

        this.comentarios =
          res ?? [];

        this.cdr.detectChanges();

      }

    });
}
  editar(id: string, tipo: string) {

    const tipoNormalizado = tipo?.toLowerCase();

    console.log('TIPO RECEBIDO:', tipo);
    console.log('TIPO NORMALIZADO:', tipoNormalizado);

    const modalElement = document.getElementById('modalDetalhes');

    if (modalElement) {
      const modal = (window as any).bootstrap?.Modal.getInstance(modalElement);
      modal?.hide();
    }

    document.body.classList.remove('modal-open');
    document.body.style.overflow = '';
    document.body.style.paddingRight = '';
    document.querySelectorAll('.modal-backdrop').forEach(el => el.remove());

    setTimeout(() => {

      if (tipoNormalizado === 'tarefa') {
        this.router.navigate(['/admin/editar-tarefa', id]);
      } else {
        this.router.navigate(['/admin/editar-evento', id]);
      }

    }, 200);
  } getTipoVinculoLabel(tipo?: number | null): string {
    switch (tipo) {
      case 1: return 'Processo';
      case 2: return 'Caso';
      case 3: return 'Atendimento';
      default: return '';
    }
  }
drop(
  event: CdkDragDrop<any[]>,
  colunaDestino: any
): void {

  const card =
    event.item.data;

  // =========================
  // MESMA COLUNA
  // =========================

  if (
    event.previousContainer ===
    event.container
  ) {

    moveItemInArray(
      event.container.data,
      event.previousIndex,
      event.currentIndex
    );

    return;
  }

  // =========================
  // MOVE VISUALMENTE
  // =========================

  transferArrayItem(
    event.previousContainer.data,
    event.container.data,
    event.previousIndex,
    event.currentIndex
  );

  const novoStatus =
    colunaDestino.status;

  // =========================
  // BACKEND
  // =========================

  this.kanbanService
    .atualizarStatus(
      card.id,
      novoStatus
    )
    .subscribe({

      next: () => {

        // Atualiza status local
        card.status =
          novoStatus;

        // IMPORTANTE:
        // atualiza também a fonte usada pelos filtros
        this.colunasOriginais =
          structuredClone(
            this.colunas
          );

        this.cdr.detectChanges();
      },

      error: () => {

        // Recarrega do servidor
        // caso a alteração falhe
        this.carregarKanban();
      }

    });
}
}