import {
  ChangeDetectorRef,
  Component,
  inject,
  NgZone
} from '@angular/core';

import {
  FormBuilder,
  Validators
} from '@angular/forms';

import {
  HttpErrorResponse
} from '@angular/common/http';

import {
  CategoriaFinanceiraService
} from '../../../../../core/services/categoria-financeira.service';

import {
  CategoriaFinanceiraRequest
} from '../../../../../core/models/categoria-financeira/categoria-financeira-request';

@Component({
  selector: 'app-cadastrar-categoria-financeira',
  standalone: false,
  templateUrl: './cadastrar-categoria-financeira.html',
  styleUrl: './cadastrar-categoria-financeira.css'
})
export class CadastrarCategoriaFinanceira {

  private builder =
    inject(FormBuilder);

  private categoriaFinanceiraService =
    inject(CategoriaFinanceiraService);

  private cdr =
    inject(ChangeDetectorRef);

  private zone =
    inject(NgZone);

  carregando = false;

  mensagemErro: string[] = [];

  mensagemSucesso: string[] = [];


  form = this.builder.group({

    nome: [
      '',
      [
        Validators.required,
        Validators.maxLength(150)
      ]
    ],

    descricao: [
      '',
      Validators.maxLength(500)
    ],

    tipo: [
      null as number | null,
      Validators.required
    ]

  });


  get podeEnviar(): boolean {

    return (
      this.form.valid &&
      !this.carregando
    );
  }


  // =====================================================
  // SALVAR
  // =====================================================

  onSubmit(): void {

    this.mensagemErro = [];

    this.mensagemSucesso = [];

    if (
      this.form.invalid
    ) {

      this.form.markAllAsTouched();

      return;
    }

    this.carregando = true;

    this.cdr.detectChanges();


    const request:
      CategoriaFinanceiraRequest = {

      nome:
        this.form.value.nome!.trim(),

      descricao:
        this.form.value.descricao?.trim() ?? '',

      tipo:
        this.form.value.tipo!

    };


    this.categoriaFinanceiraService
      .cadastrarCategoriaFinanceira(
        request
      )
      .subscribe({

        next: (response) => {

          this.zone.run(() => {

            this.mensagemSucesso = [
              response.message ??
              'Categoria financeira cadastrada com sucesso.'
            ];

            this.mensagemErro = [];

            this.form.reset({
              nome: '',
              descricao: '',
              tipo: null
            });

            this.carregando = false;

            this.cdr.detectChanges();

          });

        },

        error: (
          err: HttpErrorResponse
        ) => {

          this.tratarErro(
            err
          );

        }

      });

  }


  // =====================================================
  // TRATAR ERRO
  // =====================================================

  private tratarErro(
    err: HttpErrorResponse
  ): void {

    this.zone.run(() => {

      this.mensagemErro = [];

      this.mensagemSucesso = [];

      const e =
        err?.error;


      if (
        e?.errors
      ) {

        for (
          const key in e.errors
        ) {

          this.mensagemErro.push(
            ...e.errors[key]
          );
        }

      } else if (
        e?.mensagem
      ) {

        this.mensagemErro.push(
          e.mensagem
        );

      } else if (
        e?.message
      ) {

        this.mensagemErro.push(
          e.message
        );

      } else {

        this.mensagemErro.push(
          'Erro inesperado.'
        );

      }

      this.carregando = false;

      this.cdr.detectChanges();

    });

  }

}