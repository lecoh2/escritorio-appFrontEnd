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
  Router
} from '@angular/router';

import {
  EtiquetaService
} from '../../../../../core/services/etiqueta.service';


@Component({
  selector: 'app-cadastrar-etiqueta',
  standalone: false,
  templateUrl:
    './cadastrar-etiqueta.html',
  styleUrl:
    './cadastrar-etiqueta.css'
})
export class CadastrarEtiqueta {

  // =========================
  // INJEÇÕES
  // =========================

  private builder =
    inject(FormBuilder);

  private etiquetaService =
    inject(EtiquetaService);

  private router =
    inject(Router);

  private cdr =
    inject(ChangeDetectorRef);

  private zone =
    inject(NgZone);


  // =========================
  // UI
  // =========================

  carregando =
    false;

  mensagemErro:
    string[] = [];

  mensagemSucesso:
    string[] = [];


  // =========================
  // FORM
  // =========================

  form =
    this.builder.group({

      nome: [
        '',
        [
          Validators.required,
          Validators.maxLength(200)
        ]
      ],

      cor: [
        '#0d6efd',
        [
          Validators.required
        ]
      ]

    });


  // =========================
  // SUBMIT
  // =========================

  onSubmit(): void {

    this.mensagemErro = [];

    this.mensagemSucesso = [];


    if (this.form.invalid) {

      this.form.markAllAsTouched();

      return;
    }


    this.carregando =
      true;


    const request = {

      nome:
        this.form.value.nome!,

      cor:
        this.form.value.cor!

    };


    this.etiquetaService
      .cadastrarEtiqueta(request)
      .subscribe({

        next: (res) => {

          this.zone.run(() => {

            this.carregando =
              false;

            this.mensagemErro =
              [];

            this.mensagemSucesso = [
              res.message ??
              'Etiqueta cadastrada com sucesso.'
            ];

            this.cdr
              .markForCheck();


            setTimeout(() => {

              this.cdr
                .detectChanges();

            }, 0);


            setTimeout(() => {

              this.router.navigate([
                '/admin/consultar-etiquetas'
              ]);

            }, 2000);

          });

        },


        error: (
          err: HttpErrorResponse
        ) => {

          this.tratarErro(err);

        }

      });
  }


  // =========================
  // TRATAR ERRO
  // =========================

  private tratarErro(
    err: HttpErrorResponse
  ): void {

    this.zone.run(() => {

      this.carregando =
        false;

      this.mensagemSucesso =
        [];

      const e =
        err.error;


      if (
        Array.isArray(
          e?.errors
        )
      ) {

        this.mensagemErro =
          e.errors
            .map(
              (x: any) =>
                x.erro ??
                x.errorMessage ??
                x.message
            )
            .filter(
              (x: any) =>
                !!x
            );

      }

      else if (
        e?.message
      ) {

        this.mensagemErro = [
          e.message
        ];

      }

      else if (
        e?.mensagem
      ) {

        this.mensagemErro = [
          e.mensagem
        ];

      }

      else {

        this.mensagemErro = [
          'Erro inesperado.'
        ];

      }


      this.cdr
        .markForCheck();


      setTimeout(() => {

        this.zone.run(() => {

          this.cdr
            .detectChanges();

        });

      }, 0);

    });
  }
}