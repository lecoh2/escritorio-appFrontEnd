import {
  Component,
  inject,
  ElementRef,
  Renderer2,
  AfterViewInit,
  OnInit,
  OnDestroy,
  ChangeDetectorRef
} from '@angular/core';

import { Router } from '@angular/router';

import Swal from 'sweetalert2';

import { AuthHelper } from '../../../../core/helpers/auth.helper';

import { UsuarioService } from '../../../../core/services/usuario.service';

import { environment } from '../../../../../environments/environment.development';

import { Notificacao } from '../../../../core/models/notficacao/notificacao';

import { NotificacoService } from '../../../../core/services/notificacao.service';

import { NotificacaoSignalRService } from '../../../../core/services/notificacao-signalr.service';

import { AccessService } from '../../../../core/services/access.service';

@Component({
  selector: 'app-navbar',
  standalone: false,
  templateUrl: './navbar.html',
  styleUrl: './navbar.css'
})
export class Navbar
  implements OnInit, AfterViewInit, OnDestroy {

  // =========================
  // INJEÇÕES
  // =========================

  private el =
    inject(ElementRef);

  private renderer =
    inject(Renderer2);

  private usuarioService =
    inject(UsuarioService);

  private cdr =
    inject(ChangeDetectorRef);

  private notificacaoService =
    inject(NotificacoService);

  private notificacaoSignalR =
    inject(NotificacaoSignalRService);

  authHelper =
    inject(AuthHelper);

  constructor(
    public access: AccessService,
    private router: Router
  ) {
  }

  // =========================
  // NOTIFICAÇÕES
  // =========================

  notificacoes: Notificacao[] =
    [];

  // =========================
  // USUÁRIO
  // =========================

  nomeUsuario: string =
    'Usuário';

  usuarioLogado: any =
    null;

  fotoUsuario: string =
    'assets/appdeslandes/img/default-avatar.jpg';

  // =====================================================
  // INIT
  // =====================================================

  ngOnInit(): void {

    // =========================
    // USUÁRIO
    // =========================

    this.carregarUsuario();

    // =========================
    // NOTIFICAÇÕES INICIAIS
    // =========================

    this.carregarNotificacoes();

    // =========================
    // SIGNALR
    // =========================

    const usuario =
      this.authHelper.get();

    if (usuario?.idUsuario) {

      this.notificacaoSignalR
        .iniciar(
          usuario.idUsuario,

          (data: any) => {

            console.log(
              '🔔 SignalR recebido:',
              data
            );

            // =========================
            // RECARREGA DO BANCO
            // =========================
            //
            // Não adicionamos manualmente
            // com id vazio.
            //
            // Assim recebemos:
            // Id real
            // Data real
            // Tipo
            // EntidadeId
            // Link
            // etc.
            // =========================

            this.carregarNotificacoes();

            // =========================
            // TOAST
            // =========================

            Swal.fire({
              toast: true,

              position:
                'top-end',

              iconHtml:
                '<i class="fas fa-bell"></i>',

              title:
                data.titulo,

              text:
                data.mensagem,

              showConfirmButton:
                false,

              timer:
                6000,

              timerProgressBar:
                true,

              background:
                '#1f2937',

              color:
                '#ffffff',

              customClass: {
                popup:
                  'notificacao-toast',

                icon:
                  'notificacao-toast-icone',

                title:
                  'notificacao-toast-titulo',

                htmlContainer:
                  'notificacao-toast-mensagem',

                timerProgressBar:
                  'notificacao-toast-progress'
              },

              showClass: {
                popup:
                  'animate__animated animate__fadeInRight animate__faster'
              },

              hideClass: {
                popup:
                  'animate__animated animate__fadeOutRight animate__faster'
              }
            });

            this.cdr
              .detectChanges();
          }
        );
    }

    // =========================
    // NOTIFICAÇÃO LIDA
    // SIGNALR
    // =========================

    this.notificacaoSignalR
      .onNotificacaoLida(
        (id: string) => {

          console.log(
            '🔔 Notificação marcada como lida via SignalR:',
            id
          );

          const notificacao =
            this.notificacoes
              .find(
                x =>
                  x.id === id
              );

          if (notificacao) {

            notificacao.lida =
              true;

            this.cdr
              .detectChanges();
          }
        }
      );
  }

  // =====================================================
  // CARREGAR NOTIFICAÇÕES
  // =====================================================

  carregarNotificacoes(): void {

    const usuario =
      this.authHelper.get();

    console.log(
      '👤 USUÁRIO LOGADO:',
      usuario
    );

    if (!usuario?.idUsuario) {

      console.warn(
        'Usuário sem idUsuario.'
      );

      return;
    }

    console.log(
      '🔔 Buscando notificações do usuário:',
      usuario.idUsuario
    );

    this.notificacaoService
      .getNotificacoes(
        usuario.idUsuario
      )
      .subscribe({

        next: (
          res: Notificacao[]
        ) => {

          console.log(
            '🔔 NOTIFICAÇÕES API:',
            res
          );

          this.notificacoes =
            res ?? [];

          this.cdr
            .detectChanges();
        },

        error: (
          err
        ) => {

          console.error(
            '❌ Erro ao buscar notificações:',
            err
          );

          this.notificacoes =
            [];

          this.cdr
            .detectChanges();
        }

      });
  }

  // =====================================================
  // MARCAR COMO LIDA
  // =====================================================

  marcarComoLida(
    item: Notificacao
  ): void {

    if (!item?.id) {

      console.warn(
        'Notificação sem ID.'
      );

      return;
    }

    this.notificacaoService
      .marcarComoLida(
        item.id
      )
      .subscribe({

        next: () => {

          // =========================
          // REMOVE DA LISTA
          // =========================

          this.notificacoes =
            this.notificacoes
              .filter(
                x =>
                  x.id !== item.id
              );

          this.cdr
            .detectChanges();

          Swal.fire({
            toast: true,

            position:
              'top-end',

            icon:
              'success',

            title:
              'Marcada como lida',

            showConfirmButton:
              false,

            timer:
              1800,

            timerProgressBar:
              true,

            background:
              '#1f2937',

            color:
              '#fff',

            iconColor:
              '#22c55e'
          });
        },

        error: (
          err
        ) => {

          console.error(
            'Erro ao marcar como lida:',
            err
          );

        }

      });
  }

  // =====================================================
  // TOTAL NÃO LIDAS
  // =====================================================

  get naoLidas(): number {

    return (
      this.notificacoes ??
      []
    )
      .filter(
        x =>
          !x.lida
      )
      .length;
  }

  // =====================================================
  // USUÁRIO
  // =====================================================

  private carregarUsuario(): void {

    this.fotoUsuario =
      'assets/appdeslandes/img/default-avatar.jpg';

    this.usuarioLogado =
      this.authHelper.get();

    this.nomeUsuario =
      this.usuarioLogado
        ?.nomeUsuario
      ??
      'Usuário';

    if (
      !this.usuarioLogado
        ?.idUsuario
    ) {

      return;
    }

    this.usuarioService
      .consultarPerfilUsuarioPorId(
        this.usuarioLogado.idUsuario
      )
      .subscribe({

        next: (
          usuario
        ) => {

          const foto =
            usuario
              ?.foto
              ?.fileUrl;

          this.fotoUsuario =
            foto
              ? `${environment.apiDeslandes}${foto}`
              : 'assets/appdeslandes/img/default-avatar.jpg';

          this.cdr
            .detectChanges();
        },

        error: (
          err
        ) => {

          console.error(
            'Erro ao carregar foto:',
            err
          );

          this.fotoUsuario =
            'assets/appdeslandes/img/default-avatar.jpg';

          this.cdr
            .detectChanges();
        }

      });
  }

  // =====================================================
  // SIDEBAR
  // =====================================================

  ngAfterViewInit(): void {

    const sidebar =
      document.querySelector(
        '.sidebar'
      );

    const toggleBtn =
      this.el
        .nativeElement
        .querySelector(
          '.sidebar-toggle'
        );

    if (
      sidebar &&
      toggleBtn
    ) {

      this.renderer
        .listen(
          toggleBtn,
          'click',
          () => {

            sidebar.classList
              .toggle(
                'collapsed'
              );

            window.dispatchEvent(
              new Event(
                'resize'
              )
            );

          }
        );
    }
  }

  // =====================================================
  // TEMA
  // =====================================================

  toggleTheme(): void {

    const themeKey =
      'appstack-config-theme';

    const currentTheme =
      localStorage.getItem(
        themeKey
      );

    const newTheme =
      currentTheme === 'dark'
        ? 'default'
        : 'dark';

    document
      .documentElement
      .setAttribute(
        'data-bs-theme',
        newTheme
      );

    document
      .documentElement
      .setAttribute(
        'data-sidebar-theme',
        newTheme
      );

    localStorage.setItem(
      themeKey,
      newTheme
    );

    document.dispatchEvent(
      new Event(
        'DOMContentLoaded',
        {
          bubbles:
            true,

          cancelable:
            true
        }
      )
    );
  }

  // =====================================================
  // LOGOUT
  // =====================================================

  logout(): void {

    const confirmar =
      confirm(
        `Deseja realmente sair do sistema, ${this.nomeUsuario}?`
      );

    if (!confirmar) {

      return;
    }

    this.usuarioService
      .logout()
      .subscribe({

        next: async () => {

          // =========================
          // PARA SIGNALR
          // =========================

          try {

            await this
              .notificacaoSignalR
              .parar();

          }
          catch (err) {

            console.error(
              'Erro ao parar SignalR:',
              err
            );

          }

          // =========================
          // REMOVE LOGIN
          // =========================

          this.authHelper
            .remove();

          // =========================
          // LOGIN
          // =========================

          this.router.navigate([
            '/login/autenticar-usuario'
          ]);
        },

        error: async (
          err
        ) => {

          console.error(
            'Erro ao encerrar sessão:',
            err
          );

          try {

            await this
              .notificacaoSignalR
              .parar();

          }
          catch (signalRError) {

            console.error(
              'Erro ao parar SignalR:',
              signalRError
            );

          }

          /*
           * Mesmo que o backend falhe,
           * remove os dados locais.
           */

          this.authHelper
            .remove();

          this.router.navigate([
            '/login/autenticar-usuario'
          ]);
        }

      });
  }

  // =====================================================
  // DESTROY
  // =====================================================

  ngOnDestroy(): void {

    console.log(
      'NAVBAR DESTRUÍDA'
    );

    this.notificacaoSignalR
      .parar()
      .catch(
        err => {

          console.error(
            'Erro ao desconectar SignalR:',
            err
          );

        }
      );
  }
}