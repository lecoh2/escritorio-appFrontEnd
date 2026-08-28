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
  ActivatedRoute,
  Router
} from '@angular/router';

import {
  finalize,
  forkJoin
} from 'rxjs';

import { LicencaService } from '../../../../../core/services/licenca.service';
import { EscritorioService } from '../../../../../core/services/escritorio.service';

import { LicencaUpdateRequest } from '../../../../../core/models/licenca/licenca-update-request';
import { EscritorioResponse } from '../../../../../core/models/escritorio/escritorio-response';
import { TipoPlanoEnum } from '../../../../../core/models/enums/plano/tipo-plano-rnum';
import { StatusLicencaEnum } from '../../../../../core/models/enums/licenca/status-licenca-enum';



@Component({
  selector: 'app-editar-licenca',
  standalone: false,
  templateUrl: './editar-licenca.html',
  styleUrls: ['./editar-licenca.css']
})
export class EditarLicenca implements OnInit {

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

  private route =
    inject(ActivatedRoute);

  private cd =
    inject(ChangeDetectorRef);

  // =========================
  // ESTADOS
  // =========================

  carregando = false;

  carregandoConsulta = true;

  mensagemErro: string[] = [];

  mensagemSucesso: string[] = [];

  licencaId?: string;

  chaveLicenca = '';

  escritorios: EscritorioResponse[] = [];

  // =========================
  // ENUMS
  // =========================

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

  statusLicencas = [
    {
      id: StatusLicencaEnum.Pendente,
      nome: 'Pendente'
    },
    {
      id: StatusLicencaEnum.Ativa,
      nome: 'Ativa'
    },
    {
      id: StatusLicencaEnum.Suspensa,
      nome: 'Suspensa'
    },
    {
      id: StatusLicencaEnum.Cancelada,
      nome: 'Cancelada'
    },
    {
      id: StatusLicencaEnum.Expirada,
      nome: 'Expirada'
    }
  ];

  // =========================
  // FORMULÁRIO
  // =========================

  form = this.builder.group({
    id: [''],

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

    status: [
      null as StatusLicencaEnum | null,
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
    this.carregarDados();
  }

  // =========================
  // CARREGAR DADOS
  // =========================

  carregarDados(): void {
    const id =
      this.route.snapshot.paramMap.get('id');

    if (!id) {
      this.carregandoConsulta = false;

      this.mensagemErro = [
        'Id da licença não informado.'
      ];

      return;
    }

    this.licencaId = id;

    this.carregandoConsulta = true;

    forkJoin({
      licenca:
        this.licencaService
          .consultarLicencaPorId(id),

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
        next: (response: any) => {
          const licenca =
            response.licenca?.data ??
            response.licenca;

          this.escritorios =
            response.escritorios ?? [];

          this.chaveLicenca =
            licenca.chave ?? '';

          this.form.patchValue({
            id:
              licenca.id,

            escritorioId:
              licenca.escritorioId,

            dataInicio:
              this.formatarDataInput(
                licenca.dataInicio
              ),

            dataVencimento:
              this.formatarDataInput(
                licenca.dataVencimento
              ),

            tipoPlano:
              Number(
                licenca.tipoPlano
              ) as TipoPlanoEnum,

            status:
              Number(
                licenca.status
              ) as StatusLicencaEnum,

            limiteUsuarios:
              licenca.limiteUsuarios
          });

          this.cd.detectChanges();
        },

        error: (e) => {
          this.tratarErro(e);
        }
      });
  }

  // =========================
  // FORMATAR DATA
  // =========================

  private formatarDataInput(
    data?: string | null
  ): string {
    if (!data) {
      return '';
    }

    return data.substring(0, 10);
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

    const id =
      this.licencaId ??
      this.form.value.id;

    if (!id) {
      this.mensagemErro = [
        'Id da licença não informado.'
      ];

      return;
    }

    this.carregando = true;

    this.cd.detectChanges();

    const formValue =
      this.form.getRawValue();

    const request:
      LicencaUpdateRequest = {
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

        status:
          Number(
            formValue.status
          ) as StatusLicencaEnum,

        limiteUsuarios:
          Number(
            formValue.limiteUsuarios
          )
      };

    console.log(
      'Objeto request enviado para edição:',
      JSON.stringify(request, null, 2)
    );

    this.licencaService
      .editarLicencaPorId(
        id,
        request
      )
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
            'Licença atualizada com sucesso.'
          ];

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
        'Ocorreu um erro inesperado ao atualizar a licença.'
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