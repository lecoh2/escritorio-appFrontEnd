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

import { Router } from '@angular/router';

import {
  finalize,
  forkJoin
} from 'rxjs';

import { LicencaService } from '../../../../../core/services/licenca.service';
import { EscritorioService } from '../../../../../core/services/escritorio.service';

import { LicencaRequest } from '../../../../../core/models/licenca/licenca-request';
import { EscritorioResponse } from '../../../../../core/models/escritorio/escritorio-response';
import { TipoPlanoEnum } from '../../../../../core/models/enums/plano/tipo-plano-rnum';



@Component({
  selector: 'app-cadastrar-licenca',
  standalone: false,
  templateUrl: './cadastrar-licenca.html',
  styleUrls: ['./cadastrar-licenca.css']
})
export class CadastrarLicenca implements OnInit {

  // =========================
  // SERVICES
  // =========================

  private licencaService =
    inject(LicencaService);

  private escritorioService =
    inject(EscritorioService);

  private builder =
    inject(FormBuilder);

  private router =
    inject(Router);

  private cd =
    inject(ChangeDetectorRef);

  // =========================
  // ESTADOS
  // =========================

  carregando = false;

  carregandoConsulta = true;

  mensagemErro: string[] = [];

  mensagemSucesso: string[] = [];

  escritorios: EscritorioResponse[] = [];

  // =========================
  // ENUMS
  // =========================

  tipoPlanoEnum = TipoPlanoEnum;

  tiposPlano = [
    {
      id: TipoPlanoEnum.Basico,
      nome: 'Básico'
    },
    {
      id: TipoPlanoEnum.Profissional,
      nome: 'Profissional'
    },
    {
      id: TipoPlanoEnum.Empresarial,
      nome: 'Empresarial'
    }
  ];

  // =========================
  // FORMULÁRIO
  // =========================

  form = this.builder.group({
    escritorioId: [
      '',
      Validators.required
    ],

    dataInicio: [
      '',
      Validators.required
    ],

    dataVencimento: [
      '',
      Validators.required
    ],

    tipoPlano: [
      null as TipoPlanoEnum | null,
      Validators.required
    ],

    limiteUsuarios: [
      null as number | null,
      [
        Validators.required,
        Validators.min(1)
      ]
    ]
  });

  // =========================
  // VALIDAR BOTÃO
  // =========================

  get podeEnviar(): boolean {
    return (
      this.form.valid &&
      !this.carregando &&
      !this.carregandoConsulta
    );
  }

  // =========================
  // INIT
  // =========================

  ngOnInit(): void {
    this.carregarDadosIniciais();
  }

  // =========================
  // CARREGAR DADOS
  // =========================

  carregarDadosIniciais(): void {
    this.carregandoConsulta = true;

    this.mensagemErro = [];

    forkJoin({
      escritorios:
        this.escritorioService
          .consultarEscritorios()
    })
      .pipe(
        finalize(() => {
          this.carregandoConsulta = false;

          this.cd.detectChanges();
        })
      )
      .subscribe({
        next: (response) => {
          this.escritorios =
            response.escritorios ?? [];

          this.cd.detectChanges();
        },

        error: (e) => {
          this.tratarErro(e);
        }
      });
  }

  // =========================
  // VALIDAR DATAS
  // =========================

  validarDatas(): void {
    const dataInicio =
      this.form.get('dataInicio')?.value;

    const dataVencimento =
      this.form.get('dataVencimento')?.value;

    if (
      !dataInicio ||
      !dataVencimento
    ) {
      return;
    }

    if (
      new Date(dataVencimento) <=
      new Date(dataInicio)
    ) {
      this.form
        .get('dataVencimento')
        ?.setErrors({
          dataInvalida: true
        });

      return;
    }

    const controle =
      this.form.get('dataVencimento');

    if (
      controle?.hasError('dataInvalida')
    ) {
      controle.setErrors(null);

      controle.updateValueAndValidity({
        emitEvent: false
      });
    }
  }

  // =========================
  // SUBMIT
  // =========================

  onSubmit(): void {
    this.mensagemErro = [];

    this.mensagemSucesso = [];

    this.validarDatas();

    if (!this.podeEnviar) {
      this.form.markAllAsTouched();

      this.mensagemErro = [
        'Preencha todos os campos obrigatórios corretamente.'
      ];

      return;
    }

    this.carregando = true;

    this.cd.detectChanges();

    const formValue =
      this.form.getRawValue();

    const request: LicencaRequest = {
      escritorioId:
        formValue.escritorioId!,

      dataInicio:
        formValue.dataInicio!,

      dataVencimento:
        formValue.dataVencimento!,

      tipoPlano:
        Number(
          formValue.tipoPlano
        ) as TipoPlanoEnum,

      limiteUsuarios:
        Number(
          formValue.limiteUsuarios
        )
    };

    console.log(
      'Objeto request enviado:',
      JSON.stringify(request, null, 2)
    );

    this.licencaService
      .cadastrarLicenca(request)
      .pipe(
        finalize(() => {
          this.carregando = false;

          this.cd.detectChanges();
        })
      )
      .subscribe({
        next: (response) => {
          this.mensagemErro = [];

          this.mensagemSucesso = [
            response.message ??
            'Licença cadastrada com sucesso.'
          ];

          this.form.reset();

          this.cd.detectChanges();

          setTimeout(() => {
            this.router.navigate([
              '/admin/consultar-licencas'
            ]);
          }, 3000);
        },

        error: (e) => {
          this.tratarErro(e);
        }
      });
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
        'Ocorreu um erro inesperado ao cadastrar a licença.'
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

    this.cd.detectChanges();
  }
}