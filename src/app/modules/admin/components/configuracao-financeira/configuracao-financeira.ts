import {
  ChangeDetectorRef,
  Component,
  inject,
  NgZone,
  OnInit
} from '@angular/core';

import {
  FormBuilder,
  Validators
} from '@angular/forms';

import {
  finalize
} from 'rxjs';
import { ConfiguracaoFinanceiraService } from '../../../../core/services/configuracao-financeira.service';
import { ConfiguracaoFinanceiraRequest } from '../../../../core/models/configuracao-financeira/configuracao-financeira-request';


@Component({
  selector: 'app-configuracao-financeira',
  templateUrl: './configuracao-financeira.html',
  styleUrl: './configuracao-financeira.css',
  standalone: false
})
export class ConfiguracaoFinanceira
implements OnInit {

  private service =
    inject(ConfiguracaoFinanceiraService);

  private builder =
    inject(FormBuilder);

  private zone =
    inject(NgZone);

  private cdr =
    inject(ChangeDetectorRef);

  carregando = false;

  mensagemErro: string[] = [];
  mensagemSucesso: string[] = [];

  form = this.builder.group({

metaMensal: [
  0,
  [
    Validators.required,
    Validators.min(0)
  ]
],

metaAnual: [
  0,
  [
    Validators.required,
    Validators.min(0)
  ]
]

  });

  ngOnInit(): void {

    this.carregar();

  }

  carregar(): void {

    this.carregando = true;

    this.service
      .obterConfiguracao()
      .pipe(
        finalize(() => {

          this.zone.run(() => {

            this.carregando = false;
            this.cdr.detectChanges();

          });

        })
      )
      .subscribe({

        next: (response) => {

          this.form.patchValue({

            metaMensal:
              response.metaMensal,

            metaAnual:
              response.metaAnual

          });

        },

        error: () => {

          this.mensagemErro = [
            'Erro ao carregar configuração financeira.'
          ];

        }

      });

  }

  onSubmit(): void {

    this.mensagemErro = [];
    this.mensagemSucesso = [];

    if (this.form.invalid) {

      this.form.markAllAsTouched();
      return;

    }

    const request:
      ConfiguracaoFinanceiraRequest = {

      metaMensal:
        Number(
          this.form.value.metaMensal
        ),

      metaAnual:
        Number(
          this.form.value.metaAnual
        )

    };

    this.zone.run(() => {

      this.carregando = true;
      this.cdr.detectChanges();

    });

    this.service
      .salvarConfiguracao(request)
      .pipe(
        finalize(() => {

          this.zone.run(() => {

            this.carregando = false;
            this.cdr.detectChanges();

          });

        })
      )
      .subscribe({

        next: () => {

          this.zone.run(() => {

            this.mensagemSucesso = [
              'Configuração financeira salva com sucesso.'
            ];

            this.cdr.detectChanges();

          });

        },

        error: () => {

          this.zone.run(() => {

            this.mensagemErro = [
              'Erro ao salvar configuração financeira.'
            ];

            this.cdr.detectChanges();

          });

        }

      });

  }
  onMoneyInput(
  event: any,
  campo: 'metaMensal' | 'metaAnual'
): void {

  let value =
    event.target.value.replace(/\D/g, '');

  if (!value) {

    this.form
      .get(campo)
      ?.setValue(0, {
        emitEvent: false
      });

    return;
  }

  const numericValue =
    Number(value);

  const valor =
    numericValue / 100;

  const formatted =
    new Intl.NumberFormat(
      'pt-BR',
      {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
      }
    ).format(valor);

  this.form
    .get(campo)
    ?.setValue(valor, {
      emitEvent: false
    });

  event.target.value =
    formatted;
}
usarMetaAutomatica(): void {

  this.mensagemErro = [];
  this.mensagemSucesso = [];

  this.zone.run(() => {

    this.carregando = true;

    this.cdr.detectChanges();

  });


  this.service
    .usarAutomatica()
    .subscribe({

      next: (response: any) => {

        this.zone.run(() => {

          // =========================
          // ATUALIZA FORMULÁRIO
          // =========================

          this.form.patchValue({
            metaMensal: 0
          });


          // =========================
          // MENSAGEM
          // =========================

          this.mensagemSucesso = [
            response?.message ??
            'Meta automática ativada com sucesso.'
          ];


          // =========================
          // LIBERA SPINNER
          // =========================

          this.carregando = false;

          this.cdr.detectChanges();

        });

      },


      error: (err: any) => {

        console.error(
          'Erro ao ativar meta automática:',
          err
        );


        this.zone.run(() => {

          this.mensagemErro = [
            err?.error?.message ??
            err?.error?.mensagem ??
            'Erro ao ativar a meta automática.'
          ];


          // =========================
          // LIBERA SPINNER
          // =========================

          this.carregando = false;

          this.cdr.detectChanges();

        });

      },


      complete: () => {

        this.zone.run(() => {

          this.carregando = false;

          this.cdr.detectChanges();

        });

      }

    });

}
}