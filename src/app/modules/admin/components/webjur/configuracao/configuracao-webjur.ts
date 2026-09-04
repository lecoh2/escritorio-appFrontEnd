import {
  ChangeDetectorRef,
  Component,
  inject,
  OnInit
} from '@angular/core';

import {
  FormBuilder,
  Validators
} from '@angular/forms';

import {
  HttpErrorResponse
} from '@angular/common/http';

import {
  finalize
} from 'rxjs';

import {
  Router
} from '@angular/router';

import {
  WebJurConfiguracaoService
} from '../../../../../core/services/webjur-configuracao.service';
import { WebJurConfiguracaoResponse } from '../../../../../core/models/webjur/webJur-configuracao-response';
import { WebJurConfiguracaoRequest } from '../../../../../core/models/webjur/webJur-configuracao-request';
import { WebJurConfiguracaoEditarRequest } from '../../../../../core/models/webjur/webJur-configuracao-editar-request';


@Component({
  selector: 'app-configuracao-webjur',
  standalone: false,
  templateUrl: './configuracao-webjur.html',
  styleUrls: ['./configuracao-webjur.css']
})
export class ConfiguracaoWebjur
  implements OnInit {

  // =====================================================
  // SERVICES
  // =====================================================

  private readonly configuracaoService =
    inject(WebJurConfiguracaoService);

  private readonly builder =
    inject(FormBuilder);

  private readonly router =
    inject(Router);

  private readonly cd =
    inject(ChangeDetectorRef);
    mensagemErro: string[] = [];
mensagemSucesso: string[] = [];

private cdr =
  inject(ChangeDetectorRef);
  // =====================================================
  // ESTADOS
  // =====================================================

  carregando = false;

  salvando = false;

  configuracao:
    WebJurConfiguracaoResponse | null = null;

  modoEdicao = false;

  mostrarSenha = false;



  // =====================================================
  // FORM
  // =====================================================

  form = this.builder.group({

    usuario: [
      '',
      [
        Validators.required,
        Validators.maxLength(200)
      ]
    ],

    senha: [
      ''
    ],

    codGrupo: [
      0,
      [
        Validators.required,
        Validators.min(0)
      ]
    ],

    oab: [
      '',
      [
        Validators.maxLength(30)
      ]
    ],

    uf: [
      '',
      [
        Validators.maxLength(2)
      ]
    ],

    sincronizacaoAutomatica: [
      true
    ],

    ativo: [
      true
    ]
  });

  // =====================================================
  // INIT
  // =====================================================

  ngOnInit(): void {

    this.carregarConfiguracao();
  }

  // =====================================================
  // GETTERS
  // =====================================================

  get podeEnviar(): boolean {

    return (
      this.form.valid &&
      !this.carregando &&
      !this.salvando
    );
  }

  get senhaConfigurada(): boolean {

    return (
      this.configuracao
        ?.senhaConfigurada
      ?? false
    );
  }

  get tituloTela(): string {

    return this.modoEdicao
      ? 'Configuração WebJur'
      : 'Configurar WebJur';
  }

  get textoBotaoSalvar(): string {

    if (this.salvando) {
      return 'Salvando...';
    }

    return this.modoEdicao
      ? 'Salvar Alterações'
      : 'Configurar WebJur';
  }

  // =====================================================
  // CARREGAR CONFIGURAÇÃO
  // =====================================================

  carregarConfiguracao(): void {

    this.carregando = true;

    this.mensagemErro = [];

    this.configuracaoService
      .obter()
      .pipe(
        finalize(() => {

          this.carregando = false;

          this.cd.detectChanges();
        })
      )
      .subscribe({

        next: response => {

          this.configuracao =
            response;

          this.modoEdicao =
            true;

          this.form.patchValue({

            usuario:
              response.usuario ?? '',

            senha:
              '',

            codGrupo:
              response.codGrupo ?? 0,

            oab:
              response.oab ?? '',

            uf:
              response.uf ?? '',

            sincronizacaoAutomatica:
              response.sincronizacaoAutomatica,

            ativo:
              response.ativo
          });

          this.atualizarValidacaoSenha();
        },

        error: (
          error: HttpErrorResponse
        ) => {

          /*
           * 404 = este escritório ainda
           * não possui configuração WebJur.
           *
           * Não é erro funcional.
           */
          if (error.status === 404) {

            this.prepararNovoCadastro();

            return;
          }

          this.tratarErro(error);
        }
      });
  }

  // =====================================================
  // NOVO CADASTRO
  // =====================================================

  private prepararNovoCadastro(): void {

    this.configuracao =
      null;

    this.modoEdicao =
      false;

    this.mostrarSenha =
      false;

    this.form.reset({

      usuario:
        '',

      senha:
        '',

      codGrupo:
        0,

      oab:
        '',

      uf:
        '',

      sincronizacaoAutomatica:
        true,

      ativo:
        true
    });

    this.atualizarValidacaoSenha();
  }

  // =====================================================
  // SENHA
  // =====================================================

  private atualizarValidacaoSenha(): void {

    const senhaControl =
      this.form.get('senha');

    if (!senhaControl) {
      return;
    }

    /*
     * CADASTRO
     *
     * Senha obrigatória.
     */
    if (!this.modoEdicao) {

      senhaControl.setValidators([
        Validators.required
      ]);
    }

    /*
     * EDIÇÃO
     *
     * Senha opcional.
     *
     * Campo vazio =
     * mantém a senha atual.
     */
    else {

      senhaControl.clearValidators();
    }

    senhaControl
      .updateValueAndValidity({
        emitEvent: false
      });
  }

  alternarVisualizacaoSenha(): void {

    this.mostrarSenha =
      !this.mostrarSenha;
  }

  // =====================================================
  // UF
  // =====================================================

  formatarUf(): void {

    const control =
      this.form.get('uf');

    if (!control) {
      return;
    }

    const valor =
      control.value ?? '';

    control.setValue(
      valor
        .replace(
          /[^a-zA-Z]/g,
          ''
        )
        .substring(
          0,
          2
        )
        .toUpperCase(),
      {
        emitEvent: false
      }
    );
  }

  // =====================================================
  // SUBMIT
  // =====================================================

  onSubmit(): void {

    this.mensagemErro = [];

    this.mensagemSucesso = [];

    if (!this.podeEnviar) {

      this.form
        .markAllAsTouched();

      this.mensagemErro = [
        'Preencha corretamente os campos obrigatórios.'
      ];

      this.cd.detectChanges();

      return;
    }

    if (
      this.modoEdicao &&
      this.configuracao
    ) {

      this.editar();

      return;
    }

    this.cadastrar();
  }

  // =====================================================
  // CADASTRAR
  // =====================================================

  private cadastrar(): void {

    const value =
      this.form.getRawValue();

    const request:
      WebJurConfiguracaoRequest = {

      usuario:
        value.usuario
          ?.trim()
        ?? '',

      senha:
        value.senha
        ?? '',

      codGrupo:
        Number(
          value.codGrupo
          ?? 0
        ),

      oab:
        value.oab
          ?.trim()
        || null,

      uf:
        value.uf
          ?.trim()
          .toUpperCase()
        || null,

      sincronizacaoAutomatica:
        value
          .sincronizacaoAutomatica
        ?? true
    };

    this.salvando =
      true;

    this.configuracaoService
      .cadastrar(request)
      .pipe(
        finalize(() => {

          this.salvando =
            false;

          this.cd.detectChanges();
        })
      )
      .subscribe({

        next: response => {

          this.mensagemErro = [];

          this.mensagemSucesso = [
            response?.message ??
            'Configuração WebJur cadastrada com sucesso.'
          ];

          this.carregarConfiguracao();
        },

        error: (
          error: HttpErrorResponse
        ) => {

          this.tratarErro(error);
        }
      });
  }

  // =====================================================
  // EDITAR
  // =====================================================

  private editar(): void {

    if (!this.configuracao?.id) {
      return;
    }

    const value =
      this.form.getRawValue();

    const novaSenha =
      value.senha
        ?.trim();

    const request:
      WebJurConfiguracaoEditarRequest = {

      usuario:
        value.usuario
          ?.trim()
        ?? '',

      /*
       * Senha vazia:
       * backend mantém a existente.
       */
      senha:
        novaSenha
          ? value.senha
          : null,

      codGrupo:
        Number(
          value.codGrupo
          ?? 0
        ),

      oab:
        value.oab
          ?.trim()
        || null,

      uf:
        value.uf
          ?.trim()
          .toUpperCase()
        || null,

      ativo:
        value.ativo
        ?? true,

      sincronizacaoAutomatica:
        value
          .sincronizacaoAutomatica
        ?? true
    };

    this.salvando =
      true;

    this.configuracaoService
      .editar(
        this.configuracao.id,
        request
      )
      .pipe(
        finalize(() => {

          this.salvando =
            false;

          this.cd.detectChanges();
        })
      )
      .subscribe({

        next: response => {

          this.mensagemErro = [];

          this.mensagemSucesso = [
            response?.message ??
            'Configuração WebJur atualizada com sucesso.'
          ];

          /*
           * Nunca deixa senha
           * preenchida após salvar.
           */
          this.form
            .get('senha')
            ?.setValue('');

          this.mostrarSenha =
            false;

          this.carregarConfiguracao();
        },

        error: (
          error: HttpErrorResponse
        ) => {

          this.tratarErro(error);
        }
      });
  }

  // =====================================================
  // ATIVAR / DESATIVAR
  // =====================================================

  alterarStatus(): void {

    if (
      !this.configuracao?.id ||
      this.salvando
    ) {
      return;
    }

    const novoStatus =
      !this.configuracao.ativo;

    const operacao =
      novoStatus
        ? this.configuracaoService
            .ativar(
              this.configuracao.id
            )
        : this.configuracaoService
            .desativar(
              this.configuracao.id
            );

    this.salvando =
      true;

    this.mensagemErro = [];

    this.mensagemSucesso = [];

    operacao
      .pipe(
        finalize(() => {

          this.salvando =
            false;

          this.cd.detectChanges();
        })
      )
      .subscribe({

        next: response => {

          this.mensagemSucesso = [
            response?.message ??
            (
              novoStatus
                ? 'Integração WebJur ativada com sucesso.'
                : 'Integração WebJur desativada com sucesso.'
            )
          ];

          this.carregarConfiguracao();
        },

        error: (
          error: HttpErrorResponse
        ) => {

          this.tratarErro(error);
        }
      });
  }

  // =====================================================
  // VOLTAR
  // =====================================================

  voltar(): void {

    this.router.navigate([
      '/admin',
      'consultar-webjur'
    ]);
  }

  // =====================================================
  // ERROR
  // =====================================================

private tratarErro(
  err: HttpErrorResponse
): void {

  this.mensagemErro = [];

  const e =
    err?.error;

  if (e?.errors) {

    for (
      const key in e.errors
    ) {
      this.mensagemErro.push(
        ...e.errors[key]
      );
    }
  }

  else if (e?.mensagem) {

    this.mensagemErro.push(
      e.mensagem
    );
  }

  else if (e?.message) {

    this.mensagemErro.push(
      e.message
    );
  }

  else if (e?.Message) {

    this.mensagemErro.push(
      e.Message
    );
  }

  else if (e?.title) {

    this.mensagemErro.push(
      e.title
    );

    if (e?.detail) {
      this.mensagemErro.push(
        e.detail
      );
    }
  }

  else {

    this.mensagemErro.push(
      'Erro ao processar a configuração WebJur.'
    );
  }

  this.mensagemErro = [
    ...new Set(
      this.mensagemErro
    )
  ];

  this.carregando = false;
  this.salvando = false;

  this.cdr.detectChanges();

  console.log(
    'ERRO BACKEND:',
    e
  );
}
}